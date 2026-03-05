import { SocketType, Message } from "./types";
import { EVENT } from "./events";
import {
  getLatestSyncUserMsgSeqNum,
  refreshUserOnlineStatus,
  removeReadOfflineMessages,
} from "./MessageService";
export function singalListener(socket: SocketType) {
  const userId = socket.userId as string;

  socket.on(EVENT.system.heartBeat, async ack => {
    const LatestSyncUserMsgSeqNum = await getLatestSyncUserMsgSeqNum(userId);
    ack(LatestSyncUserMsgSeqNum);
    await refreshUserOnlineStatus(userId, socket.id);
  });

  socket.on(EVENT.chat.removeOffineMessages, async (message: Message) => {
    const userId = socket.userId as string;
    await removeReadOfflineMessages(socket, userId, JSON.stringify(message));
  });
}
