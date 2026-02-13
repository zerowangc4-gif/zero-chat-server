import jwt, { TokenExpiredError } from "jsonwebtoken";
import { AppError } from "@/types";
import { UserInfoType } from "@/sockets";
import { Request, Response, NextFunction } from "express";

export interface AuthReq extends Request {
  address?: string;
}

export const authMiddleware = (req: AuthReq, _res: Response, next: NextFunction) => {
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
      return next(new Error("at_expire"));
    }
    next(new Error("invalid_token"));
  }
};
