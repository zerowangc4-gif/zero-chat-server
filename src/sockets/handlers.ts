import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
interface SocketType extends Socket {
  userId?: string;
}
interface UserInfoType {
  address: string;
}
export function setupSocketHandlers(io: Server) {
  io.use(async (socket: SocketType, next) => {
    try {
      const token = socket.handshake.auth.token;
      const secret = process.env.JWT_SECRET;
      if (!token || !secret) {
        return next(new Error("Authentication failed: Missing credentials"));
      }
      const userInfo = jwt.verify(token, secret) as UserInfoType;
      const userId = userInfo.address;
      if (!userId) {
        return next(new Error("Authentication failed: User data missing"));
      }
      socket.userId = userId;
      next();
    } catch (err) {
      next(new Error("Authentication failed: Invalid token"));
    }
  });
  io.on("connection", (socket: Socket) => {});
}
