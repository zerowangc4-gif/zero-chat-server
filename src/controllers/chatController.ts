import { Response, NextFunction } from "express";
import { Message } from "@/socket";
import { handleSendMessage, handleGetOffineChatMessages } from "@/services";
import { AppError, AuthRequest } from "@/types";
import { catchAsync } from "@/utils";

// 发送消息
export const sendMessage = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id, fromId, toId, sessionSeqNum, content, timestamp, type, status } = req.body;

    if (
      !id ||
      !fromId ||
      !toId ||
      !sessionSeqNum ||
      !content ||
      !timestamp ||
      !type ||
      !status ||
      !req.address
    ) {
      throw new AppError(400, "Missing required parameters");
    }
    const message = {
      id,
      fromId: req.address,
      toId,
      sessionSeqNum,
      content,
      timestamp,
      type,
      status,
    } as Message;

    const result = await handleSendMessage(message);

    res.status(200).json({
      success: true,
      message: "send message successful",
      data: result,
    });
  },
);

// 获取离线消息
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
