import { redis } from "@/config";

import {
  getSessionSeqNum,
  getSyncUserMsgSeqNum,
  getUserOfflineMessageKey,
  getUserRoomId,
  getUserMessageStatusKey,
} from "@/metadata";
import { MESSAGE_STATUS } from "@/constants";
import { Message, io, EVENT, TargetMsg } from "@/socket";

export async function handleSendMessage(address: string, message: Message): Promise<Message> {
  const sessionSeqNum = await getSessionSeqNum(address, message.toId, message.sessionSeqNum);
  message.sessionSeqNum = sessionSeqNum;
  message.timestamp = Date.now();
  message.status = MESSAGE_STATUS.SENT_TO_SERVER;

  const userOfflineMessageKey = getUserOfflineMessageKey(message.toId);

  const syncUserMsgSeqNum = await getSyncUserMsgSeqNum(message.toId);

  const messageJson = JSON.stringify(message);

  const userRoomId = getUserRoomId(message.toId);

  await redis
    .multi()
    .zAdd(userOfflineMessageKey, { score: syncUserMsgSeqNum, value: messageJson })
    .zRemRangeByRank(userOfflineMessageKey, 0, -1001)
    .expire(userOfflineMessageKey, 3 * 24 * 3600)
    .exec();

  if (io) {
    io.to(userRoomId).emit(EVENT.chat.chatMessage);
  }

  return message;
}

export async function handlesyncChatMessages(
  address: string,
  activeChatId: string,
): Promise<Message[]> {
  const userOfflineMessageKey = getUserOfflineMessageKey(address);
  const latestMessages = new Map<string, Message>();
  const transaction = redis.multi();
  const messagesJson = await redis.zRange(userOfflineMessageKey, 0, "+inf", {
    BY: "SCORE",
  });

  const messages: Message[] = messagesJson.map((item: string) => {
    const message = JSON.parse(item);
    const status = activeChatId === message.fromId ? MESSAGE_STATUS.READ : MESSAGE_STATUS.DELIVERED;
    message.status = status;
    latestMessages.set(message.fromId, message);
    return message;
  });
  latestMessages.forEach((item, fromId) => {
    const targetMsg: TargetMsg = {
      chatId: address,
      id: item.id,
      sessionSeqNum: parseInt(String(item.sessionSeqNum), 10),
      status: item.status,
    };
    const userMessageStatusKey = getUserMessageStatusKey(fromId);
    transaction.hSet(userMessageStatusKey, address, JSON.stringify(targetMsg));
    if (io) {
      const userRoomId = getUserRoomId(fromId);
      io.to(userRoomId).emit(EVENT.chat.syncMessageStatus, targetMsg);
    }
  });
  transaction.exec().catch(error => {
    console.error("批量更新对方账本失败:", error);
  });

  return messages;
}

export async function handleDeleteHavedSyncMessages(
  address: string,
  message: Message,
): Promise<void> {
  const userOfflineMessageKey = getUserOfflineMessageKey(address);

  const score = await redis.zScore(userOfflineMessageKey, JSON.stringify(message));

  if (score !== null) {
    await redis.zRemRangeByScore(userOfflineMessageKey, 0, score);
  }
}
export async function handleSyncHavedReadLatestMessage(
  address: string,
  message: Message,
): Promise<Message> {
  message.status = MESSAGE_STATUS.READ;
  const userMessageStatusKey = getUserMessageStatusKey(message.fromId);
  await redis.hSet(userMessageStatusKey, address, JSON.stringify(message));
  const targetMsg: TargetMsg = {
    chatId: address,
    id: message.id,
    sessionSeqNum: parseInt(String(message.sessionSeqNum), 10),
    status: message.status,
  };
  if (io) {
    const userRoomId = getUserRoomId(message.fromId);
    io.to(userRoomId).emit(EVENT.chat.syncMessageStatus, targetMsg);
  }
  return message;
}
export async function handleSyncMessageStatus(address: string): Promise<TargetMsg[]> {
  const userMessageStatusKey = getUserMessageStatusKey(address);
  const messageStatuses = await redis.hGetAll(userMessageStatusKey);
  if (!messageStatuses || Object.keys(messageStatuses).length == 0) {
    return [];
  }
  const targetMsgs: TargetMsg[] = Object.values(messageStatuses).map(targetMsgJson =>
    JSON.parse(targetMsgJson),
  );

  await redis.del(userMessageStatusKey);

  return targetMsgs;
}
