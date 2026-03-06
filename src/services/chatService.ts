import { redis } from "@/config";
import {
  getSessionSeqNum,
  getSyncUserMsgSeqNum,
  getUserOfflineMessageKey,
  getLastMessageUserkey,
} from "@/metadata";
import { MESSAGE_STATUS } from "@/constants";
import { getOfflineKey, Message } from "@/socket";
import { AppError } from "@/types";

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

  await redis
    .multi()
    .zAdd(userOfflineMessageKey, { score: syncUserMsgSeqNum, value: messageJson })
    .zRemRangeByRank(userOfflineMessageKey, 0, -1001)
    .expire(userOfflineMessageKey, 3 * 24 * 3600)
    .hSet(fromUserLastMessageKey, toUserLastMessageKey, JSON.stringify(result))
    .exec();

  return result;
}

// 获取离线消息
export async function handleGetOffineChatMessages(
  address: string,
  syncUserMsgSeqNum: number,
): Promise<Message[]> {
  if (!address || typeof syncUserMsgSeqNum !== "number") {
    throw new AppError(400, "Invalid  params");
  }
  const offlineKey = getOfflineKey(address);
  const rawMessages = await redis.zRange(offlineKey, syncUserMsgSeqNum + 1, "+inf", {
    BY: "SCORE",
  });
  if (rawMessages && rawMessages.length > 0) {
    const messages: Message[] = rawMessages.map(m => JSON.parse(m));
    return messages;
  } else {
    return [];
  }
}
