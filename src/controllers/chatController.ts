import { Response, NextFunction } from "express";
import { Message } from "@/socket";
import {
  handleSendMessage,
  handlesyncChatMessages,
  handleDeleteHavedSyncMessages,
  handleSyncHavedReadLatestMessage,
  handleSyncMessageStatus,
  handleSearchUserResult,
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

    const result = await handleSendMessage(req.address, message);

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
    const { activeChatId } = req.body;
    const messages = await handlesyncChatMessages(req.address, activeChatId);

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

    await handleDeleteHavedSyncMessages(req.address, message);

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

    const LatestMessage: Message = await handleSyncHavedReadLatestMessage(req.address, message);

    res.status(200).json({
      success: true,
      message: "sync have read  message successful",
      data: LatestMessage,
    });
  },
);

// 同步离线时的信息状态
export const syncMessageStatus = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.address) {
      throw new AppError(400, "Missing required parameters");
    }

    const targetMsgs = await handleSyncMessageStatus(req.address);

    res.status(200).json({
      success: true,
      message: "Sync messages successful",
      data: targetMsgs,
    });
  },
);

// 添加好友时，搜索用户信息
export const searchUserResult = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { address } = req.body;

    if (!address) {
      throw new AppError(400, "Missing required parameters");
    }

    const userInfo = await handleSearchUserResult(address);

    res.status(200).json({
      success: true,
      message: "search user info successful",
      data: userInfo,
    });
  },
);
