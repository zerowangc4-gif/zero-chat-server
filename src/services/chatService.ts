import { redis } from "@/config";
import { getOfflineKey, Message } from "@/socket";
import { AppError } from "@/types";

export async function handleGetOffineChatMessages(
  address: string,
  syncUserMsgSeqNum: number,
): Promise<Message[]> {
  if (!address || typeof syncUserMsgSeqNum !== "number") {
    throw new AppError(400, "Invalid  params");
  }
  const offlineKey = getOfflineKey(address);
  const rawMessages = await redis.zRange(offlineKey, syncUserMsgSeqNum + 1, "+inf", {
    BY: "SCORE",
  });
  if (rawMessages && rawMessages.length > 0) {
    const messages: Message[] = rawMessages.map(m => JSON.parse(m));
    return messages;
  } else {
    return [];
  }
}
