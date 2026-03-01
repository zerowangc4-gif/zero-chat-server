import { Server } from "socket.io";
import { SocketType, ChatMessage, ReceiveMessage, MessageAck } from "./types";
import {
  getSessionSeqNum,
  getSyncUserMsgSeqNum,
  getUserOnlineValue,
  getOfflineKey,
  getUserRoomId,
  getLatestSyncUserMsgSeqNum,
  removeReadOfflineMessages,
} from "./roomHelper";
import { redis } from "@/config";

import { EVENT, MESSAGE_STATUS } from "@/constants";
export async function saveOfflineMessage(toId: string, payload: ChatMessage) {
  const offlineKey = getOfflineKey(toId);
  const syncUserMsgSeqNum = await getSyncUserMsgSeqNum(toId);
  await redis
    .multi()
    .zAdd(offlineKey, { score: syncUserMsgSeqNum, value: JSON.stringify(payload) })
    .zRemRangeByRank(offlineKey, 0, -1001)
    .expire(offlineKey, 3 * 24 * 3600)
    .exec();
}

export function registerPrivateChatHandlers(io: Server, socket: SocketType) {
  socket.on(EVENT.CHAT.SEND_MESSAGE, async (data: ReceiveMessage, ack: MessageAck) => {
    const { toId, content, clientMsgId } = data;
    const fromId = socket.userId as string;
    const sessionSeqNum = await getSessionSeqNum(fromId, toId);

    const payload: ChatMessage = {
      chatId: toId,
      fromId: fromId,
      id: clientMsgId,
      content: content,
      status: MESSAGE_STATUS.SENT_TO_SERVER,
      sessionSeqNum: sessionSeqNum,
      timestamp: Date.now(),
    };

    try {
      await saveOfflineMessage(toId, payload);
      const onlineValue = await getUserOnlineValue(payload.chatId);

      if (!onlineValue) {
        return ack(payload);
      }

      const userRoomId = getUserRoomId(payload.chatId);
      io.to(userRoomId)
        .timeout(2000)
        .emit(EVENT.CHAT.NEW_MESSAGE, payload, async (err: unknown, res: ChatMessage[]) => {
          if (err) {
            ack(payload);
          } else {
            ack(res[0] || payload);
          }
        });
    } catch (error: unknown) {
      ack(payload);
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

      socket.emit(
        EVENT.CHAT.SYNC_OFFINE_MESSAGES,
        messages,
        async (err: unknown, res: ChatMessage) => {
          if (!err && res) {
            await removeReadOfflineMessages(socket, userId, JSON.stringify(res));
          }
        },
      );
    }
  });
}
