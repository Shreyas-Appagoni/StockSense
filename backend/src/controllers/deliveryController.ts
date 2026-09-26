import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { inventoryTransactionService } from "../services/inventoryTransactionService.js";

export const deliveryController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const deliveries = await inventoryTransactionService.getAllDeliveries();
      res.status(200).json({ status: "ok", count: deliveries.length, data: deliveries });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch deliveries" });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const delivery = await inventoryTransactionService.getDeliveryById(req.params.id);
      res.status(200).json({ status: "ok", data: delivery });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to fetch delivery",
      });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const delivery = await inventoryTransactionService.createDelivery(req.body, req.user?.id);
      res.status(201).json({
        status: "ok",
        message: "Delivery created successfully",
        data: delivery,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to create delivery",
      });
    }
  },

  async pick(req: AuthRequest, res: Response) {
    try {
      const delivery = await inventoryTransactionService.pickDelivery(req.params.id);
      res.status(200).json({
        status: "ok",
        message: "Delivery marked as picked",
        data: delivery,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to pick delivery",
      });
    }
  },

  async pack(req: AuthRequest, res: Response) {
    try {
      const delivery = await inventoryTransactionService.packDelivery(req.params.id);
      res.status(200).json({
        status: "ok",
        message: "Delivery marked as packed",
        data: delivery,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to pack delivery",
      });
    }
  },

  async validate(req: AuthRequest, res: Response) {
    try {
      const delivery = await inventoryTransactionService.validateDelivery(req.params.id, req.user?.id);
      res.status(200).json({
        status: "ok",
        message: "Delivery validated and stock deducted successfully",
        data: delivery,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to validate delivery",
      });
    }
  },
};
