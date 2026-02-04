import { ExtendedError, Socket } from "socket.io";

export type NextFunction = (err?: ExtendedError) => void;

export interface SocketType extends Socket {
  userId?: string;
}
export interface UserInfoType {
  address: string;
}

export interface ClientAckResponse {
  status: "ok" | "error";
  receivedAt?: number;
}

export interface AckError {
  err: Error | null;
}

export interface ChatMessagePayload {
  seqId: number;
  from: string;
  to: string;
  content: string;
  clientMsgId: string;
  timestamp: number;
}
