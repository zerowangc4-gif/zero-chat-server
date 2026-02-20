import { mysql } from "@/config";

import { User } from "./userModel";
export async function GetContacts(_address: string): Promise<User[]> {
  const sql = "SELECT * FROM users";

  const [rows] = await mysql.query<User[]>(sql);

  return rows;
}
