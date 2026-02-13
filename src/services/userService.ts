import { updateAvatarSeed } from "@/models";
import { AppError } from "@/types";

export async function handleUpdateAvatar(address: string, avatarSeed: string): Promise<void> {
  if (!avatarSeed || avatarSeed.trim() === "") {
    throw new AppError(400, "Avatar seed cannot be empty");
  }

  await updateAvatarSeed(address, avatarSeed);
}
