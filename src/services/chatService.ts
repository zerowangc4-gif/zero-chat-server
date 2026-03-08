import { redis } from "@/config";

import {
  getSessionSeqNum,
  getSyncUserMsgSeqNum,
  getUserOfflineMessageKey,
  getLastMessageUserkey,
  getUserRoomId,
  getHaveReadUserMessageKey,
} from "@/metadata";
import { MESSAGE_STATUS } from "@/constants";
import { Message, io, EVENT } from "@/socket";

export async function handleSendMessage(message: Message): Promise<Message> {
  const sessionSeqNum = await getSessionSeqNum(message.fromId, message.toId, message.sessionSeqNum);
  const result = {
    ...message,
    sessionSeqNum: sessionSeqNum,
    timestamp: Date.now(),
    status: MESSAGE_STATUS.SENT_TO_SERVER,
  };

  const userOfflineMessageKey = getUserOfflineMessageKey(message.toId);

  const syncUserMsgSeqNum = await getSyncUserMsgSeqNum(message.toId);

  const messageJson = JSON.stringify(result);

  const fromUserLastMessageKey = getLastMessageUserkey(message.fromId);
  const toUserLastMessageKey = getLastMessageUserkey(message.toId);
  const userRoomId = getUserRoomId(message.toId);

  await redis
    .multi()
    .zAdd(userOfflineMessageKey, { score: syncUserMsgSeqNum, value: messageJson })
    .zRemRangeByRank(userOfflineMessageKey, 0, -1001)
    .expire(userOfflineMessageKey, 3 * 24 * 3600)
    .hSet(fromUserLastMessageKey, toUserLastMessageKey, JSON.stringify(result))
    .exec();

  if (io) {
    // 信号发出，通知接收方
    io.to(userRoomId).emit(EVENT.chat.chatMessage);
  }

  return result;
}

export async function handlesyncChatMessages(address: string): Promise<Message[]> {
  const userOfflineMessageKey = getUserOfflineMessageKey(address);

  const messagesJson = await redis.zRange(userOfflineMessageKey, 0, "+inf", {
    BY: "SCORE",
  });

  const messages: Message[] = messagesJson.map((item: string) => {
    return { ...JSON.parse(item), status: MESSAGE_STATUS.DELIVERED };
  });

  if (messages.length > 0) {
    const transaction = redis.multi();

    const latestMessages = new Map<string, Message>();

    messages.forEach(item => {
      latestMessages.set(item.fromId, item);
    });

    latestMessages.forEach((item, fromId) => {
      const fromUserLastMessageKey = getLastMessageUserkey(item.fromId);
      const toUserLastMessageKey = getLastMessageUserkey(item.toId);

      transaction.hSet(fromUserLastMessageKey, toUserLastMessageKey, JSON.stringify(item));

      if (io) {
        const userRoomId = getUserRoomId(fromId);
        io.to(userRoomId).emit(EVENT.chat.syncMessageStatus, {
          chatId: address,
          id: item.id,
          sessionSeqNum: item.sessionSeqNum,
          status: MESSAGE_STATUS.DELIVERED,
        });
      }
    });

    transaction.exec().catch(error => {
      console.error("批量更新对方账本失败:", error);
    });
  }

  return messages;
}

export async function handleDeleteHavedSyncMessages(message: Message): Promise<void> {
  const userOfflineMessageKey = getUserOfflineMessageKey(message.toId);

  const score = await redis.zScore(userOfflineMessageKey, JSON.stringify(message));

  if (score !== null) {
    await redis.zRemRangeByScore(userOfflineMessageKey, 0, score);
  }
}

export async function handleSyncHavedReadLatestMessage(message: Message): Promise<Message> {
  const toUserHaveReadKey = getHaveReadUserMessageKey(message.toId);
  const fromHaveReadKey = getHaveReadUserMessageKey(message.fromId);
  redis.hSet(toUserHaveReadKey, fromHaveReadKey, JSON.stringify(message));

  const fromUserLastMessageKey = getLastMessageUserkey(message.fromId);
  const toUserLastMessageKey = getLastMessageUserkey(message.toId);

  const messageJson = await redis.hGet(fromUserLastMessageKey, toUserLastMessageKey);

  if (messageJson) {
    const lastReadMessage: Message = JSON.parse(messageJson);
    if (lastReadMessage.id === message.id) {
      redis.hSet(
        fromUserLastMessageKey,
        toUserLastMessageKey,
        JSON.stringify({ ...message, status: MESSAGE_STATUS.READ }),
      );
    }
  }

  if (io) {
    const userRoomId = getUserRoomId(message.fromId);
    io.to(userRoomId).emit(EVENT.chat.syncMessageStatus, {
      chatId: message.toId,
      id: message.id,
      sessionSeqNum: message.sessionSeqNum,
      status: MESSAGE_STATUS.READ,
    });
  }
  return message;
}
