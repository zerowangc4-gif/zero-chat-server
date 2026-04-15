import { Router } from "express";
import {
  syncChatMessages,
  sendMessage,
  deleteHavedSyncMessages,
  syncHavedReadLatestMessage,
  syncMessageStatus,
  searchUserResult,
  getGroupSeqNum,
  createGruop,
  sendGroupMessage,
  SyncGroupChatMessages,
} from "@/controllers";

const router = Router();

router.post("/sendMessage", sendMessage);

router.post("/syncChatMessages", syncChatMessages);

router.post("/deleteHavedSyncMessages", deleteHavedSyncMessages);

router.post("/syncHavedReadLatestMessage", syncHavedReadLatestMessage);

router.post("/syncMessageStatus", syncMessageStatus);

router.post("/searchUserResult", searchUserResult);

router.post("/getGroupSeqNum", getGroupSeqNum);

router.post("/createGruop", createGruop);

router.post("/sendGroupMessage", sendGroupMessage);

router.post("/SyncGroupChatMessages", SyncGroupChatMessages);

export default router;
