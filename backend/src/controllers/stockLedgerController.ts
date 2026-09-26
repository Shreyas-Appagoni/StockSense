import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { inventoryTransactionService } from "../services/inventoryTransactionService.js";
import { TransactionType } from "@prisma/client";

export const stockLedgerController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { productId, locationId, transactionType } = req.query;
      const entries = await inventoryTransactionService.getAllLedgerEntries({
        productId: productId as string | undefined,
        locationId: locationId as string | undefined,
        transactionType: transactionType as TransactionType | undefined,
      });
      res.status(200).json({ status: "ok", count: entries.length, data: entries });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch ledger entries" });
    }
  },
};
