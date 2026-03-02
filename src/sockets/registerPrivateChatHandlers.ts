import { Server } from "socket.io";
import { SocketType, Message, MessageAck } from "./types";
import {
  getSessionSeqNum,
  getSyncUserMsgSeqNum,
  getUserOnlineValue,
  getOfflineKey,
  getUserRoomId,
  removeReadOfflineMessages,
} from "./roomHelper";
import { redis } from "@/config";

import { EVENT, MESSAGE_STATUS } from "@/constants";
export async function saveOfflineMessage(toId: string, message: Message) {
  const offlineKey = getOfflineKey(toId);
  const syncUserMsgSeqNum = await getSyncUserMsgSeqNum(toId);
  await redis
    .multi()
    .zAdd(offlineKey, { score: syncUserMsgSeqNum, value: JSON.stringify(message) })
    .zRemRangeByRank(offlineKey, 0, -1001)
    .expire(offlineKey, 3 * 24 * 3600)
    .exec();
}

export function registerPrivateChatHandlers(io: Server, socket: SocketType) {
  socket.on(EVENT.CHAT.SEND_MESSAGE, async (data: Message, ack: MessageAck) => {
    const { toId, content, id, type } = data;
    const fromId = socket.userId as string;
    const sessionSeqNum = await getSessionSeqNum(fromId, toId);

    const message: Message = {
      id: id,
      fromId: fromId,
      toId: toId,
      sessionSeqNum: sessionSeqNum,
      content: content,
      timestamp: Date.now(),
      type: type,
      status: MESSAGE_STATUS.SENT_TO_SERVER,
    };

    try {
      await saveOfflineMessage(toId, message);

      const onlineValue = await getUserOnlineValue(toId);

      if (!onlineValue) {
        return ack(message);
      }

      const userRoomId = getUserRoomId(toId);
      io.to(userRoomId)
        .timeout(2000)
        .emit(EVENT.CHAT.NEW_MESSAGE, message, async (err: unknown, res: Message[]) => {
          if (err) {
            ack(message);
          } else {
            ack(res[0] || message);
          }
        });
    } catch (error: unknown) {
      ack(message);
    }
  });

  socket.on(EVENT.CHAT.READ_REPORT, async data => {
    const { fromId, lastSessionSeqNum } = data;

    const userRoomId = getUserRoomId(fromId);

    io.to(userRoomId).emit(EVENT.CHAT.READ_UPDATE, {
      chatId: socket.userId,
      lastSessionSeqNum: lastSessionSeqNum,
    });
  });

  socket.on(EVENT.CHAT.SYNC_OFFINE_MESSAGES, async (syncUserMsgSeqNum: number) => {
    const userId = socket.userId as string;
    const offlineKey = getOfflineKey(userId);

    const rawMessages = await redis.zRange(offlineKey, syncUserMsgSeqNum + 1, "+inf", {
      BY: "SCORE",
    });

    if (rawMessages && rawMessages.length > 0) {
      const messages = rawMessages.map(m => JSON.parse(m));

      socket
        .timeout(5000)
        .emit(EVENT.CHAT.SYNC_OFFINE_MESSAGES, messages, async (err: unknown, message: Message) => {
          if (!err && message) {
            await removeReadOfflineMessages(socket, userId, JSON.stringify(message));
          }
        });
    } else {
      socket.emit(EVENT.CHAT.SYNC_OFFINE_MESSAGES, []);
    }
  });
}
