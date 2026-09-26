import { z } from "zod";
import { prisma } from "../services/databaseService.js";
import { dashboardService } from "../services/dashboardService.js";
import { OpenRouterToolDefinition } from "./client.js";

// ==========================================
// 1. Zod Validation Schemas for Tool Arguments
// ==========================================

export const getProductStockSchema = z.object({
  productName: z.string().optional(),
  sku: z.string().optional(),
  productId: z.string().optional(),
});

export const getLowStockProductsSchema = z.object({
  warehouseId: z.string().optional(),
  locationId: z.string().optional(),
  categoryId: z.string().optional(),
});

export const getStockHistorySchema = z.object({
  productId: z.string().optional(),
  sku: z.string().optional(),
  productName: z.string().optional(),
  days: z.number().int().positive().optional().default(30),
});

export const getProductMovementsSchema = z.object({
  productId: z.string().optional(),
  sku: z.string().optional(),
  productName: z.string().optional(),
  days: z.number().int().positive().optional().default(30),
});

export const getWarehouseInventorySchema = z.object({
  warehouseId: z.string().optional(),
  warehouseName: z.string().optional(),
});

export const getPendingReceiptsSchema = z.object({
  warehouseId: z.string().optional(),
});

export const getPendingDeliveriesSchema = z.object({
  warehouseId: z.string().optional(),
});

export const getTransferHistorySchema = z.object({
  productId: z.string().optional(),
  warehouseId: z.string().optional(),
  days: z.number().int().positive().optional().default(30),
});

export const getDashboardSummarySchema = z.object({});

// Map of tool schemas for validation
export const toolArgumentSchemas: Record<string, z.ZodSchema> = {
  get_product_stock: getProductStockSchema,
  get_low_stock_products: getLowStockProductsSchema,
  get_stock_history: getStockHistorySchema,
  get_product_movements: getProductMovementsSchema,
  get_warehouse_inventory: getWarehouseInventorySchema,
  get_pending_receipts: getPendingReceiptsSchema,
  get_pending_deliveries: getPendingDeliveriesSchema,
  get_transfer_history: getTransferHistorySchema,
  get_dashboard_summary: getDashboardSummarySchema,
};

// ==========================================
// 2. OpenRouter Tool Definitions (Function Calling)
// ==========================================

