import { ExtendedError, Socket } from "socket.io";
import { MessageStatus, MessageType } from "@/constants";

interface TextContent {
  text: string;
}

type ContentType = TextContent;

export enum ChatType {
  SINGLE = "single",
  GROUP = "group",
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  sessionSeqNum: number | string;
  content: ContentType;
  timestamp: number;
  type: MessageType;
  status: MessageStatus;
}
export type NextFunction = (err?: ExtendedError) => void;

export interface SocketType extends Socket {
  userId?: string;
}

export interface UserInfoType {
  address: string;
}

export interface UserInfo {
  address: string;
  publicKey: string;
  username: string;
  avatarSeed: string;
}

export interface GroupBasicInfo {
  seq: number;
  ownerId: string;
  address: string;
  publicKey: string;
  groupName: string;
  avatarSeed: string;
  groupIntro: string;
  timestamp: number;
}

export interface TargetMsg {
  chatId: string;
  id: string;
  sessionSeqNum: number;
  status: MessageStatus;
}
