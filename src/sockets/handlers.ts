import { Server } from "socket.io";
import { authMiddleware } from "./authMiddleware";
import { SocketType } from "./types";
import { getErrorMessage } from "@/utils";
import { registerPrivateChatHandlers } from "./registerPrivateChatHandlers";
import {
  removeUserOnlineValue,
  joinUserRoom,
  setUserOnlineValue,
  refreshUserOnlineStatus,
  clearUserOnlineValue,
} from "./roomHelper";
import { AppError } from "@/types";
import { EVENT } from "@/constants";
export function setupSocketHandlers(ioInstance: Server) {
  ioInstance.use(authMiddleware);

  ioInstance.on(EVENT.SYSTEM.CONNECT, async (socket: SocketType) => {
    const userId = socket.userId;

    try {
      if (!userId) {
        throw new AppError(400, "Invalid userId format");
      }
      await removeUserOnlineValue(userId, socket.id, ioInstance);

      await setUserOnlineValue(userId, socket.id);

      await joinUserRoom(userId, socket);

      registerPrivateChatHandlers(ioInstance, socket);

      socket.on(EVENT.SYSTEM.HEARTBEAT, async () => {
        await refreshUserOnlineStatus(userId, socket.id);
      });

      socket.on(EVENT.SYSTEM.DISCONNECT, async () => {
        await clearUserOnlineValue(userId, socket.id);
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error("连接初始化失败:", message);
      socket.disconnect();
    }
  });
}
