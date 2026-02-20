import { Router } from "express";
import { updateAvatar, getContacts } from "@/controllers";

const router = Router();

router.get("/getContacts", getContacts);

router.post("/updateAvatar", updateAvatar);

export default router;
