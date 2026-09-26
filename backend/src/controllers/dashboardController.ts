import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { dashboardService } from "../services/dashboardService.js";

export const dashboardController = {
  async getSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await dashboardService.getSummary();
      res.status(200).json({ status: "ok", data: summary });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch summary" });
    }
  },

  async getActivity(req: AuthRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const activity = await dashboardService.getRecentActivity(limit);
      res.status(200).json({ status: "ok", count: activity.length, data: activity });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch activity" });
    }
  },

  async getWarehouseDistribution(req: AuthRequest, res: Response) {
    try {
      const distribution = await dashboardService.getWarehouseDistribution();
      res.status(200).json({ status: "ok", data: distribution });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch warehouse distribution" });
    }
  },

  async getCategoryDistribution(req: AuthRequest, res: Response) {
    try {
      const distribution = await dashboardService.getCategoryDistribution();
      res.status(200).json({ status: "ok", data: distribution });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch category distribution" });
    }
  },

  async getStockTrends(req: AuthRequest, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const trends = await dashboardService.getStockTrends(days);
      res.status(200).json({ status: "ok", data: trends });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch stock trends" });
    }
  },
};
