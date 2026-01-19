import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.code || 500;
  const message = err.isOperational ? err.message : "服务器冒烟了，请稍后再试";
  if (statusCode === 500) {
    console.error("🔥 致命错误:", err);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};
