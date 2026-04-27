import { Router } from "express";
import { addFriends, updateUserInfo, getAllFriendInfo } from "@/controllers";

const router = Router();

router.post("/addFriends", addFriends);

router.post("/updateUserInfo", updateUserInfo);

router.post("/updateUserInfo", getAllFriendInfo);

export default router;
