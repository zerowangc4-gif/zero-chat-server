export const userAllKey = "users:all";

//获取注册的所有用户的键
export function getAllUsersKey() {
  return "users:all";
}

//获取所有创建的键
export function getAllGroupsKey() {
  return "group:all";
}

//获取一对一聊天房间ID
export function getUserRoomId(userId: string) {
  const userRoomId = `room:user:${userId}`;
  return userRoomId;
}

//获取群聊天房间ID
export function getGroupRoomId(groupId: string) {
  const groupRoomId = `room:group:${groupId}`;
  return groupRoomId;
}

// 获取朋友们读我发消息的位置
export function getUserMessageStatusKey(userId: string): string {
  return `zeroChat:messageStatus:user:${userId}`;
}

//用户离线消息存储
export function getUserOfflineMessageKey(userId: string): string {
  return `zeroChat:offlineMessage:user:${userId}`;
}

//用户离线群消息存储
export function getGroupOfflineMessageKey(userId: string): string {
  return `zeroChat:offlineMessage:group:${userId}`;
}

//我加入的所有群
export function getMyJoinGroupsKey(userId: string): string {
  return `zeroChat:myJoinGroups:user:${userId}`;
}

//我创建的所有群
export function getMyCreateGroupsKey(userId: string): string {
  return `zeroChat:myCreateGroups:user:${userId}`;
}

// 群成员
export function getGroupMemberKey(groupId: string): string {
  return `zeroChat:member:group:${groupId}`;
}

// 群管理员
export function getGroupOwnerMemberKey(groupId: string): string {
  return `zeroChat:OwnerMember:group:${groupId}`;
}
