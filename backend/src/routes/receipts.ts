import { Router } from "express";
import { receiptController } from "../controllers/receiptController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import { createReceiptSchema } from "../validators/transactionValidator.js";

const router = Router();

router.use(authenticate);

router.get("/", receiptController.getAll);
router.get("/:id", receiptController.getById);
router.post("/", validateBody(createReceiptSchema), receiptController.create);
router.post("/:id/validate", receiptController.validate);

export default router;
