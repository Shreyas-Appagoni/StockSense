import { Router } from "express";
import { locationController } from "../controllers/locationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// All location routes require authentication
router.use(authenticate);

router.get("/", locationController.getAll);
router.get("/:id", locationController.getById);

export default router;
