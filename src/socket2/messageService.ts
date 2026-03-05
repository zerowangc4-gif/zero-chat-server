import { Server } from "socket.io";
import { Message, SocketType } from "./types";
import { redis } from "@/config";
import { EVENT } from "./events";
import { updateSyncUserChatMessageNum } from "./emitter";
type IdType = string | number;

// 个人信息缓存
export async function saveOfflineMessage(toId: string, message: Message) {
  const offlineKey = getOfflineKey(toId);
  const syncUserMsgSeqNum = await getSyncUserMsgSeqNum(toId);
  await redis
    .multi()
    .zAdd(offlineKey, { score: syncUserMsgSeqNum, value: JSON.stringify(message) })
    .zRemRangeByRank(offlineKey, 0, -1001)
    .expire(offlineKey, 3 * 24 * 3600)
    .exec();
}

// 获取在线key
export function getUserOnlineKey(userId: IdType) {
  const onlineKey = `online:user:${userId}`;
  return onlineKey;
}

// 获取在线的用户
export async function getUserOnlineValue(userId: IdType) {
  const onlineKey = getUserOnlineKey(userId);
  const onlineValue = await redis.get(onlineKey);
  return onlineValue;
}

// 存储在线值
export async function setUserOnlineValue(userId: IdType, currentOnlineId: string) {
  const onlineKey = getUserOnlineKey(userId);
  await redis.set(onlineKey, currentOnlineId, { EX: 60 });
}

// 删除已读信息
export async function removeUserOnlineValue(
  userId: IdType,
  currentOnlineId: string,
  ioInstance: Server,
) {
  const oldOnlineValue = await getUserOnlineValue(userId);
  if (oldOnlineValue && oldOnlineValue !== currentOnlineId) {
    ioInstance.to(oldOnlineValue).emit(EVENT.system.forceLogout);
  }
}

// 下线时清除在线值
export async function clearUserOnlineValue(userId: IdType, currentOnlineId: string) {
  const onlineKey = getUserOnlineKey(userId);

  const onlineValue = await getUserOnlineValue(userId);
  if (onlineValue === currentOnlineId) {
    await redis.del(onlineKey);
  }
}

// 心跳的时候更新存活时间
export async function refreshUserOnlineStatus(userId: IdType, currentOnlineId: string) {
  const onlineKey = getUserOnlineKey(userId);
  const onlineValue = await getUserOnlineValue(userId);
  if (onlineValue === currentOnlineId) {
    await redis.expire(onlineKey, 60);
  }
}

// 获取用户在线ID
export function getUserRoomId(userId: IdType) {
  const userRoomId = `room:user:${userId}`;
  return userRoomId;
}

// 加入个人聊天室
export async function joinUserRoom(userId: IdType, socket: SocketType) {
  const userRoomId = getUserRoomId(userId);
  await socket.join(userRoomId);
}

// 获取会话序号
export async function getSessionSeqNum(fromId: string, toId: string) {
  const sessionId = [fromId, toId].sort().join("_");
  const sessionSeqNum = await redis.incr(`seq:session:${sessionId}`);
  return sessionSeqNum;
}
// 获取离线key
export function getOfflineKey(userId: IdType) {
  const offlineKey = `offline:user:${userId}`;
  return offlineKey;
}
// 获取同步信号
export async function getSyncUserMsgSeqNum(toId: string) {
  const syncUserMsgSeqNum = await redis.incr(`seq:syncUserMsg:${toId}`);
  return syncUserMsgSeqNum;
}

// 获取最新的同步序号
export async function getLatestSyncUserMsgSeqNum(userId: IdType) {
  const offlineKey = getOfflineKey(userId);

  const result = await redis.zRangeWithScores(offlineKey, -1, -1);

  if (result && result.length > 0) {
    return result[0].score;
  }

  return 0;
}

// 删除已经看过的离线信息
export async function removeReadOfflineMessages(
  socket: SocketType,
  userId: IdType,
  message: string,
) {
  const offlineKey = getOfflineKey(userId);

  const score = await redis.zScore(offlineKey, message);

  if (score !== null) {
    await redis.zRemRangeByScore(offlineKey, 0, score);
    await updateSyncUserChatMessageNum(socket, score);
  }
}
