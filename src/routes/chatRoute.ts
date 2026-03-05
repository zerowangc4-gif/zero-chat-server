import { Router } from "express";
import { getOffineChatMessages } from "@/controllers";

const router = Router();

router.post("/getOffineChatMessages", getOffineChatMessages);

export default router;
