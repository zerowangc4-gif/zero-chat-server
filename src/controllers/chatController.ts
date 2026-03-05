import { Response, NextFunction } from "express";

import { handleGetOffineChatMessages } from "@/services";
import { AppError, AuthRequest } from "@/types";
import { catchAsync } from "@/utils";

export const getOffineChatMessages = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const address = req.address;
    const { syncUserMsgSeqNum } = req.body;
    if (!address) {
      throw new AppError(400, "Missing required parameters");
    }
    const messages = await handleGetOffineChatMessages(address, syncUserMsgSeqNum);

    res.status(200).json({
      success: true,
      message: "pull message successful",
      data: messages,
    });
  },
);
