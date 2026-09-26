import { Request, Response } from "express";
import { dataService } from "../services/dataService.js";

export const inventoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const inventory = await dataService.getAllInventory();
      res.status(200).json({ status: "ok", count: inventory.length, data: inventory });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch inventory" });
    }
  },
};
