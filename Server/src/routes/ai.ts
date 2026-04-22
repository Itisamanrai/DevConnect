import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { explainCode } from "../controllers/aiController";

const router = Router();

router.post("/explain", authMiddleware, explainCode);

export default router;
