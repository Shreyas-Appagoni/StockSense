import { Request, Response } from "express";
import { checkDbConnection } from "../services/databaseService.js";

export const healthController = {
  getHealth: async (req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "stocksense-api",
      timestamp: new Date().toISOString(),
    });
  },

  getDbHealth: async (req: Request, res: Response) => {
    try {
      const dbStatus = await checkDbConnection();
      res.status(200).json({
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
        ...dbStatus,
      });
    } catch (error) {
      console.error("Database health check failed:", error);
      res.status(500).json({
        status: "error",
        database: "unavailable",
        error: "Database connection failed",
        timestamp: new Date().toISOString(),
      });
    }
  },
};