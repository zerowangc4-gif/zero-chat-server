import express from "express";
import cors from "cors";
import { mysql, redis } from "@/config"; // 引入你命名的两个大将

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  const isDev = process.env.NODE_ENV === "development";
  try {
    // 1. MySQL 心跳
    await mysql.query("SELECT 1");
    // 2. Redis 心跳
    await redis.ping();

    res.status(200).json({ status: "ok", service: "zero-chat-server" });
  } catch (err: any) {
    // 只有开发环境下才吐出具体错误，方便你调试
    // 生产环境下只给 CI/CD 一个 500 信号
    res.status(500).json({
      status: "unhealthy",
      error: isDev ? err.message : "Database Connection Error",
    });
  }
});

export default app;
