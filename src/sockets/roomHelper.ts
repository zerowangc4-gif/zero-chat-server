import { Server } from "socket.io";
import { SocketType } from "./types";
import { redis } from "@/config";
import { EVENT } from "@/constants";
type IdType = string | number;

export function getUserOnlineKey(userId: IdType) {
  const onlineKey = `online:user:${userId}`;
  return onlineKey;
}

export async function getUserOnlineValue(userId: IdType) {
  const onlineKey = getUserOnlineKey(userId);
  const onlineValue = await redis.get(onlineKey);
  return onlineValue;
}
export async function setUserOnlineValue(userId: IdType, currentOnlineId: string) {
  const onlineKey = getUserOnlineKey(userId);
  await redis.set(onlineKey, currentOnlineId, { EX: 60 });
}
export async function removeUserOnlineValue(
  userId: IdType,
  currentOnlineId: string,
  ioInstance: Server,
) {
  const oldOnlineValue = await getUserOnlineValue(userId);
  if (oldOnlineValue && oldOnlineValue !== currentOnlineId) {
    ioInstance.to(oldOnlineValue).emit(EVENT.SYSTEM.FORCE_LOGOUT);
  }
}
export async function clearUserOnlineValue(userId: IdType, currentOnlineId: string) {
  const onlineKey = getUserOnlineKey(userId);

  const onlineValue = await getUserOnlineValue(userId);
  if (onlineValue === currentOnlineId) {
    await redis.del(onlineKey);
  }
}

export async function refreshUserOnlineStatus(userId: IdType, currentOnlineId: string) {
  const onlineKey = getUserOnlineKey(userId);
  const onlineValue = await getUserOnlineValue(userId);
  if (onlineValue === currentOnlineId) {
    await redis.expire(onlineKey, 60);
  }
}

export function getUserRoomId(userId: IdType) {
  const userRoomId = `room:user:${userId}`;
  return userRoomId;
}

export async function joinUserRoom(userId: IdType, socket: SocketType) {
  const userRoomId = getUserRoomId(userId);
  await socket.join(userRoomId);
}

export async function getSessionSeqNum(fromId: string, toId: string) {
  const sessionId = [fromId, toId].sort().join("_");
  const sessionSeqNum = await redis.incr(`seq:session:${sessionId}`);
  return sessionSeqNum;
}

export function getOfflineKey(userId: IdType) {
  const offlineKey = `offline:user:${userId}`;
  return offlineKey;
}
export async function getSyncUserMsgSeqNum(toId: string) {
  const syncUserMsgSeqNum = await redis.incr(`seq:syncUserMsg:${toId}`);
  return syncUserMsgSeqNum;
}

export async function getLatestSyncUserMsgSeqNum(userId: IdType) {
  const offlineKey = getOfflineKey(userId);

  const result = await redis.zRangeWithScores(offlineKey, -1, -1);

  if (result && result.length > 0) {
    return result[0].score;
  }

  return 0;
}

export async function removeReadOfflineMessages(
  socket: SocketType,
  userId: IdType,
  message: string,
) {
  const offlineKey = getOfflineKey(userId);

  // 1. 打印前端传回来的、你准备去匹配的字符串
  console.log("🔍 [前端传回] 准备匹配的消息字符串:", message);

  // 2. 打印 Redis 里真实存在的、最接近的一条消息
  // 我们取最后一条（分值最高的一条）来看看它长什么样
  const redisMessages = await redis.zRange(offlineKey, -1, -1);
  console.log("📦 [Redis存储] 目前最后一条消息原文:", redisMessages[0]);

  // 3. 执行匹配
  const score = await redis.zScore(offlineKey, message);
  console.log("📊 [匹配结果] 得到的 Score 是:", score);

  if (score !== null) {
    await redis.zRemRangeByScore(offlineKey, 0, score);
    socket.emit(EVENT.CHAT.UPDATE_SYNCUSERMSGSEQNUM, score);
  }
}
