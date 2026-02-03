import { Request, Response, NextFunction } from "express";

import { loginOrRegister } from "@/services";
import { AppError } from "@/types";
import { catchAsync, getAuthSlogan, getAuthNonceKey } from "@/utils";
import crypto from "crypto";
import { redis } from "@/config";

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { address, publicKey, username, signature } = req.body;

  if (!address || !publicKey || !username || !signature) {
    throw new AppError(400, "Missing required parameters");
  }

  const result = await loginOrRegister(address, publicKey, username, signature);

  res.status(200).json({
    success: true,
    message: "Authentication successful",
    data: result,
  });
});

export const getNonce = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log("dddddd", req);
  const { address } = req.body;
  if (!address) {
    throw new AppError(400, "Missing required parameters");
  }
  const nonce = crypto.randomInt(100000, 999999).toString();
  const authSlogan = getAuthSlogan(nonce);
  const authNonceKey = getAuthNonceKey(address);
  await redis.set(authNonceKey, nonce, { EX: 300 });
  res.status(200).json({
    success: true,
    data: authSlogan,
  });
});
