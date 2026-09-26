import { prisma } from "./databaseService.js";
import { ReceiptStatus, DeliveryStatus, TransferStatus, AlertStatus } from "@prisma/client";

export const dashboardService = {
  async getSummary() {
    // 1. Total products
    const totalProducts = await prisma.product.count();

    // 2. Inventory records with product reorder levels
    const allInventory = await prisma.inventory.findMany({
      include: {
        product: {
          select: { reorderLevel: true },
        },
      },
    });

    let totalQuantity = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const inv of allInventory) {
      totalQuantity += inv.quantity;
      if (inv.quantity <= 0) {
        outOfStockCount++;
      } else if (inv.quantity <= inv.product.reorderLevel) {
        lowStockCount++;
      }
    }

    // 3. Pending operational documents
    const pendingReceipts = await prisma.receipt.count({
      where: {
        status: { notIn: [ReceiptStatus.VALIDATED, ReceiptStatus.CANCELLED] },
      },
    });

    const pendingDeliveries = await prisma.delivery.count({
      where: {
        status: { notIn: [DeliveryStatus.VALIDATED, DeliveryStatus.CANCELLED] },
      },
    });

    const pendingTransfers = await prisma.transfer.count({
      where: {
        status: { notIn: [TransferStatus.VALIDATED, TransferStatus.CANCELLED] },
      },
    });

    // 4. Alerts count
    const unreadAlertsCount = await prisma.alert.count({
      where: { status: AlertStatus.UNREAD },
    });

    return {
      totalProducts,
      totalInventoryUnits: totalQuantity,
      totalInventoryQuantity: totalQuantity,
      lowStockCount,
      outOfStockCount,
      pendingReceipts,
      pendingReceiptsCount: pendingReceipts,
      pendingDeliveries,
      pendingDeliveriesCount: pendingDeliveries,
      pendingTransfers,
      pendingTransfersCount: pendingTransfers,
      unreadAlertsCount,
    };
  },

  async getRecentActivity(limit = 10) {
    return prisma.stockLedger.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        location: {
          include: { warehouse: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async getWarehouseDistribution() {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        locations: {
          include: {
            inventory: true,
          },
        },
      },
    });

    return warehouses.map((wh) => {
      let totalStock = 0;
      const productIds = new Set<string>();

      for (const loc of wh.locations) {
        for (const inv of loc.inventory) {
          totalStock += inv.quantity;
          productIds.add(inv.productId);
        }
      }

      return {
        id: wh.id,
        name: wh.name,
        code: wh.code,
        totalQuantity: totalStock,
        uniqueProductsCount: productIds.size,
      };
    });
  },

  async getCategoryDistribution() {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            inventory: true,
          },
        },
      },
    });

    return categories.map((cat) => {
      let totalStock = 0;
      for (const prod of cat.products) {
        for (const inv of prod.inventory) {
          totalStock += inv.quantity;
        }
      }

      return {
        id: cat.id,
        name: cat.name,
        totalQuantity: totalStock,
        productCount: cat.products.length,
      };
    });
  },

  async getStockTrends(days = 30) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const ledgerEntries = await prisma.stockLedger.findMany({
      where: {
        createdAt: { gte: sinceDate },
      },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        transactionType: true,
        quantityChange: true,
      },
    });

    // Group by day YYYY-MM-DD
    const dateMap = new Map<string, { date: string; receipts: number; deliveries: number; transfers: number; adjustments: number }>();

    for (const entry of ledgerEntries) {
      const dateStr = entry.createdAt.toISOString().split("T")[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          receipts: 0,
          deliveries: 0,
          transfers: 0,
          adjustments: 0,
        });
      }

      const row = dateMap.get(dateStr)!;
      if (entry.transactionType === "RECEIPT") {
        row.receipts += Math.abs(entry.quantityChange);
      } else if (entry.transactionType === "DELIVERY") {
        row.deliveries += Math.abs(entry.quantityChange);
      } else if (entry.transactionType === "TRANSFER_IN" || entry.transactionType === "TRANSFER_OUT") {
        row.transfers += Math.abs(entry.quantityChange);
      } else if (entry.transactionType === "ADJUSTMENT") {
        row.adjustments += Math.abs(entry.quantityChange);
      }
    }

    return Array.from(dateMap.values());
  },
};
