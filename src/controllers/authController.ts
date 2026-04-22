import { Request, Response, NextFunction } from "express";

import { handleRegisterAndLogin, getTokens } from "@/services";
import { getAuthSlogan } from "@/metadata";
import { AppError } from "@/types";
import { catchAsync, verifyToken } from "@/utils";
import crypto from "crypto";
import { redis } from "@/config";

export const registerAndLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { address, publicKey, name, signature } = req.body;

    if (!address || !publicKey || !name || !signature) {
      throw new AppError(400, "Missing required parameters");
    }

    const result = await handleRegisterAndLogin(address, publicKey, name, signature);

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: result,
    });
  },
);

export const getNonce = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { address } = req.body;
  if (!address) {
    throw new AppError(400, "Missing required parameters");
  }
  const nonce = crypto.randomInt(100000, 999999).toString();
  const authSlogan = getAuthSlogan(nonce);
  await redis.set(address, nonce, { EX: 300 });
  res.status(200).json({
    success: true,
    data: authSlogan,
  });
});

export const handleRefreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError(400, "Missing required parameters");
    }
    const { newAccessToken, newRefreshToken } = verifyToken(refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  },
);

export const handleTokenRotate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken, address, signature } = req.body;

    if (!refreshToken || !address || !signature) {
      throw new AppError(400, "Missing required parameters");
    }

    const { newAccessToken, newRefreshToken } = await getTokens(refreshToken, address, signature);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  },
);