export const AI_TOOL_DEFINITIONS: OpenRouterToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_product_stock",
      description:
        "Get current real-time inventory quantity for a specific product across all storage locations and warehouses.",
      parameters: {
        type: "object",
        properties: {
          productName: {
            type: "string",
            description: "Product name or partial name (e.g. 'Steel Rod')",
          },
          sku: {
            type: "string",
            description: "Unique product SKU code (e.g. 'SR-001')",
          },
          productId: {
            type: "string",
            description: "Unique product database ID",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_low_stock_products",
      description:
        "Find all inventory items currently at or below their configured reorder threshold, including stockouts.",
      parameters: {
        type: "object",
        properties: {
          warehouseId: {
            type: "string",
            description: "Optional warehouse ID to filter results",
          },
          locationId: {
            type: "string",
            description: "Optional location ID to filter results",
          },
          categoryId: {
            type: "string",
            description: "Optional product category ID to filter results",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_stock_history",
      description:
        "Retrieve the recent immutable stock ledger transaction history for a product, showing all recorded operations and deltas.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "Product ID",
          },
          sku: {
            type: "string",
            description: "Product SKU",
          },
          productName: {
            type: "string",
            description: "Product name",
          },
          days: {
            type: "number",
            description: "Number of days of history to inspect (default: 30)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_movements",
      description:
        "Explain how and why a product's stock changed over a given period, summarizing receipts, deliveries, transfers, and adjustments.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "Product ID",
          },
          sku: {
            type: "string",
            description: "Product SKU",
          },
          productName: {
            type: "string",
            description: "Product name",
          },
          days: {
            type: "number",
            description: "Number of days to summarize (default: 30)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_warehouse_inventory",
      description:
        "Retrieve all products and inventory quantities currently stored inside a specific warehouse.",
      parameters: {
        type: "object",
        properties: {
          warehouseId: {
            type: "string",
            description: "Unique warehouse ID",
          },
          warehouseName: {
            type: "string",
            description: "Warehouse name or partial name (e.g. 'Warehouse A')",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_pending_receipts",
      description:
        "Find inbound receipts that are currently in DRAFT or pending validation, awaiting check-in.",
      parameters: {
        type: "object",
        properties: {
          warehouseId: {
            type: "string",
            description: "Optional destination warehouse ID filter",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_pending_deliveries",
      description:
        "Find outbound customer shipments that are not yet validated (in DRAFT, PICKED, or PACKED status).",
      parameters: {
        type: "object",
        properties: {
          warehouseId: {
            type: "string",
            description: "Optional source warehouse ID filter",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_transfer_history",
      description:
        "Retrieve recent internal transfers between warehouse locations with status and quantities.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "Optional product ID to filter transfers",
          },
          warehouseId: {
            type: "string",
            description: "Optional warehouse ID to filter transfers",
          },
          days: {
            type: "number",
            description: "Number of past days to inspect (default: 30)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dashboard_summary",
      description:
        "Get high-level operational KPIs: total products, low-stock count, stockouts, pending receipts, pending deliveries, pending transfers, total inventory count, and active alerts.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

// Helper to resolve product from flexible criteria
async function resolveProduct(criteria: {
  productId?: string;
  sku?: string;
  productName?: string;
}) {
  if (criteria.productId) {
    const byId = await prisma.product.findUnique({
      where: { id: criteria.productId },
      include: { category: true },
    });
    if (byId) return byId;
  }

  if (criteria.sku) {
    const bySku = await prisma.product.findFirst({
      where: {
        sku: { equals: criteria.sku.trim(), mode: "insensitive" },
      },
      include: { category: true },
    });
    if (bySku) return bySku;
  }

  if (criteria.productName) {
    const byName = await prisma.product.findFirst({
      where: {
        name: { contains: criteria.productName.trim(), mode: "insensitive" },
      },
      include: { category: true },
    });
    if (byName) return byName;
  }

  return null;
}

// ==========================================
// 3. Deterministic Read-Only Tool Execution Layer
// ==========================================

export const aiTools = {
  // Tool 1: get_product_stock
  async get_product_stock(args: z.infer<typeof getProductStockSchema>) {
    const product = await resolveProduct(args);
    if (!product) {
      return {
        found: false,
        message: `Product matching query (${JSON.stringify(args)}) was not found in the database.`,
      };
    }

    const inventoryRecords = await prisma.inventory.findMany({
      where: { productId: product.id },
      include: {
        location: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const totalQuantity = inventoryRecords.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const isOutOfStock = totalQuantity <= 0;
    const isLowStock = !isOutOfStock && totalQuantity <= product.reorderLevel;
    const stockStatus = isOutOfStock
      ? "OUT_OF_STOCK"
      : isLowStock
      ? "LOW_STOCK"
      : "HEALTHY";

    const shortageAmount = Math.max(0, product.reorderLevel - totalQuantity);

    const locations = inventoryRecords.map((inv) => ({
      locationId: inv.locationId,
      locationName: inv.location.name,
      locationCode: inv.location.code,
      warehouseId: inv.location.warehouseId,
      warehouseName: inv.location.warehouse.name,
      warehouseCode: inv.location.warehouse.code,
      quantity: inv.quantity,
    }));

    return {
      found: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        unit: product.unit,
        category: product.category?.name,
        reorderLevel: product.reorderLevel,
        description: product.description,
      },
      totalQuantity,
      stockStatus,
      shortageAmount,
      locations,
    };
  },

  // Tool 2: get_low_stock_products
  async get_low_stock_products(args: z.infer<typeof getLowStockProductsSchema>) {
    const whereClause: any = {};

    if (args.warehouseId) {
      whereClause.location = { warehouseId: args.warehouseId };
    }
    if (args.locationId) {
      whereClause.locationId = args.locationId;
    }
    if (args.categoryId) {
      whereClause.product = {
        ...whereClause.product,
        categoryId: args.categoryId,
      };
    }

    const inventoryRecords = await prisma.inventory.findMany({
      where: whereClause,
      include: {
        product: {
          include: { category: true },
        },
        location: {
          include: { warehouse: true },
        },
      },
    });

    // Filter where quantity <= product.reorderLevel
    const lowStockItems = inventoryRecords
      .filter((inv) => inv.quantity <= inv.product.reorderLevel)
      .map((inv) => {
        const isOutOfStock = inv.quantity <= 0;
        const shortage = Math.max(0, inv.product.reorderLevel - inv.quantity);
        const severity = isOutOfStock
          ? "CRITICAL"
          : inv.quantity <= inv.product.reorderLevel * 0.5
          ? "HIGH"
          : "WARNING";

        return {
          productId: inv.productId,
          productName: inv.product.name,
          sku: inv.product.sku,
          category: inv.product.category?.name,
          unit: inv.product.unit,
          currentQuantity: inv.quantity,
          reorderLevel: inv.product.reorderLevel,
          shortageAmount: shortage,
          stockStatus: isOutOfStock ? "OUT_OF_STOCK" : "LOW_STOCK",
          severity,
          locationName: inv.location.name,
          warehouseName: inv.location.warehouse.name,
        };
      })
      .sort((a, b) => b.shortageAmount - a.shortageAmount);

    return {
      count: lowStockItems.length,
      criticalStockouts: lowStockItems.filter(
        (item) => item.stockStatus === "OUT_OF_STOCK"
      ).length,
      items: lowStockItems,
    };
  },

  // Tool 3: get_stock_history
  async get_stock_history(args: z.infer<typeof getStockHistorySchema>) {
    const days = args.days || 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const whereClause: any = {
      createdAt: { gte: sinceDate },
    };

    let targetProduct = null;
    if (args.productId || args.sku || args.productName) {
      targetProduct = await resolveProduct(args);
      if (targetProduct) {
        whereClause.productId = targetProduct.id;
      }
    }

    const ledgerEntries = await prisma.stockLedger.findMany({
      where: whereClause,
      include: {
        product: true,
        location: {
          include: { warehouse: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    return {
      product: targetProduct
        ? {
            id: targetProduct.id,
            name: targetProduct.name,
            sku: targetProduct.sku,
          }
        : null,
      daysChecked: days,
      totalMovements: ledgerEntries.length,
      movements: ledgerEntries.map((entry) => ({
        id: entry.id,
        timestamp: entry.createdAt.toISOString(),
        productName: entry.product.name,
        sku: entry.product.sku,
        operation: entry.transactionType,
        quantityChange: entry.quantityChange,
        previousQuantity: entry.previousQuantity,
        newQuantity: entry.newQuantity,
        location: entry.location.name,
        warehouse: entry.location.warehouse.name,
        user: entry.user?.name || "System",
        referenceId: entry.referenceId,
        notes: entry.notes,
      })),
    };
  },

  // Tool 4: get_product_movements
  async get_product_movements(args: z.infer<typeof getProductMovementsSchema>) {
    const product = await resolveProduct(args);
    if (!product) {
      return {
        found: false,
        message: `Product matching query (${JSON.stringify(args)}) was not found.`,
      };
    }

    const days = args.days || 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const ledgerEntries = await prisma.stockLedger.findMany({
      where: {
        productId: product.id,
        createdAt: { gte: sinceDate },
      },
      include: {
        location: {
          include: { warehouse: true },
        },
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let receiptsUnits = 0;
    let receiptsCount = 0;
    let deliveriesUnits = 0;
    let deliveriesCount = 0;
    let transfersInUnits = 0;
    let transfersInCount = 0;
    let transfersOutUnits = 0;
    let transfersOutCount = 0;
    let adjustmentsDelta = 0;
    let adjustmentsCount = 0;
    let netChange = 0;

    for (const entry of ledgerEntries) {
      netChange += entry.quantityChange;

      switch (entry.transactionType) {
        case "RECEIPT":
          receiptsUnits += entry.quantityChange;
          receiptsCount++;
          break;
        case "DELIVERY":
          deliveriesUnits += Math.abs(entry.quantityChange);
          deliveriesCount++;
          break;
        case "TRANSFER_IN":
          transfersInUnits += entry.quantityChange;
          transfersInCount++;
          break;
        case "TRANSFER_OUT":
          transfersOutUnits += Math.abs(entry.quantityChange);
          transfersOutCount++;
          break;
        case "ADJUSTMENT":
          adjustmentsDelta += entry.quantityChange;
          adjustmentsCount++;
          break;
      }
    }

    return {
      found: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        unit: product.unit,
      },
      periodDays: days,
      summary: {
        receipts: { units: receiptsUnits, transactionCount: receiptsCount },
        deliveries: { units: deliveriesUnits, transactionCount: deliveriesCount },
        transfersIn: { units: transfersInUnits, transactionCount: transfersInCount },
        transfersOut: { units: transfersOutUnits, transactionCount: transfersOutCount },
        adjustments: { netDelta: adjustmentsDelta, transactionCount: adjustmentsCount },
        netChange,
      },
      recentLedgerEntries: ledgerEntries.slice(0, 10).map((e) => ({
        timestamp: e.createdAt.toISOString(),
        operation: e.transactionType,
        quantityChange: e.quantityChange,
        previousQuantity: e.previousQuantity,
        newQuantity: e.newQuantity,
        location: `${e.location.warehouse.name} › ${e.location.name}`,
        referenceId: e.referenceId,
        user: e.user?.name || "System",
      })),
    };
  },

  // Tool 5: get_warehouse_inventory
  async get_warehouse_inventory(args: z.infer<typeof getWarehouseInventorySchema>) {
    let warehouse = null;

    if (args.warehouseId) {
      warehouse = await prisma.warehouse.findUnique({
        where: { id: args.warehouseId },
      });
    } else if (args.warehouseName) {
      warehouse = await prisma.warehouse.findFirst({
        where: {
          name: { contains: args.warehouseName.trim(), mode: "insensitive" },
        },
      });
    }

    if (!warehouse) {
      return {
        found: false,
        message: `Warehouse matching query (${JSON.stringify(args)}) was not found.`,
      };
    }

    const inventoryRecords = await prisma.inventory.findMany({
      where: {
        location: {
          warehouseId: warehouse.id,
        },
      },
      include: {
        product: true,
        location: true,
      },
    });

    const totalQuantity = inventoryRecords.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const uniqueProductIds = new Set(
      inventoryRecords.map((item) => item.productId)
    );

    const items = inventoryRecords.map((inv) => {
      const isOutOfStock = inv.quantity <= 0;
      const isLowStock = !isOutOfStock && inv.quantity <= inv.product.reorderLevel;
      return {
        productId: inv.productId,
        productName: inv.product.name,
        sku: inv.product.sku,
        locationName: inv.location.name,
        quantity: inv.quantity,
        unit: inv.product.unit,
        reorderLevel: inv.product.reorderLevel,
        status: isOutOfStock
          ? "OUT_OF_STOCK"
          : isLowStock
          ? "LOW_STOCK"
          : "HEALTHY",
      };
    });

    const lowStockCount = items.filter(
      (i) => i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK"
    ).length;

    return {
      found: true,
      warehouse: {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address,
      },
      totalQuantity,
      uniqueProductsCount: uniqueProductIds.size,
      lowStockCount,
      inventory: items,
    };
  },

  // Tool 6: get_pending_receipts
  async get_pending_receipts(args: z.infer<typeof getPendingReceiptsSchema>) {
    const whereClause: any = {
      status: { not: "VALIDATED" },
    };

    if (args.warehouseId) {
      whereClause.destinationLocation = {
        warehouseId: args.warehouseId,
      };
    }

    const receipts = await prisma.receipt.findMany({
      where: whereClause,
      include: {
        destinationLocation: {
          include: { warehouse: true },
        },
        supplier: true,
        createdBy: {
          select: { name: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      count: receipts.length,
      receipts: receipts.map((r) => ({
        id: r.id,
        referenceNumber: r.referenceNumber,
        status: r.status,
        supplier: r.supplier?.name || "Standard Vendor",
        destinationWarehouse: r.destinationLocation.warehouse.name,
        destinationLocation: r.destinationLocation.name,
        createdAt: r.createdAt.toISOString(),
        createdBy: r.createdBy?.name || "System",
        items: r.items.map((item) => ({
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
        })),
      })),
    };
  },

  // Tool 7: get_pending_deliveries
  async get_pending_deliveries(args: z.infer<typeof getPendingDeliveriesSchema>) {
    const whereClause: any = {
      status: { in: ["DRAFT", "PICKED", "PACKED"] },
    };

    if (args.warehouseId) {
      whereClause.sourceLocation = {
        warehouseId: args.warehouseId,
      };
    }

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      include: {
        sourceLocation: {
          include: { warehouse: true },
        },
        createdBy: {
          select: { name: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      count: deliveries.length,
      deliveries: deliveries.map((d) => ({
        id: d.id,
        referenceNumber: d.referenceNumber,
        status: d.status,
        customerName: d.customerName || "Standard Dispatch",
        sourceWarehouse: d.sourceLocation.warehouse.name,
        sourceLocation: d.sourceLocation.name,
        createdAt: d.createdAt.toISOString(),
        createdBy: d.createdBy?.name || "System",
        items: d.items.map((item) => ({
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
        })),
      })),
    };
  },

  // Tool 8: get_transfer_history
  async get_transfer_history(args: z.infer<typeof getTransferHistorySchema>) {
    const days = args.days || 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const whereClause: any = {
      createdAt: { gte: sinceDate },
    };

    if (args.productId) {
      whereClause.items = {
        some: { productId: args.productId },
      };
    }

    if (args.warehouseId) {
      whereClause.OR = [
        { fromLocation: { warehouseId: args.warehouseId } },
        { toLocation: { warehouseId: args.warehouseId } },
      ];
    }

    const transfers = await prisma.transfer.findMany({
      where: whereClause,
      include: {
        fromLocation: {
          include: { warehouse: true },
        },
        toLocation: {
          include: { warehouse: true },
        },
        items: {
          include: { product: true },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      daysChecked: days,
      count: transfers.length,
      transfers: transfers.map((t) => ({
        id: t.id,
        referenceNumber: t.referenceNumber,
        status: t.status,
        fromWarehouse: t.fromLocation.warehouse.name,
        fromLocation: t.fromLocation.name,
        toWarehouse: t.toLocation.warehouse.name,
        toLocation: t.toLocation.name,
        createdAt: t.createdAt.toISOString(),
        createdBy: t.createdBy?.name || "System",
        items: t.items.map((item) => ({
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
        })),
      })),
    };
  },

  // Tool 9: get_dashboard_summary (reuses dashboardService)
  async get_dashboard_summary(_args: z.infer<typeof getDashboardSummarySchema>) {
    const summary = await dashboardService.getSummary();
    return summary;
  },
};

// Dispatcher that verifies allowlist and validates arguments
export async function executeAiTool(name: string, rawArgs: any): Promise<any> {
  const schema = toolArgumentSchemas[name];
  if (!schema || typeof (aiTools as any)[name] !== "function") {
    throw new Error(
      `Disallowed or unknown AI tool: '${name}'. Only approved read-only tools may be invoked.`
    );
  }

  // Parse and validate arguments with Zod
  let parsedArgs: any = rawArgs;
  if (typeof rawArgs === "string") {
    try {
      parsedArgs = JSON.parse(rawArgs);
    } catch {
      throw new Error(`Malformed JSON arguments provided for tool '${name}'.`);
    }
  }

  const validationResult = schema.safeParse(parsedArgs || {});
  if (!validationResult.success) {
    throw new Error(
      `Invalid arguments for tool '${name}': ${validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ")}`
    );
  }

  // Execute read-only tool
  return await (aiTools as any)[name](validationResult.data);
}
