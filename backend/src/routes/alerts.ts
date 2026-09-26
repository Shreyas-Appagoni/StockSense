import { Router } from "express";
import { alertController } from "../controllers/alertController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", alertController.getAll);
router.patch("/:id/status", alertController.updateStatus);

export default router;
