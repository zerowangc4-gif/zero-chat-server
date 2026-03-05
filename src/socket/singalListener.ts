import { SocketType, Message } from "./types";
import { EVENT } from "./events";
import {
  getLatestSyncUserMsgSeqNum,
  getOfflineKey,
  refreshUserOnlineStatus,
  removeReadOfflineMessages,
} from "./messageService";
import { redis } from "@/config";
export function singalListener(socket: SocketType) {
  const userId = socket.userId as string;

  socket.on(EVENT.system.heartBeat, async ack => {
    const LatestSyncUserMsgSeqNum = await getLatestSyncUserMsgSeqNum(userId);
    ack(LatestSyncUserMsgSeqNum);
    await refreshUserOnlineStatus(userId, socket.id);
  });

  socket.on(EVENT.chat.syncOffineMessages, async (syncUserMsgSeqNum: number, ack) => {
    try {
      const userId = socket.userId as string;
      const offlineKey = getOfflineKey(userId);
      const rawMessages = await redis.zRange(offlineKey, syncUserMsgSeqNum + 1, "+inf", {
        BY: "SCORE",
      });
      if (rawMessages && rawMessages.length > 0) {
        const messages = rawMessages.map(m => JSON.parse(m));
        ack(messages);
      } else {
        ack([]);
      }
    } catch (err: unknown) {
      ack([]);
      console.error(err);
    }
  });
  socket.on(EVENT.chat.removeOffineMessages, async (message: Message) => {
    const userId = socket.userId as string;
    await removeReadOfflineMessages(socket, userId, JSON.stringify(message));
  });
}
