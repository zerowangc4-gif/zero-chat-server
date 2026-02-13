import { Request, Response, NextFunction } from "express";

import { handleUpdateAvatar } from "@/services";
import { AppError } from "@/types";
import { catchAsync } from "@/utils";

export const updateAvatar = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { address, avatarSeed } = req.body;

  if (!address || !avatarSeed) {
    throw new AppError(400, "Missing required parameters");
  }

  await handleUpdateAvatar(address, avatarSeed);

  res.status(200).json({
    success: true,
    message: "Authentication successful",
    data: avatarSeed,
  });
});
