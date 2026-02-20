import { mysql } from "@/config";
import { AppError } from "@/types";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
  id: number;
  username: string;
  public_key: string;
  address: string;
  avatar_seed: string;
  created_at: Date;
}

export async function findByAddress(address: string): Promise<User | null> {
  if (!address) {
    throw new AppError(400, "Address is required");
  }
  const sql = "SELECT * FROM users WHERE address = ? LIMIT 1";
  const [rows] = await mysql.query<User[]>(sql, [address]);
  return rows[0] ?? null;
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
  const sql = "INSERT INTO users (username, public_key, address, avatar_seed) VALUES (?, ?, ?, ?)";
  console.log(username, publicKey, address);
  const [result] = await mysql.execute<ResultSetHeader>(sql, [
    username,
    publicKey,
    address,
    publicKey,
  ]);
  if (result.affectedRows === 0) {
    throw new AppError(500, "Database insertion failed");
  }

  const newUser = await findById(result.insertId);

  if (!newUser) {
    throw new AppError(500, "User created but could not be retrieved");
  }

  return newUser;
}

export async function updateAvatarSeed(address: string, avatarSeed: string): Promise<void> {
  const sql = "UPDATE users SET avatar_seed = ? WHERE address = ?";
  const [result] = await mysql.execute<ResultSetHeader>(sql, [avatarSeed, address]);

  if (result.affectedRows === 0) {
    const userExists = await findByAddress(address);
    if (!userExists) {
      throw new AppError(400, "User not found");
    }
  }
}

export async function GetContacts(_address: string): Promise<User[]> {
  const sql = "SELECT * FROM users";

  const [rows] = await mysql.query<User[]>(sql);

  return rows;
}
