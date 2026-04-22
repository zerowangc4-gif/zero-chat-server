import { ExtendedError, Socket } from "socket.io";
import { MessageStatus, MessageType } from "@/constants";

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
  name: string;
  avatarSeed: string;
}

export interface GroupBasicInfo {
  seqNum: number;
  ownerId: string;
  address: string;
  publicKey: string;
  name: string;
  avatarSeed: string;
  groupIntro: string;
  timestamp: number;
}

interface TextContent {
  text: string;
}

type ContentType = TextContent | GroupBasicInfo;

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

export interface TargetMsg {
  chatId: string;
  id: string;
  sessionSeqNum: number;
  status: MessageStatus;
}
