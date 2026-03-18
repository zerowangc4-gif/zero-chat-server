import jwt, { TokenExpiredError } from "jsonwebtoken";
import { AppError, TokenType } from "@/types";
import { RT_EXPIRE } from "@/constants";
export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "Server configuration error");
  }
  try {
    const decoded = jwt.verify(token, secret) as TokenType;
    const payload = { address: decoded.address };
    const newAccessToken = jwt.sign(payload, secret, {
      expiresIn: "5h",
    });
    const newRefreshToken = jwt.sign(payload, secret, {
      expiresIn: "30d",
    });

    return {
      newAccessToken,
      newRefreshToken,
    };
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      throw new AppError(401, RT_EXPIRE);
    }
    if (error instanceof TokenExpiredError) {
      throw new AppError(401, "invalid_token");
    }

    throw new AppError(401, "authentication_failed");
  }
}
