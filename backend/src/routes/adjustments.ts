import { Router } from "express";
import { adjustmentController } from "../controllers/adjustmentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import { createAdjustmentSchema } from "../validators/transactionValidator.js";

const router = Router();

router.use(authenticate);

router.get("/", adjustmentController.getAll);
router.get("/:id", adjustmentController.getById);
router.post("/", validateBody(createAdjustmentSchema), adjustmentController.create);
router.post("/:id/validate", adjustmentController.validate);

export default router;
