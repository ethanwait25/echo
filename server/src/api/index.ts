import { Router } from "express";
import authRouter from "./auth/authRoutes.js";
import journalRouter from "./journal/journalRoutes.js";

const router = Router();

router.use("/api/auth", authRouter);
router.use("/api/journal", journalRouter);

export default router;