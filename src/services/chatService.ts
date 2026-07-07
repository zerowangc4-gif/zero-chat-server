import { redis } from "@/config";

import {
  getSessionSeqNum,
  getSyncUserMsgSeqNum,
  getUserOfflineMessageKey,
  getUserRoomId,
  getUserMessageStatusKey,
  getAllUsersKey,
  getAllGroupsKey,
  getMyJoinGroupsKey,
  getMyCreateGroupsKey,
  getGroupMemberKey,
  getGroupOwnerMemberKey,
  getGroupOfflineMessageKey,
  getGroupRoomId,
  getSyncGroupMsgSeqNum,
  DISTRIBUTE_LUA,
} from "@/metadata";
import { MESSAGE_STATUS } from "@/constants";
import { Message, GroupBasicInfo, io, EVENT, TargetMsg, UserInfo, GroupAllInfo } from "@/socket";
import { AppError } from "@/types";

export async function handleSendMessage(address: string, message: Message): Promise<Message> {
  const sessionSeqNum = await getSessionSeqNum(message.sessionSeqNum, message.toId, address);
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

export async function handleSyncChatMessages(
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
    console.error(error);
  });

  return messages;
}

export async function handleDeleteHavedSyncMessages(
  address: string,
  message: Message,
): Promise<void> {
  const userOfflineMessageKey = getUserOfflineMessageKey(address);

  const groupOfflineMessageKey = getGroupOfflineMessageKey(address);

  const messageJson = JSON.stringify(message);

  const userMessageScore = await redis.zScore(userOfflineMessageKey, messageJson);

  const groupMessageScore = await redis.zScore(groupOfflineMessageKey, messageJson);

  if (groupMessageScore !== null) {
    await redis.zRemRangeByScore(groupOfflineMessageKey, 0, groupMessageScore);
    return;
  }

  if (userMessageScore !== null) {
    await redis.zRemRangeByScore(userOfflineMessageKey, 0, userMessageScore);
  }
}
export async function handleSyncHavedReadLatestMessage(
  address: string,
  message: Message,
): Promise<Message> {
  message.status = MESSAGE_STATUS.READ;
  const userMessageStatusKey = getUserMessageStatusKey(message.fromId);

  const targetMsg: TargetMsg = {
    chatId: message.toId,
    id: message.id,
    sessionSeqNum: parseInt(String(message.sessionSeqNum), 10),
    status: message.status,
  };

  await redis.hSet(userMessageStatusKey, message.toId, JSON.stringify(targetMsg));

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

export async function handleSearchUserResult(address: string): Promise<UserInfo> {
  const usersKey = getAllUsersKey();

  const userInfoJson = await redis.hGet(usersKey, address);

  if (!userInfoJson) {
    throw new AppError(404, "User not found");
  }

  const userInfo: UserInfo = JSON.parse(userInfoJson);

  return userInfo;
}

export async function handleCreateGroup(groupBasicInfo: GroupBasicInfo): Promise<GroupBasicInfo> {
  const allGroupsKey = getAllGroupsKey();
  const myJoinGroupsKey = getMyJoinGroupsKey(groupBasicInfo.ownerId);
  const myCreateGroupsKey = getMyCreateGroupsKey(groupBasicInfo.ownerId);
  const groupMemberKey = getGroupMemberKey(groupBasicInfo.address);
  const groupOwnerMemberKey = getGroupOwnerMemberKey(groupBasicInfo.address);

  const pipeline = redis.multi();

  pipeline.hSet(myJoinGroupsKey, groupBasicInfo.address, groupBasicInfo.address);
  pipeline.hSet(myCreateGroupsKey, groupBasicInfo.address, groupBasicInfo.address);
  pipeline.hSet(groupMemberKey, groupBasicInfo.ownerId, groupBasicInfo.ownerId);
  pipeline.hSet(groupOwnerMemberKey, groupBasicInfo.ownerId, groupBasicInfo.ownerId);
  pipeline.hSet(allGroupsKey, groupBasicInfo.address, JSON.stringify(groupBasicInfo));
  await pipeline.exec();

  if (io) {
    const groupRoomId = getGroupRoomId(groupBasicInfo.address);
    const userRoomId = getUserRoomId(groupBasicInfo.ownerId);
    io.in(userRoomId).socketsJoin(groupRoomId);
  }
  return groupBasicInfo;
}

export async function handleSendGroupMessage(message: Message): Promise<Message> {
  const sessionSeqNum = await getSessionSeqNum(message.sessionSeqNum, message.toId);
  message.sessionSeqNum = sessionSeqNum;
  message.timestamp = Date.now();
  message.status = MESSAGE_STATUS.SENT_TO_SERVER;

  const groupMemberKey = getGroupMemberKey(message.toId);

  const memberIds = await redis.hKeys(groupMemberKey);

  if (memberIds.length === 0) return message;

  const groupOfflineMessageKeys = memberIds.map((id: string) => getGroupOfflineMessageKey(id));

  const syncGroupMsgSeqNum = await getSyncGroupMsgSeqNum(message.toId);

  const messageJson = JSON.stringify(message);

  await redis.eval(DISTRIBUTE_LUA, {
    keys: groupOfflineMessageKeys,
    arguments: [messageJson, syncGroupMsgSeqNum.toString(), (3 * 24 * 3600).toString()],
  });

  if (io) {
    const groupRoomId = getGroupRoomId(message.toId);
    io.to(groupRoomId).emit(EVENT.chat.groupChatMessage);
  }

  return message;
}

export async function handleSyncGroupChatMessages(
  address: string,
  activeChatId: string,
): Promise<Message[]> {
  const groupOfflineMessageKey = getGroupOfflineMessageKey(address);

  const latestMessages = new Map<string, Message>();

  const transaction = redis.multi();

  const messagesJson = await redis.zRange(groupOfflineMessageKey, 0, "+inf", {
    BY: "SCORE",
  });

  const messages: Message[] = messagesJson.map((item: string) => {
    const message = JSON.parse(item);
    const status = activeChatId === message.toId ? MESSAGE_STATUS.READ : MESSAGE_STATUS.DELIVERED;
    message.status = status;
    latestMessages.set(message.toId, message);
    return message;
  });
  latestMessages.forEach((item, toId) => {
    const targetMsg: TargetMsg = {
      chatId: toId,
      id: item.id,
      sessionSeqNum: parseInt(String(item.sessionSeqNum), 10),
      status: item.status,
    };
    const userMessageStatusKey = getUserMessageStatusKey(item.fromId);

    transaction.hSet(userMessageStatusKey, toId, JSON.stringify(targetMsg));
    if (io) {
      const userRoomId = getUserRoomId(item.fromId);
      io.to(userRoomId).emit(EVENT.chat.syncMessageStatus, targetMsg);
    }
  });
  transaction.exec().catch(error => {
    console.error(error);
  });

  return messages;
}
export async function handleJoinGroup(address: string, groupId: string): Promise<GroupBasicInfo> {
  const allGroupsKey = getAllGroupsKey();
  const myJoinGroupsKey = getMyJoinGroupsKey(address);
  const groupMemberKey = getGroupMemberKey(groupId);

  const pipeline = redis.multi();
  pipeline.hSet(myJoinGroupsKey, groupId, groupId);
  pipeline.hSet(groupMemberKey, address, address);
  pipeline.hGet(allGroupsKey, groupId);

  const results = await pipeline.exec();

  if (!results) {
    throw new Error("Redis transaction failed");
  }

  const groupBasicInfoJson = results[2] as unknown as string;

  const groupBasicInfo = JSON.parse(groupBasicInfoJson || "{}");

  if (io) {
    const groupRoomId = getGroupRoomId(groupId);
    const userRoomId = getUserRoomId(address);
    io.in(userRoomId).socketsJoin(groupRoomId);
  }

  return groupBasicInfo;
}

export async function handleGetGroupAllInfo(
  groupId: string,
  ownerId: string,
): Promise<GroupAllInfo> {
  const usersKey = getAllUsersKey();
  const groupMemberKey = getGroupMemberKey(groupId);
  const groupOwnerMemberKey = getGroupOwnerMemberKey(groupId);

  const [groupMemberIds, groupOwnerMemberIds] = await Promise.all([
    redis.hKeys(groupMemberKey),
    redis.hKeys(groupOwnerMemberKey),
  ]);

  const [groupMemberInfoJson, groupOwnerMemberInfoJson, ownerJson] = await Promise.all([
    redis.hmGet(usersKey, groupMemberIds),
    redis.hmGet(usersKey, groupOwnerMemberIds),
    redis.hGet(usersKey, ownerId),
  ]);

  const groupMembers: UserInfo[] = [];

  const groupOwnerMembers: UserInfo[] = [];

  groupMemberInfoJson.forEach(item => {
    if (item) {
      groupMembers.push(JSON.parse(item));
    }
  });

  groupOwnerMemberInfoJson.forEach(item => {
    if (item) {
      groupOwnerMembers.push(JSON.parse(item));
    }
  });

  const Owner: UserInfo = JSON.parse(ownerJson as string);

  return {
    Owner,
    groupOwnerMembers,
    groupMembers,
  };
}
