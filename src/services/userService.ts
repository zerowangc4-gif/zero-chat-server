import { updateAvatarSeed, GetContacts } from "@/models";
import { AppError } from "@/types";
import { User } from "@/models";

export async function handleUpdateAvatar(address: string, avatarSeed: string): Promise<void> {
  if (!address || avatarSeed.trim() === "") {
    throw new AppError(400, "Avatar seed cannot be empty");
  }

  await updateAvatarSeed(address, avatarSeed);
}

export async function handleGetContacts(address: string): Promise<User[]> {
  if (!address) {
    throw new AppError(400, "address cannot be empty");
  }

  const users = await GetContacts(address);

  return users;
}
