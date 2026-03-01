import jwt, { TokenExpiredError } from "jsonwebtoken";
import { AppError, AuthRequest } from "@/types";
import { UserInfoType } from "@/sockets";
import { Response, NextFunction } from "express";
import { AT_EXPIRE } from "@/constants";

export const authMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError(400, "No token provided"));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError(500, "Server configuration error"));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, secret) as UserInfoType;

    req.address = decoded.address;

    next();
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      return next(new Error(AT_EXPIRE));
    }
    next(new Error("invalid_token"));
  }
};
