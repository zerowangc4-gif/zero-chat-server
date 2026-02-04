import { Router } from "express";
import { login, getNonce, handleRefreshToken, handleTokenRotate } from "@/controllers";

const router = Router();

router.post("/login", login);
router.post("/getNonce", getNonce);
router.post("/refreshToken", handleRefreshToken);
router.post("/tokenRotate", handleTokenRotate);

export default router;
