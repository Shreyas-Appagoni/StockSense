import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { inventoryTransactionService } from "../services/inventoryTransactionService.js";

export const transferController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const transfers = await inventoryTransactionService.getAllTransfers();
      res.status(200).json({ status: "ok", count: transfers.length, data: transfers });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch transfers" });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const transfer = await inventoryTransactionService.getTransferById(req.params.id);
      res.status(200).json({ status: "ok", data: transfer });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to fetch transfer",
      });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const transfer = await inventoryTransactionService.createTransfer(req.body, req.user?.id);
      res.status(201).json({
        status: "ok",
        message: "Transfer created successfully",
        data: transfer,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to create transfer",
      });
    }
  },

  async validate(req: AuthRequest, res: Response) {
    try {
      const transfer = await inventoryTransactionService.validateTransfer(req.params.id, req.user?.id);
      res.status(200).json({
        status: "ok",
        message: "Transfer validated and stock transferred successfully",
        data: transfer,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to validate transfer",
      });
    }
  },
};
