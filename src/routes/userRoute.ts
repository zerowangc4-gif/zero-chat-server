import { Router } from "express";
import { addFriends, updateUserInfo, getAllFriendInfo } from "@/controllers";

const router = Router();

router.post("/addFriends", addFriends);

router.post("/updateUserInfo", updateUserInfo);

router.post("/getAllFriendInfo", getAllFriendInfo);

export default router;
