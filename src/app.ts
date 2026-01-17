import express from "express";
import cors from "cors";
import { mysql, redis } from "@/config"; // 引入你命名的两个大将

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  const isDev = process.env.NODE_ENV === "development";
  try {
    await mysql.query("SELECT 1");
    await redis.ping();

    res.status(200).json({ status: "ok", service: "zero-chat-server" });
  } catch (err: any) {
    res.status(500).json({
      status: "unhealthy",
      error: isDev ? err.message : "Database Connection Error",
    });
  }
});

export default app;
