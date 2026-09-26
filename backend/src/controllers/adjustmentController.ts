import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { inventoryTransactionService } from "../services/inventoryTransactionService.js";

export const adjustmentController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const adjustments = await inventoryTransactionService.getAllAdjustments();
      res.status(200).json({ status: "ok", count: adjustments.length, data: adjustments });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch adjustments" });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const adjustment = await inventoryTransactionService.getAdjustmentById(req.params.id);
      res.status(200).json({ status: "ok", data: adjustment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to fetch adjustment",
      });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const adjustment = await inventoryTransactionService.createAdjustment(req.body, req.user?.id);
      res.status(201).json({
        status: "ok",
        message: "Adjustment created successfully",
        data: adjustment,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to create adjustment",
      });
    }
  },

  async validate(req: AuthRequest, res: Response) {
    try {
      const adjustment = await inventoryTransactionService.validateAdjustment(req.params.id, req.user?.id);
      res.status(200).json({
        status: "ok",
        message: "Adjustment validated and stock updated successfully",
        data: adjustment,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to validate adjustment",
      });
    }
  },
};
