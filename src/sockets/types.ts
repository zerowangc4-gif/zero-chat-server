import { ExtendedError, Socket } from "socket.io";

export type NextFunction = (err?: ExtendedError) => void;

export interface SocketType extends Socket {
  userId?: string;
}
export interface UserInfoType {
  address: string;
}

export type MessageStatus = "pending" | "sentToServer" | "delivered" | "read" | "failed";

export interface ChatMessagePayload {
  chatId: string;
  formId: string;
  id: string;
  content: string;
  status: MessageStatus;
  sessionSeqNum?: number;
  timestamp: number;
}
