import { AppError } from "@/types";
import { getAllUsersKey } from "@/metadata";
import { redis } from "@/config";
import { UserInfo } from "@/socket";
export async function handleUpdateAvatar(address: string, avatarSeed: string): Promise<void> {
  if (!address || avatarSeed.trim() === "") {
    throw new AppError(400, "Avatar seed cannot be empty");
  }
  const usersKey = getAllUsersKey();

  const userJson = await redis.hGet(usersKey, address);

  if (!userJson || typeof userJson !== "string") {
    throw new AppError(404, "User not found");
  }

  const userInfo: UserInfo = JSON.parse(userJson);

  userInfo.avatarSeed = avatarSeed;

  if (userJson) {
    await redis.hSet(usersKey, address, JSON.stringify(userInfo));
  }
}
