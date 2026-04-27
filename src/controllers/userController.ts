import { Response, NextFunction } from "express";

import { handleAddFriends, handleUpdateUserInfo, handleGetAllFriendInfo } from "@/services";
import { AppError, AuthRequest } from "@/types";
import { catchAsync } from "@/utils";

//添加好友
export const addFriends = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { ids } = req.body;

    const address = req.address;
    if (!address || !ids) {
      throw new AppError(400, "Missing required parameters");
    }

    const result = await handleAddFriends(address, ids);

    res.status(200).json({
      success: true,
      message: "add friends successful",
      data: result,
    });
  },
);

export interface UserInfo {
  name: string;
  publicKey: string;
  address: string;
  avatarSeed: string;
}
// 更新自己的信息（头像和用户名字）
export const updateUserInfo = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { name, publicKey, address, avatarSeed } = req.body;

    if (!address || !name || !publicKey || !avatarSeed || !req.address) {
      throw new AppError(400, "Missing required parameters");
    }

    const result = await handleUpdateUserInfo(req.address, name, avatarSeed);

    res.status(200).json({
      success: true,
      message: "update userinfo successful",
      data: result,
    });
  },
);

// 获取自己所有的好友信息
export const getAllFriendInfo = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.address) {
      throw new AppError(400, "Missing required parameters");
    }

    const result = await handleGetAllFriendInfo(req.address);

    res.status(200).json({
      success: true,
      message: "get all friendInfo successful",
      data: result,
    });
  },
);
