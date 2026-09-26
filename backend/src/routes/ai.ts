import { Router } from "express";
import { aiController } from "../controllers/aiController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Protect all AI assistant routes with JWT authentication
router.use(authenticate);

router.post("/chat", aiController.chat);

export default router;
