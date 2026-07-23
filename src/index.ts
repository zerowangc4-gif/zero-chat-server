import http from "http";
import express from "express";
import cors from "cors";
import { errorHandler } from "@/middlewares";
import rootRouter from "@/routes/index";
import { init, shutdown } from "@/bootstrap";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", rootRouter);
app.use(errorHandler);

const server = http.createServer(app);

const termination = ["SIGINT", "SIGTERM"];

const startServer = async () => {
  try {
    await init(server);

    server.listen(process.env.PORT, () => {
      console.log("Server started successfully");
    });
  } catch (error: unknown) {
    console.error("Server startup error");
    process.exit(1);
  }
};

termination.forEach(sig => process.on(sig, () => shutdown(server, sig)));

startServer();
