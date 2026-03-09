import { Response, NextFunction } from "express";

import { handleGetContacts } from "@/services";
import { AppError, AuthRequest } from "@/types";
import { catchAsync, getformatUsers } from "@/utils";

export const wechatLogin = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: "你好请求成功了",
    });
  },
);
