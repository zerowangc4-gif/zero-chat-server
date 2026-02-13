import { Router } from "express";
import { updateAvatar } from "@/controllers";

const router = Router();

router.post("/updateAvatar", updateAvatar);

export default router;
