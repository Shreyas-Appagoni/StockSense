import { Request, Response } from "express";
import { dataService } from "../services/dataService.js";

export const locationController = {
  async getAll(req: Request, res: Response) {
    try {
      const locations = await dataService.getAllLocations();
      res.status(200).json({ status: "ok", count: locations.length, data: locations });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch locations" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const location = await dataService.getLocationById(req.params.id);
      res.status(200).json({ status: "ok", data: location });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to fetch location",
      });
    }
  },
};
