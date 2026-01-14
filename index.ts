import "dotenv/config";
import app from "@/app";
import { mysql, redis } from "@/config";

const startServer = async () => {
  try {
    await mysql.query("SELECT 1");
    console.log("MySQL 连接成功 ✅");

    // 2. 验证 Redis
    await redis.connect();
    console.log("Redis 连接成功 ✅");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 服务启动成功: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

startServer();
