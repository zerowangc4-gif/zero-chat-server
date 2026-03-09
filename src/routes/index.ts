import { Router } from "express";
import authRouter from "./authRoute";
import userRouter from "./userRoute";
import chatRouter from "./chatRoute";
import sincereRouter from "./sincere";
import { authMiddleware } from "@/middlewares";
const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/user", authMiddleware, userRouter);
rootRouter.use("/chat", authMiddleware, chatRouter);
rootRouter.use("/sincere", sincereRouter);

export default rootRouter;
