import { Response, NextFunction } from "express";

import { handleUpdateAvatar, handleGetContacts } from "@/services";
import { AppError, AuthRequest } from "@/types";
import { catchAsync, getformatUsers } from "@/utils";

export const updateAvatar = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { avatarSeed } = req.body;
    const address = req.address;
    if (!address || !avatarSeed) {
      throw new AppError(400, "Missing required parameters");
    }

    await handleUpdateAvatar(address, avatarSeed);

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: avatarSeed,
    });
  },
);

export const getContacts = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const address = req.address;
    if (!address) {
      throw new AppError(400, "Missing required parameters");
    }

    const users = await handleGetContacts(address);
    const formatUsers = getformatUsers(users);

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: formatUsers,
    });
  },
);
