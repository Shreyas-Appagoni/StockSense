import { Router } from "express";
import { productController } from "../controllers/productController.js";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import { createProductSchema } from "../validators/dataValidator.js";

const router = Router();

// All product routes require authentication
router.use(authenticate);

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post(
  "/",
  requireRole("INVENTORY_MANAGER"),
  validateBody(createProductSchema),
  productController.create
);

export default router;
