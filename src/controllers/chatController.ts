import { Response, NextFunction } from "express";
import { Message, GroupBasicInfo } from "@/socket";
import {
  handleSendMessage,
  handleSyncChatMessages,
  handleDeleteHavedSyncMessages,
  handleSyncHavedReadLatestMessage,
  handleSyncMessageStatus,
  handleSearchUserResult,
  handleCreateGroup,
  handleSendGroupMessage,
  handleSyncGroupChatMessages,
  handleJoinGroup,
} from "@/services";
import { getLastGroupSeqNum } from "@/metadata";
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
    const messages = await handleSyncChatMessages(req.address, activeChatId);

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
      toId,
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
      toId,
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

//

// 创建群组时，获取最新的群组号，以便根据主私钥派生出副本账号
export const getGroupSeqNum = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.address) {
      throw new AppError(400, "Missing required parameters");
    }

    const groupSequence = await getLastGroupSeqNum(req.address);

    res.status(200).json({
      success: true,
      message: "get group sequence is successful",
      data: groupSequence,
    });
  },
);

// 创建群组
export const createGroup = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { seqNum, ownerId, address, publicKey, name, avatarSeed, groupIntro, timestamp } =
      req.body;

    if (
      !seqNum ||
      !ownerId ||
      !address ||
      !publicKey ||
      !name ||
      !avatarSeed ||
      !groupIntro ||
      !timestamp ||
      !req.address
    ) {
      throw new AppError(400, "Missing required parameters");
    }
    const groupBasicInfo = {
      seqNum,
      ownerId: req.address,
      address,
      publicKey,
      name,
      avatarSeed,
      groupIntro,
      timestamp,
    } as GroupBasicInfo;

    const result = await handleCreateGroup(groupBasicInfo);

    res.status(200).json({
      success: true,
      message: "create group  is successful",
      data: result,
    });
  },
);

// 发送群消息
export const sendGroupMessage = catchAsync(
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

    const result = await handleSendGroupMessage(message);

    res.status(200).json({
      success: true,
      message: "send message successful",
      data: result,
    });
  },
);

// 同步群信息
export const syncGroupChatMessages = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.address) {
      throw new AppError(400, "Missing required parameters");
    }
    const { activeChatId } = req.body;
    const messages = await handleSyncGroupChatMessages(req.address, activeChatId);

    res.status(200).json({
      success: true,
      message: "Sync messages successful",
      data: messages,
    });
  },
);

// 加入聊天群
export const joinGroup = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { groupId } = req.body;
    if (!req.address || !groupId) {
      throw new AppError(400, "Missing required parameters");
    }
    const { activeChatId } = req.body;

    const result = await handleJoinGroup(req.address, groupId);

    res.status(200).json({
      success: true,
      message: "join group successful",
      data: result,
    });
  },
);
