import { Router } from "express";
import authRouter from "./authRoute";
import userRouter from "./userRoute";
import { authMiddleware } from "@/middlewares";
const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/user", authMiddleware, userRouter);

export default rootRouter;
