import { Router } from "express";
import { transferController } from "../controllers/transferController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import { createTransferSchema } from "../validators/transactionValidator.js";

const router = Router();

router.use(authenticate);

router.get("/", transferController.getAll);
router.get("/:id", transferController.getById);
router.post("/", validateBody(createTransferSchema), transferController.create);
router.post("/:id/validate", transferController.validate);

export default router;
