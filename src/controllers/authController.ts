import { Request, Response, NextFunction } from "express";
import { loginOrRegister } from "@/services";
import { AppError } from "@/types";
import { catchAsync } from "@/utils";

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { address, publicKey, username } = req.body;

  if (!address || !publicKey || !username) {
    const error = new Error("缺失必要参数") as AppError;
    error.code = 400;
    throw error;
  }

  const result = await loginOrRegister(address, publicKey, username);

  res.status(200).json({
    success: true,
    message: "认证成功",
    data: result,
  });
});
