import jwt, { TokenExpiredError } from "jsonwebtoken";
import { SocketType, NextFunction, UserInfoType } from "./types";

export async function authMiddleware(socket: SocketType, next: NextFunction) {
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
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      return next(new Error("at_expire"));
    }
    if (err instanceof Error) {
      return next(new Error("invalid_token"));
    }
    next(new Error("internal_error"));
  }
}
