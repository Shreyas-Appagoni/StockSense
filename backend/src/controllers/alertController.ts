import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { alertService } from "../services/alertService.js";
import { AlertStatus, AlertType } from "@prisma/client";

export const alertController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { status, alertType } = req.query;
      const alerts = await alertService.getAllAlerts({
        status: status as AlertStatus | undefined,
        alertType: alertType as AlertType | undefined,
      });
      res.status(200).json({ status: "ok", count: alerts.length, data: alerts });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch alerts" });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status || !Object.values(AlertStatus).includes(status)) {
        res.status(400).json({ status: "error", error: "Invalid alert status" });
        return;
      }
      const updated = await alertService.updateAlertStatus(req.params.id, status);
      res.status(200).json({ status: "ok", data: updated });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to update alert",
      });
    }
  },
};
