import mysql2 from "mysql2/promise";

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_NAME = process.env.MYSQL_NAME;

export const mysql = mysql2.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_NAME,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "+08:00",
});
