import { Router } from "express";
import { registerAndLogin, getNonce, handleRefreshToken, handleTokenRotate } from "@/controllers";

const router = Router();

router.post("/registerAndLogin", registerAndLogin);

router.post("/getNonce", getNonce);

router.post("/refreshToken", handleRefreshToken);

router.post("/tokenRotate", handleTokenRotate);

export default router;
