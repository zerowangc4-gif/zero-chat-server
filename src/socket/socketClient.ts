import { Server } from "socket.io";
import { authSocketMiddleware } from "@/middlewares";
import { SocketType } from "./types";
import { getErrorMessage } from "@/utils";

import {
  clearUserOnlineValue,
  joinUserRoom,
  removeUserOnlineValue,
  setUserOnlineValue,
} from "./messageService";

export function SocketClient(ioInstance: Server) {
  ioInstance.use(authSocketMiddleware);

  ioInstance.on("connect", async (socket: SocketType) => {
    const userId = socket.userId;

    if (!userId) return;

    try {
      await removeUserOnlineValue(userId, socket.id, ioInstance);

      await setUserOnlineValue(userId, socket.id);

      await joinUserRoom(userId, socket);

      socket.on("disconnect", async () => {
        await clearUserOnlineValue(userId, socket.id);
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error("连接初始化失败:", message);
      socket.disconnect();
    }
  });
}
