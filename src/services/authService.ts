import jwt from "jsonwebtoken";

import { findByAddress, createUser } from "@/models";
import { AppError } from "@/types";

export async function loginOrRegister(address: string, publicKey: string, username: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("服务器配置错误：JWT_SECRET 缺失");
  }

  try {
    let user = await findByAddress(address);
    if (!user) {
      user = await createUser(username, publicKey, address);
    }
    const payload = {
      id: user.id,
      address: user.address,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    return {
      user: {
        id: user.id,
        username: user.username,
        address: user.address,
        publicKey: user.public_key,
      },
      token,
    };
  } catch (err) {
    const error = err as AppError;
    throw new Error(`AuthService 认证失败: ${error.message}`);
  }
}
