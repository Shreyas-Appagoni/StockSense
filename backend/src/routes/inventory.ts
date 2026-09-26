import { Router } from "express";
import { inventoryController } from "../controllers/inventoryController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// All inventory routes require authentication
router.use(authenticate);

router.get("/", inventoryController.getAll);

export default router;
