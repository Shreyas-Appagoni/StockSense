import { Router } from "express";
import { healthController } from "../controllers/healthController.js";

const router = Router();

router.get("/", healthController.getHealth);
router.get("/db", healthController.getDbHealth);

export default router;