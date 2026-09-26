import { Router } from "express";
import { deliveryController } from "../controllers/deliveryController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import { createDeliverySchema } from "../validators/transactionValidator.js";

const router = Router();

router.use(authenticate);

router.get("/", deliveryController.getAll);
router.get("/:id", deliveryController.getById);
router.post("/", validateBody(createDeliverySchema), deliveryController.create);
router.post("/:id/pick", deliveryController.pick);
router.post("/:id/pack", deliveryController.pack);
router.post("/:id/validate", deliveryController.validate);

export default router;
