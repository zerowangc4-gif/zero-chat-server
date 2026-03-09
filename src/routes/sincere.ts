import { Router } from "express";
import { wechatLogin } from "@/api";

const router = Router();

router.post("/wechatLogin", wechatLogin);

export default router;
