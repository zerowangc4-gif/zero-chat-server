import { Router } from "express";
import { syncChatMessages, sendMessage, deleteHavedSyncMessages } from "@/controllers";

const router = Router();

router.post("/sendMessage", sendMessage);

router.post("/syncChatMessages", syncChatMessages);

router.post("/deleteHavedSyncMessages", deleteHavedSyncMessages);

export default router;
