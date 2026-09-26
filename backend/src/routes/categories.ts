import { Router } from "express";
import { categoryController } from "../controllers/categoryController.js";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import { createCategorySchema } from "../validators/dataValidator.js";

const router = Router();

// All category routes require authentication
router.use(authenticate);

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post(
  "/",
  requireRole("INVENTORY_MANAGER"),
  validateBody(createCategorySchema),
  categoryController.create
);

export default router;
