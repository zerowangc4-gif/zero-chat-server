import { Request } from "express";
export interface TokenType {
  id: string;
  address: string;
}

export interface AuthRequest extends Request {
  address?: string;
}
