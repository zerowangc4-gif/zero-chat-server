import { Router } from "express";
import authRouter from "./authRoute";
import userRouter from "./userRoute";
import chatRouter from "./chatRoute";
import { authMiddleware } from "@/middlewares";
const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/user", authMiddleware, userRouter);
rootRouter.use("/chat", authMiddleware, chatRouter);

export default rootRouter;
