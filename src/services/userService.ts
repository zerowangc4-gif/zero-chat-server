import { getMyFriendsKey, getAllUsersKey, getUserRoomId } from "@/metadata";
import { redis } from "@/config";
import { UserInfo, io, EVENT } from "@/socket";
import { AppError } from "@/types";

export async function handleAddFriends(address: string, ids: string[]): Promise<UserInfo[]> {
  if (ids.length === 0) return [];

  const myFriendsKey = getMyFriendsKey(address);

  const usersKey = getAllUsersKey();

  //  值的数组和ids的长度一致，之后通过判断剔除无效的值
  const userJsons = await redis.hmGet(usersKey, ids);

  const userInfos: UserInfo[] = [];

  const friendIds: string[] = [];

  userJsons.forEach(item => {
    if (item) {
      const userInfo: UserInfo = JSON.parse(item);

      userInfos.push(userInfo);

      // 这里依旧会是一个以维数组，但是redis的 hset 会 0 1 | 2 3 这种形式的配对
      friendIds.push(userInfo.address, userInfo.address);
    }
  });

  if (friendIds.length > 0) {
    await redis.hSet(myFriendsKey, friendIds);
  }

  return userInfos;
}

export async function handleUpdateUserInfo(
  address: string,
  name: string,
  avatarSeed: string,
): Promise<UserInfo> {
  const usersKey = getAllUsersKey();

  const myFriendsKey = getMyFriendsKey(address);

  const userInfoJson = await redis.hGet(usersKey, address);

  if (!userInfoJson) {
    throw new AppError(400, "User not found on this platform");
  }
  const userInfo: UserInfo = JSON.parse(userInfoJson);
  userInfo.name = name;
  userInfo.avatarSeed = avatarSeed;
  await redis.hSet(usersKey, address, JSON.stringify(userInfo));

  const friendIds = await redis.hKeys(myFriendsKey);

  const friendRoomIds = friendIds.map((friendId: string) => {
    return getUserRoomId(friendId);
  });

  if (io) {
    io.to(friendRoomIds).emit(EVENT.user.updateFriendInfo, userInfo);
  }

  return userInfo;
}

export async function handleGetAllFriendInfo(address: string): Promise<UserInfo[]> {
  const usersKey = getAllUsersKey();
  const myFriendsKey = getMyFriendsKey(address);

  const friendIds = await redis.hKeys(myFriendsKey);

  if (!friendIds || friendIds.length === 0) {
    return [];
  }

  const friendInfoJsons = await redis.hmGet(usersKey, friendIds);

  const friendInfos: UserInfo[] = [];

  for (const item of friendInfoJsons) {
    if (item) {
      const friendInfo: UserInfo = JSON.parse(item);
      friendInfos.push(friendInfo);
    }
  }

  return friendInfos;
}
