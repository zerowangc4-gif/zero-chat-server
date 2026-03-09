import { Router } from "express";
import { wechatLogin } from "@/controllers";

const router = Router();

router.post("/wechatLogin", wechatLogin);

export default router;
