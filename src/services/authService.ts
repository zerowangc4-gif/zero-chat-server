import jwt from "jsonwebtoken";
import { verifyMessage } from "ethers";
import { findByAddress, createUser } from "@/models";
import { AppError, TokenType } from "@/types";
import { getAuthSlogan, getAuthNonceKey } from "@/utils";
import { redis } from "@/config";
export async function loginOrRegister(
  address: string,
  publicKey: string,
  username: string,
  signature: string,
) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "Server configuration error");
  }
  const authNonceKey = getAuthNonceKey(address);
  const nonce = await redis.get(authNonceKey);
  if (!nonce) {
    throw new AppError(400, "Verification code expired");
  }
  const authSlogan = getAuthSlogan(nonce);
  const recoveredAddress = verifyMessage(authSlogan, signature);
  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new AppError(401, "Authentication failed");
  }

  await redis.del(authNonceKey);

  let user = await findByAddress(address);
  if (!user) {
    user = await createUser(username, publicKey, address);
  }
  const payload = {
    id: user.id,
    address: user.address,
  };
  const accessToken = jwt.sign(payload, secret, { expiresIn: "5h" });
  const refreshToken = jwt.sign(payload, secret, { expiresIn: "30d" });

  return {
    user: {
      id: user.id,
      username: user.username,
      address: user.address,
      publicKey: user.public_key,
    },
    accessToken,
    refreshToken,
  };
}
export async function getTokens(token: string, address: string, signature: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "Server configuration error");
  }
  const decoded = jwt.decode(token) as TokenType | null;

  if (!decoded || typeof decoded !== "object" || !decoded.address) {
    throw new AppError(400, "Invalid token format");
  }

  const authNonceKey = getAuthNonceKey(address);
  const nonce = await redis.get(authNonceKey);
  if (!nonce) {
    throw new AppError(400, "Verification code expired");
  }
  const authSlogan = getAuthSlogan(nonce);
  const recoveredAddress = verifyMessage(authSlogan, signature);
  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new AppError(400, "Authentication failed");
  }

  await redis.del(authNonceKey);
  const payload: TokenType = { id: decoded.id, address: decoded.address };
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
}
