import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { inventoryTransactionService } from "../services/inventoryTransactionService.js";

export const receiptController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const receipts = await inventoryTransactionService.getAllReceipts();
      res.status(200).json({ status: "ok", count: receipts.length, data: receipts });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch receipts" });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const receipt = await inventoryTransactionService.getReceiptById(req.params.id);
      res.status(200).json({ status: "ok", data: receipt });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to fetch receipt",
      });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const receipt = await inventoryTransactionService.createReceipt(req.body, req.user?.id);
      res.status(201).json({
        status: "ok",
        message: "Receipt created successfully",
        data: receipt,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to create receipt",
      });
    }
  },

  async validate(req: AuthRequest, res: Response) {
    try {
      const receipt = await inventoryTransactionService.validateReceipt(req.params.id, req.user?.id);
      res.status(200).json({
        status: "ok",
        message: "Receipt validated and inventory updated successfully",
        data: receipt,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to validate receipt",
      });
    }
  },
};
