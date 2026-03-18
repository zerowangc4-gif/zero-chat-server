import { Request } from "express";
export interface TokenType {
  address: string;
}

export interface AuthRequest extends Request {
  address?: string;
}
