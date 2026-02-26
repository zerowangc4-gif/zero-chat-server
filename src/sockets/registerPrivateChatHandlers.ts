import { Server } from "socket.io";
import { SocketType, ClientAckResponse, AckError, ChatMessagePayload } from "./types";
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
    try {
      const { content, clientMsgId } = data;

      if (!socket.userId) {
        return ack({ status: "failed", message: "Identity unverified" });
      }
      const fromId = socket.userId;
      const toId = data.toId;

      const sessionSeqNum = await getSessionSeqNum(fromId, toId);
      const syncUserMsgSeqNum = await getSyncUserMsgSeqNum(toId);

      const payload: ChatMessagePayload = {
        sessionSeqNum,
        syncUserMsgSeqNum,
        fromId,
        toId,
        content,
        clientMsgId,
        timestamp: Date.now(),
      };

      const onlineValue = await getUserOnlineValue(toId);

      if (!onlineValue) {
        await saveOfflineMessage(toId, syncUserMsgSeqNum, payload);
        return ack({ status: "sentToServer", sessionSeqNum });
      }

      const userRoomId = getUserRoomId(toId);
      io.to(userRoomId)
        .timeout(2000)
        .emit("new_message", payload, async (err: AckError, responses: ClientAckResponse[]) => {
          const Received = !err && responses?.length > 0;

          if (Received) {
            return ack({ status: "delivered", sessionSeqNum });
          } else {
            await saveOfflineMessage(toId, syncUserMsgSeqNum, payload);
            ack({ status: "sentToServer", sessionSeqNum });
          }
        });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      ack({ status: "failed", message: message });
    }
  });

  socket.on("read_report", async data => {
    const { fromId, lastReadSessionSeqNum } = data;
    const readerId = socket.userId;
    const fromRoomId = getUserRoomId(fromId);

    io.to(fromRoomId).emit("message_read_update", {
      readerId: readerId,
      lastSessionSeqNum: lastReadSessionSeqNum,
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
