import { Router } from "express";
import {
  syncChatMessages,
  sendMessage,
  deleteHavedSyncMessages,
  syncHavedReadLatestMessage,
  syncMessageStatus,
} from "@/controllers";

const router = Router();

router.post("/sendMessage", sendMessage);

router.post("/syncChatMessages", syncChatMessages);

router.post("/deleteHavedSyncMessages", deleteHavedSyncMessages);

router.post("/syncHavedReadLatestMessage", syncHavedReadLatestMessage);

router.post("/syncMessageStatus", syncMessageStatus);

export default router;
