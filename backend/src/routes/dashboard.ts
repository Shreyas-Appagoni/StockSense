import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/summary", dashboardController.getSummary);
router.get("/activity", dashboardController.getActivity);
router.get("/warehouse-distribution", dashboardController.getWarehouseDistribution);
router.get("/category-distribution", dashboardController.getCategoryDistribution);
router.get("/stock-trends", dashboardController.getStockTrends);

export default router;
