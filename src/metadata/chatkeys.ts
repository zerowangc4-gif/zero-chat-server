//获取聊天房间ID
export function getUserRoomId(userId: string) {
  const userRoomId = `room:user:${userId}`;
  return userRoomId;
}

// 维护用户和好友的最后一条信息的存储和状态
export function getLastMessageUserkey(userId: string): string {
  return `zeroChat:lastMessage:userId:${userId}`;
}

//用户离线消息存储
export function getUserOfflineMessageKey(userId: string): string {
  return `zeroChat:offlineMessage:user:${userId}`;
}

//记录我读好友的信息的位置
export function getHaveReadUserMessageKey(userId: string): string {
  return `zeroChat:haveReadMessage:user:${userId}`;
}
