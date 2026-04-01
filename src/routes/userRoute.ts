import { Router } from "express";
import { updateUserInfo } from "@/controllers";

const router = Router();

router.post("/updateUserInfo", updateUserInfo);

export default router;
