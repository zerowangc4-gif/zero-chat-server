import { Server } from "socket.io";
import { SocketType, ClientAckResponse, AckError, ChatMessagePayload } from "./types";
import { SocketKeys } from "./roomHelper";
import { redis } from "@/config";
import { getErrorMessage } from "@/utils";
export async function saveOfflineMessage(toId: string, seqId: number, payload: ChatMessagePayload) {
  const offlineKey = SocketKeys.offlineQueue(toId);
  try {
    await redis
      .multi()
      .zAdd(offlineKey, { score: seqId, value: JSON.stringify(payload) })
      .zRemRangeByRank(offlineKey, 0, -1001)
      .expire(offlineKey, 3 * 24 * 3600)
      .exec();
  } catch (error: unknown) {
    throw error;
  }
}

export function registerPrivateChatHandlers(io: Server, socket: SocketType) {
  // 1. 发送消息
  socket.on("send_message", async (data, ack) => {
    try {
      const { content, clientMsgId } = data;

      if (!socket.userId) {
        return ack({ status: "failed", message: "Identity unverified" });
      }
      const fromId = socket.userId;
      const toId = data.toId;

      const chatKey = [fromId, toId].sort().join("_");

      const seqId = await redis.incr(`seq:chat:${chatKey}`);

      const payload: ChatMessagePayload = {
        seqId,
        fromId,
        toId,
        content,
        clientMsgId,
        timestamp: Date.now(),
      };

      const onlineSocketId = await redis.get(SocketKeys.onlineStatus(toId));

      if (!onlineSocketId) {
        await saveOfflineMessage(toId, seqId, payload);
        return ack({ status: "sentToServer", seqId });
      }

      const userRoomId = SocketKeys.userRoom(toId);
      io.to(userRoomId)
        .timeout(2000)
        .emit("new_message", payload, async (err: AckError, responses: ClientAckResponse[]) => {
          const Received = !err && responses?.length > 0;

          if (Received) {
            return ack({ status: "delivered", seqId });
          } else {
            await saveOfflineMessage(toId, seqId, payload);
            ack({ status: "sentToServer", seqId });
          }
        });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      ack({ status: "failed", message: message });
    }
  });

  // 已读回执接口
  socket.on("read_report", async data => {
    const { fromId, lastReadSeqId } = data;
    const readerId = socket.userId;
    const fromRoomId = SocketKeys.userRoom(fromId);

    io.to(fromRoomId).emit("message_read_update", {
      readerId: readerId,
      lastReadSeqId: lastReadSeqId,
    });
  });

  // 离线消息同步接口

  socket.on("sync_offline_messages", async (data, ack) => {
    try {
      const { lastSeqId } = data;
      const myId = socket.userId;
      if (!myId) return ack({ status: "failed", message: "Unverified" });

      const offlineKey = SocketKeys.offlineQueue(myId);

      const rawMessages = await redis.zRangeByScore(offlineKey, `(${lastSeqId}`, "+inf");

      if (!rawMessages || rawMessages.length === 0) {
        return ack({ status: "delivered", data: [], message: "Already up to date" });
      }

      const messages = rawMessages.map(msg => JSON.parse(msg));

      ack({ status: "delivered", data: messages });

      await redis.del(offlineKey);
    } catch (error) {
      const message = getErrorMessage(error);
      ack({ status: "failed", message: message });
    }
  });
}
