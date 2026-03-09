import { updateAvatarSeed } from "@/models";
import { AppError } from "@/types";

export async function handlewechatLogin(address: string, avatarSeed: string): Promise<void> {
  await updateAvatarSeed(address, avatarSeed);
}
