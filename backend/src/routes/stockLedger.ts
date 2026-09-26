import { Router } from "express";
import { stockLedgerController } from "../controllers/stockLedgerController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", stockLedgerController.getAll);

export default router;
