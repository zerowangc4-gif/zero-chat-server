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

export type MessageAck = (data: Message) => void;
