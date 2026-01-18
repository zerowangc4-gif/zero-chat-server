import http from "http";
import { Server } from "socket.io";
import { mysql, redis, setupRedisAdapter } from "@/config";

export let io: Server;

export async function init(server: http.Server) {
  await mysql.query("SELECT 1");

  await redis.connect();

  io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
  });

  await setupRedisAdapter(io);

  setupSocketHandlers(io);

  console.log("基础设施初始化成功");
}

function setupSocketHandlers(ioInstance: Server) {
  ioInstance.on("connection", socket => {
    console.log("⚓ 新用户连接:", socket.id);
    // 以后业务逻辑写在这
  });
}

export async function shutdown(server: http.Server, signal: string) {
  console.log(`收到 ${signal}，启动停机程序`);

  // 强制退出
  const forceExit = setTimeout(() => {
    process.exit(1);
  }, 10000);

  try {
    await new Promise(resolve => server.close(resolve));
    console.log("HTTP 服务器已关闭");

    await mysql.end();
    console.log("MySQL 连接池已释放");

    await redis.quit();
    console.log("Redis 连接已断开");

    clearTimeout(forceExit);
    process.exit(0);
  } catch (err) {
    console.error("停机出错:", err);
    process.exit(1);
  }
}
