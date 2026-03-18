import http from "http";

import { redis, setupRedisAdapter } from "@/config";
import { initSocket, SocketClient } from "@/socket";

export async function init(server: http.Server) {
  await redis.connect();

  const ioInstance = initSocket(server);

  await setupRedisAdapter(ioInstance);

  SocketClient(ioInstance);

  console.log("基础设施初始化成功");
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

    await redis.quit();
    console.log("Redis 连接已断开");

    clearTimeout(forceExit);
    process.exit(0);
  } catch (err) {
    console.error("停机出错:", err);
    process.exit(1);
  }
}
