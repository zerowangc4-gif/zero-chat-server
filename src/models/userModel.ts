import { mysql } from "@/config";
import { AppError } from "@/types";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
  id: number;
  username: string;
  public_key: string;
  address: string;
  created_at: Date;
}

export async function findByAddress(address: string): Promise<User | null> {
  if (!address) {
    throw new Error("查询地址不能为空");
  }
  const sql = "SELECT * FROM users WHERE address = ? LIMIT 1";

  try {
    const [rows] = await mysql.query<User[]>(sql, [address]);
    return rows[0] ?? null;
  } catch (err) {
    const error = err as AppError;
    throw new Error(`数据库查询失败: ${error.message}`);
  }
}

export async function findById(id: number): Promise<User | null> {
  const sql = "SELECT * FROM users WHERE id = ? LIMIT 1";
  const [rows] = await mysql.query<User[]>(sql, [id]);
  return rows[0] ?? null;
}

export async function createUser(
  username: string,
  publicKey: string,
  address: string,
): Promise<User> {
  const sql = "INSERT INTO users (username, public_key, address) VALUES (?, ?, ?)";

  try {
    const [result] = await mysql.execute<ResultSetHeader>(sql, [username, publicKey, address]);

    if (result.affectedRows === 0) {
      throw new Error("数据库写入失败：没有记录被创建");
    }

    const newUser = await findById(result.insertId);

    if (!newUser) {
      throw new Error("数据同步异常：用户信息插入成功但无法回显");
    }

    return newUser;
  } catch (err) {
    const error = err as AppError;
    throw new Error(`数据库查询失败: ${error.message}`);
  }
}
