import "dotenv/config";
import http from "http";
import app from "@/app";
import { AppError } from "@/types";
import { init, shutdown } from "@/bootstrap";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const termination = ["SIGINT", "SIGTERM"];
const startServer = async () => {
  try {
    await init(server);

    server.listen(PORT, () => {
      console.log("服务启动成功");
    });
  } catch (err: any) {
    const error = err as AppError;
    console.error("启动错误:", error.message);
    process.exit(1);
  }
};

termination.forEach(sig => process.on(sig, () => shutdown(server, sig)));

startServer();
