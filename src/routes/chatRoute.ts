import { Router } from "express";
import {
  syncChatMessages,
  sendMessage,
  deleteHavedSyncMessages,
  syncHavedReadLatestMessage,
  syncMessageStatus,
  searchUserResult,
  getGroupSeqNum,
  createGroup,
  sendGroupMessage,
  syncGroupChatMessages,
  joinGroup,
} from "@/controllers";

const router = Router();

router.post("/sendMessage", sendMessage);

router.post("/syncChatMessages", syncChatMessages);

router.post("/deleteHavedSyncMessages", deleteHavedSyncMessages);

router.post("/syncHavedReadLatestMessage", syncHavedReadLatestMessage);

router.post("/syncMessageStatus", syncMessageStatus);

router.post("/searchUserResult", searchUserResult);

router.post("/getGroupSeqNum", getGroupSeqNum);

router.post("/createGroup", createGroup);

router.post("/sendGroupMessage", sendGroupMessage);

router.post("/syncGroupChatMessages", syncGroupChatMessages);

router.post("/joinGroup", joinGroup);

export default router;
