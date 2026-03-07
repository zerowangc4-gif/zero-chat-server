import { Server } from "socket.io";
import { authSocketMiddleware } from "@/middlewares";
import { getUserRoomId } from "@/metadata";
import { SocketType } from "./types";
export function SocketClient(ioInstance: Server) {
  ioInstance.use(authSocketMiddleware);

  ioInstance.on("connect", async (socket: SocketType) => {
    const userId = socket.userId;

    if (!userId) return;

    try {
      const userRoomId = getUserRoomId(userId);
      await socket.join(userRoomId);

      socket.on("disconnect", async () => {
        console.log(`用户: ${userRoomId} 离线了`);
      });
    } catch (error: unknown) {
      console.error("连接初始化失败:", error);
      socket.disconnect();
    }
  });
}
