export const userAllKey = "users:all";

//获取注册的所有用户的键
export function getAllUsersKey() {
  return "users:all";
}

//获取聊天房间ID
export function getUserRoomId(userId: string) {
  const userRoomId = `room:user:${userId}`;
  return userRoomId;
}

// 获取朋友们读我发消息的位置
export function getUserMessageStatusKey(userId: string): string {
  return `zeroChat:messageStatus:user:${userId}`;
}

//用户离线消息存储
export function getUserOfflineMessageKey(userId: string): string {
  return `zeroChat:offlineMessage:user:${userId}`;
}
