import { Response, NextFunction } from "express";
import { Message } from "@/socket";
import {
  handleSendMessage,
  handlesyncChatMessages,
  handleDeleteHavedSyncMessages,
  handleSyncHavedReadLatestMessage,
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
    if (!req.address) {
      throw new AppError(400, "Missing required parameters");
    }

    const messages = await handlesyncChatMessages(req.address);

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
      fromId,
      toId: req.address,
      sessionSeqNum,
      content,
      timestamp,
      type,
      status,
    } as Message;

    await handleDeleteHavedSyncMessages(message);

    res.status(200).json({
      success: true,
      message: "delete have sync  messages successful",
      data: null,
    });
  },
);

// 同步已经读过的最新信息
export const syncHavedReadLatestMessage = catchAsync(
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
      fromId,
      toId: req.address,
      sessionSeqNum,
      content,
      timestamp,
      type,
      status,
    } as Message;

    const LatestMessage: Message = await handleSyncHavedReadLatestMessage(message);

    res.status(200).json({
      success: true,
      message: "sync have read  message successful",
      data: LatestMessage,
    });
  },
);
