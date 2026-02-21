import { Server } from "socket.io";
import { authMiddleware } from "./authMiddleware";
import { SocketType } from "./types";
import { redis } from "@/config";
import { getErrorMessage } from "@/utils";
import { registerPrivateChatHandlers } from "./registerPrivateChatHandlers";
import { SocketKeys } from "./roomHelper";
export function setupSocketHandlers(ioInstance: Server) {
  ioInstance.use(authMiddleware);

  ioInstance.on("connection", async (socket: SocketType) => {
    const userId = socket.userId?.toLowerCase();
    const currentSocketId = socket.id;
    const onlineKey = SocketKeys.onlineStatus(userId);
    const userRoomId = SocketKeys.userRoom(userId);

    try {
      const oldSocketId = await redis.get(onlineKey);

      if (oldSocketId && oldSocketId !== currentSocketId) {
        ioInstance.to(oldSocketId).emit("force_logout", {
          reason: "account_logged_in_elsewhere",
          time: Date.now(),
        });
      }

      await redis.set(onlineKey, currentSocketId, { EX: 60 });

      await socket.join(userRoomId);

      // 注册私聊
      registerPrivateChatHandlers(ioInstance, socket);

      socket.on("client_heartbeat", async () => {
        const validId = await redis.get(onlineKey);
        if (validId === currentSocketId) {
          await redis.expire(onlineKey, 60);
        }
      });

      socket.on("disconnect", async () => {
        const storedId = await redis.get(onlineKey);
        if (storedId === currentSocketId) {
          await redis.del(onlineKey);
        }
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error("连接初始化失败:", message);
      socket.disconnect();
    }
  });
}
