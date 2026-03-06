import { Router } from "express";
import { getOffineChatMessages, sendMessage } from "@/controllers";

const router = Router();

router.post("/sendMessage", sendMessage);

router.post("/getOffineChatMessages", getOffineChatMessages);

export default router;
