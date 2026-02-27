import { Server } from "socket.io";
import { SocketType, ChatMessagePayload } from "./types";
import {
  getSessionSeqNum,
  getSyncUserMsgSeqNum,
  getUserOnlineValue,
  getOfflineKey,
  getUserRoomId,
} from "./roomHelper";
import { redis } from "@/config";
import { getErrorMessage } from "@/utils";
export async function saveOfflineMessage(
  toId: string,
  syncUserMsgSeqNum: number,
  payload: ChatMessagePayload,
) {
  const offlineKey = getOfflineKey(toId);
  await redis
    .multi()
    .zAdd(offlineKey, { score: syncUserMsgSeqNum, value: JSON.stringify(payload) })
    .zRemRangeByRank(offlineKey, 0, -1001)
    .expire(offlineKey, 3 * 24 * 3600)
    .exec();
}

export function registerPrivateChatHandlers(io: Server, socket: SocketType) {
  socket.on("send_message", async (data, ack) => {
    const { toId, content, clientMsgId } = data;
    const fromId = socket.userId as string;
    const sessionSeqNum = await getSessionSeqNum(fromId, toId);

    const syncUserMsgSeqNum = await getSyncUserMsgSeqNum(toId);

    const payload: ChatMessagePayload = {
      chatId: toId,
      formId: fromId,
      id: clientMsgId,
      content: content,
      status: "sentToServer",
      sessionSeqNum: sessionSeqNum,
      timestamp: Date.now(),
    };
    try {
      const onlineValue = await getUserOnlineValue(payload.chatId);

      if (!onlineValue) {
        return ack(payload);
      }

      const userRoomId = getUserRoomId(payload.chatId);
      io.to(userRoomId)
        .timeout(2000)
        .emit("new_message", payload, async (err: unknown, res: ChatMessagePayload[]) => {
          if (err) {
            ack(payload);
          } else {
            ack(res[0] || payload);
          }
        });
    } catch (error: unknown) {
      console.error(error);
      ack(payload);
    }
  });

  socket.on("read_report", async data => {
    const { fromId, lastSessionSeqNum } = data;

    const userRoomId = getUserRoomId(fromId);

    console.log(userRoomId);

    io.to(userRoomId).emit("message_read_update", {
      chatId: socket.userId,
      lastSessionSeqNum: lastSessionSeqNum,
    });
  });

  socket.on("sync_offline_messages", async (data, ack) => {
    try {
      const { lastSyncUserMsgSeqNum } = data;

      const myId = socket.userId;

      if (!myId) return ack({ status: "failed", message: "Unverified" });

      const offlineKey = getOfflineKey(myId);

      const messages = await redis.zRangeByScore(offlineKey, `(${lastSyncUserMsgSeqNum}`, "+inf");

      if (!messages || messages.length === 0) {
        return ack({ status: "delivered", data: [], message: "Already Received message" });
      }

      const formatMessages = messages.map(msg => JSON.parse(msg));

      ack({ status: "delivered", data: formatMessages });
    } catch (error) {
      const message = getErrorMessage(error);
      ack({ status: "failed", message: message });
    }
  });
}
