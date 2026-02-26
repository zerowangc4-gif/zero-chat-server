import { ExtendedError, Socket } from "socket.io";

export type NextFunction = (err?: ExtendedError) => void;

export interface SocketType extends Socket {
  userId?: string;
}
export interface UserInfoType {
  address: string;
}

export interface ClientAckResponse {
  status: "delivered" | "failed";
  receivedAt?: number;
}

export interface AckError {
  err: Error | null;
}

export interface ChatMessagePayload {
  fromId: string;
  toId: string;
  syncUserMsgSeqNum?: number;
  sessionSeqNum: number;
  content: string;
  clientMsgId: string;
  timestamp: number;
}
