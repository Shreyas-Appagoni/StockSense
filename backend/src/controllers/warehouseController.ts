import { Request, Response } from "express";
import { dataService } from "../services/dataService.js";

export const warehouseController = {
  async getAll(req: Request, res: Response) {
    try {
      const warehouses = await dataService.getAllWarehouses();
      res.status(200).json({ status: "ok", count: warehouses.length, data: warehouses });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch warehouses" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const warehouse = await dataService.getWarehouseById(req.params.id);
      res.status(200).json({ status: "ok", data: warehouse });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to fetch warehouse",
      });
    }
  },
};
