import { Router } from "express";
import {
  syncChatMessages,
  sendMessage,
  deleteHavedSyncMessages,
  syncHavedReadLatestMessage,
} from "@/controllers";

const router = Router();

router.post("/sendMessage", sendMessage);

router.post("/syncChatMessages", syncChatMessages);

router.post("/deleteHavedSyncMessages", deleteHavedSyncMessages);

router.post("/syncHavedReadLatestMessage", syncHavedReadLatestMessage);

export default router;
