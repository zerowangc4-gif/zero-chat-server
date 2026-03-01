import { ExtendedError, Socket } from "socket.io";
import { MessageStatus } from "@/constants";

export type NextFunction = (err?: ExtendedError) => void;

export interface SocketType extends Socket {
  userId?: string;
}
export interface UserInfoType {
  address: string;
}
export interface ReceiveMessage {
  toId: string;
  content: string;
  clientMsgId: string;
}
export interface ChatMessage {
  chatId: string;
  fromId: string;
  id: string;
  content: string;
  status: MessageStatus;
  sessionSeqNum?: number;
  timestamp: number;
}

export type MessageAck = (data: ChatMessage) => void;
