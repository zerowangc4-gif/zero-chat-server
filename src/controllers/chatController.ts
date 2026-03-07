import { Response, NextFunction } from "express";
import { Message } from "@/socket";
import {
  handleSendMessage,
  handlesyncChatMessages,
  handleDeleteHavedSyncMessages,
} from "@/services";
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

// 接收消息

export const syncChatMessages = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { syncUserMsgSeqNum } = req.body;
    if (!req.address || typeof syncUserMsgSeqNum !== "number") {
      throw new AppError(400, "Missing required parameters");
    }

    const messages = await handlesyncChatMessages(req.address, syncUserMsgSeqNum);

    res.status(200).json({
      success: true,
      message: "Sync messages successful",
      data: messages,
    });
  },
);

// 删除已经同步过的信息
export const deleteHavedSyncMessages = catchAsync(
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

    const result = await handleDeleteHavedSyncMessages(message);

    res.status(200).json({
      success: true,
      message: "delete have sync  messages successful",
      data: result,
    });
  },
);
