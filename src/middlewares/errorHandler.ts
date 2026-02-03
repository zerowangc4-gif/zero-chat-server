import { Request, Response, NextFunction } from "express";
import { AppError } from "@/types";

export const errorHandler = (error: AppError, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error.code || 500;
  const message = error.code ? error.message : "Internal Server Error";
  if (statusCode === 500) {
    console.error("出错地址:", req.originalUrl);
  }
  res.status(statusCode).json({
    success: false,
    message: message,
  });
};
