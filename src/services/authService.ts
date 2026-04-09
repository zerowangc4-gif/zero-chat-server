import jwt from "jsonwebtoken";
import { redis } from "@/config";
import { verifyMessage } from "ethers";
import { AppError, TokenType } from "@/types";
import { getAuthSlogan, getAllUsersKey } from "@/metadata";
import { UserInfo } from "@/socket";
export async function handleRegisterAndLogin(
  address: string,
  publicKey: string,
  username: string,
  signature: string,
) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError(500, "Server configuration error");
  }

  const nonce = await redis.get(address);

  if (!nonce) {
    throw new AppError(400, "Verification code expired");
  }

  const authSlogan = getAuthSlogan(nonce);

  const recoveredAddress = verifyMessage(authSlogan, signature);

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new AppError(401, "Authentication failed");
  }

  await redis.del(address);

  const payload = {
    address: address,
  };

  const accessToken = jwt.sign(payload, secret, { expiresIn: "5h" });
  const refreshToken = jwt.sign(payload, secret, { expiresIn: "30d" });

  const usersKey = getAllUsersKey();

  let userInfo: UserInfo = {
    address: address,
    publicKey: publicKey,
    username: username,
    avatarSeed: publicKey,
  };

  const userInfoJson = await redis.hGet(usersKey, address);

  userInfo = {
    ...userInfo,
    ...JSON.parse(userInfoJson || "{}"),
  };

  await redis.hSet(usersKey, address, JSON.stringify(userInfo));

  return {
    userInfo: userInfo,
    tokens: { accessToken, refreshToken },
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

  const nonce = await redis.get(address);
  if (!nonce) {
    throw new AppError(400, "Verification code expired");
  }
  const authSlogan = getAuthSlogan(nonce);

  const recoveredAddress = verifyMessage(authSlogan, signature);
  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new AppError(400, "Authentication failed");
  }

  await redis.del(address);
  const payload: TokenType = { address: decoded.address };
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
