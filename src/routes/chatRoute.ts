import { Router } from "express";
import {
  syncChatMessages,
  sendMessage,
  deleteHavedSyncMessages,
  syncHavedReadLatestMessage,
  syncMessageStatus,
  searchUserResult,
} from "@/controllers";

const router = Router();

router.post("/sendMessage", sendMessage);

router.post("/syncChatMessages", syncChatMessages);

router.post("/deleteHavedSyncMessages", deleteHavedSyncMessages);

router.post("/syncHavedReadLatestMessage", syncHavedReadLatestMessage);

router.post("/syncMessageStatus", syncMessageStatus);

router.post("/searchUserResult", searchUserResult);

export default router;
