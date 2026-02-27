import { Server } from "socket.io";
import { SocketType } from "./types";
import { redis } from "@/config";

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
    ioInstance.to(oldOnlineValue).emit("force_logout", {
      reason: "account_logged_in_elsewhere",
      time: Date.now(),
    });
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
