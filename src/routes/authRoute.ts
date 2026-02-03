import { Router } from "express";
import { login, getNonce } from "@/controllers";

const router = Router();

router.post("/login", login);
router.post("/getNonce", getNonce);

export default router;
