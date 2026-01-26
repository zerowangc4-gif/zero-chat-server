export const SocketKeys = {
  /**
   * 获取用户的个人 Socket 房间名
   */
  userRoom: (userId: string | number | undefined) => `room:user:${userId}`,

  /**
   * 获取群聊的 Socket 房间名
   */
  groupRoom: (groupId: string | number | undefined) => `room:group:${groupId}`,

  /**
   * Redis 中存储用户在线状态的 Key
   */
  onlineStatus: (userId: string | number | undefined) => `online:user:${userId}`,

  /**
   * Redis 中存储私聊消息序号的 Key
   */
  chatSeq: (chatKey: string | undefined) => `seq:chat:${chatKey}`,

  /**
   * Redis 中存储离线消息的 ZSET Key
   */
  offlineQueue: (userId: string | number | undefined) => `offline:msg:${userId}`,
};
