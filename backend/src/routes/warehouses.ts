import { Router } from "express";
import { warehouseController } from "../controllers/warehouseController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// All warehouse routes require authentication
router.use(authenticate);

router.get("/", warehouseController.getAll);
router.get("/:id", warehouseController.getById);

export default router;
