import { ExtendedError, Socket } from "socket.io";
import { MessageStatus, MessageType } from "@/constants";

export type NextFunction = (err?: ExtendedError) => void;

export interface SocketType extends Socket {
  userId?: string;
}
export interface UserInfoType {
  address: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  sessionSeqNum: number | string;
  content: string;
  timestamp: number;
  type: MessageType;
  status: MessageStatus;
}

export interface UserInfo {
  address: string;
  publicKey: string;
  username: string;
  avatarSeed: string;
}

export interface TargetMsg {
  chatId: string;
  id: string;
  sessionSeqNum: number;
  status: MessageStatus;
}
