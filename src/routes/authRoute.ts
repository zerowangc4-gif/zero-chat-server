import { Router } from "express";
import { login } from "@/controllers";

const router = Router();

router.post("/login", login);
router.post("/getNonce", login);

export default router;
