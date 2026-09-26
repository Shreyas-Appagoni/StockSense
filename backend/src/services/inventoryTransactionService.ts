import {
  Prisma,
  ReceiptStatus,
  DeliveryStatus,
  TransferStatus,
  AdjustmentStatus,
  TransactionType,
} from "@prisma/client";
import { prisma } from "./databaseService.js";
import { alertService } from "./alertService.js";
import {
  CreateReceiptInput,
  CreateDeliveryInput,
  CreateTransferInput,
  CreateAdjustmentInput,
} from "../validators/transactionValidator.js";

export const inventoryTransactionService = {
  // ==========================================
  // 1. RECEIPTS WORKFLOW
  // ==========================================

  async getAllReceipts() {
    return prisma.receipt.findMany({
      include: {
        supplier: true,
        destinationLocation: {
          include: { warehouse: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getReceiptById(id: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        supplier: true,
        destinationLocation: {
          include: { warehouse: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: { product: true },
        },
      },
    });

    if (!receipt) {
      const err: any = new Error("Receipt not found");
      err.statusCode = 404;
      throw err;
    }
    return receipt;
  },

  async createReceipt(data: CreateReceiptInput, userId?: string) {
    // 1. Verify destination location exists
    const location = await prisma.location.findUnique({
      where: { id: data.destinationLocationId },
    });
    if (!location) {
      const err: any = new Error("Destination location not found");
      err.statusCode = 404;
      throw err;
    }

    // 2. Verify supplier if provided
    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });
      if (!supplier) {
        const err: any = new Error("Supplier not found");
        err.statusCode = 404;
        throw err;
      }
    }

    // 3. Verify all products exist
    for (const item of data.items) {
      const prod = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!prod) {
        const err: any = new Error(`Product ${item.productId} not found`);
        err.statusCode = 404;
        throw err;
      }
    }

    const refNumber = data.referenceNumber || `REC-${Date.now()}`;

    // 4. Create Draft Receipt (does NOT change inventory yet)
    return prisma.receipt.create({
      data: {
        referenceNumber: refNumber,
        supplierId: data.supplierId,
        destinationLocationId: data.destinationLocationId,
        notes: data.notes,
        createdById: userId,
        status: ReceiptStatus.DRAFT,
        items: {
          create: data.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        destinationLocation: true,
        supplier: true,
      },
    });
  },

  async validateReceipt(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          destinationLocation: true,
        },
      });

      if (!receipt) {
        const err: any = new Error("Receipt not found");
        err.statusCode = 404;
        throw err;
      }

      if (receipt.status === ReceiptStatus.VALIDATED) {
        const err: any = new Error("Receipt is already validated");
        err.statusCode = 400;
        throw err;
      }

      if (receipt.status === ReceiptStatus.CANCELLED) {
        const err: any = new Error("Cannot validate a cancelled receipt");
        err.statusCode = 400;
        throw err;
      }

      // Process each item atomically
      for (const item of receipt.items) {
        // Find or create inventory at destination
        let inventory = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: receipt.destinationLocationId,
            },
          },
        });

        if (!inventory) {
          inventory = await tx.inventory.create({
            data: {
              productId: item.productId,
              locationId: receipt.destinationLocationId,
              quantity: 0,
            },
          });
        }

        const previousQuantity = inventory.quantity;
        const newQuantity = previousQuantity + item.quantity;

        // 1. Update inventory
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: newQuantity },
        });

        // 2. Create StockLedger entry
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            locationId: receipt.destinationLocationId,
            quantityChange: item.quantity,
            previousQuantity,
            newQuantity,
            transactionType: TransactionType.RECEIPT,
            referenceId: receipt.id,
            userId,
            notes: `Receipt validated: ${receipt.referenceNumber}`,
          },
        });

        // 3. Evaluate alerts
        await alertService.evaluateStockAlert(
          tx,
          item.productId,
          receipt.destinationLocationId,
          newQuantity,
          item.product.reorderLevel
        );
      }

      // 4. Mark receipt as VALIDATED
      return tx.receipt.update({
        where: { id: receipt.id },
        data: { status: ReceiptStatus.VALIDATED },
        include: {
          items: { include: { product: true } },
          destinationLocation: true,
          supplier: true,
        },
      });
    });
  },

  // ==========================================
  // 2. DELIVERIES WORKFLOW
  // ==========================================

  async getAllDeliveries() {
    return prisma.delivery.findMany({
      include: {
        sourceLocation: {
          include: { warehouse: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getDeliveryById(id: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        sourceLocation: {
          include: { warehouse: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: { product: true },
        },
      },
    });

    if (!delivery) {
      const err: any = new Error("Delivery not found");
      err.statusCode = 404;
      throw err;
    }
    return delivery;
  },

  async createDelivery(data: CreateDeliveryInput, userId?: string) {
    // 1. Verify source location exists
    const location = await prisma.location.findUnique({
      where: { id: data.sourceLocationId },
    });
    if (!location) {
      const err: any = new Error("Source location not found");
      err.statusCode = 404;
      throw err;
    }

    // 2. Verify products exist
    for (const item of data.items) {
      const prod = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!prod) {
        const err: any = new Error(`Product ${item.productId} not found`);
        err.statusCode = 404;
        throw err;
      }
    }

    const refNumber = data.referenceNumber || `DEL-${Date.now()}`;

    return prisma.delivery.create({
      data: {
        referenceNumber: refNumber,
        customerName: data.customerName,
        sourceLocationId: data.sourceLocationId,
        notes: data.notes,
        createdById: userId,
        status: DeliveryStatus.DRAFT,
        items: {
          create: data.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        sourceLocation: true,
      },
    });
  },

  async pickDelivery(id: string) {
    const delivery = await prisma.delivery.findUnique({ where: { id } });
    if (!delivery) {
      const err: any = new Error("Delivery not found");
      err.statusCode = 404;
      throw err;
    }
    if (delivery.status !== DeliveryStatus.DRAFT) {
      const err: any = new Error(`Cannot pick delivery with status ${delivery.status}`);
      err.statusCode = 400;
      throw err;
    }
    return prisma.delivery.update({
      where: { id },
      data: { status: DeliveryStatus.PICKED },
      include: { items: { include: { product: true } }, sourceLocation: true },
    });
  },

  async packDelivery(id: string) {
    const delivery = await prisma.delivery.findUnique({ where: { id } });
    if (!delivery) {
      const err: any = new Error("Delivery not found");
      err.statusCode = 404;
      throw err;
    }
    if (delivery.status !== DeliveryStatus.PICKED && delivery.status !== DeliveryStatus.DRAFT) {
      const err: any = new Error(`Cannot pack delivery with status ${delivery.status}`);
      err.statusCode = 400;
      throw err;
    }
    return prisma.delivery.update({
      where: { id },
      data: { status: DeliveryStatus.PACKED },
      include: { items: { include: { product: true } }, sourceLocation: true },
    });
  },

  async validateDelivery(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          sourceLocation: true,
        },
      });

      if (!delivery) {
        const err: any = new Error("Delivery not found");
        err.statusCode = 404;
        throw err;
      }

      if (delivery.status === DeliveryStatus.VALIDATED) {
        const err: any = new Error("Delivery is already validated");
        err.statusCode = 400;
        throw err;
      }

      if (delivery.status === DeliveryStatus.CANCELLED) {
        const err: any = new Error("Cannot validate a cancelled delivery");
        err.statusCode = 400;
        throw err;
      }

      // CRITICAL STEP 1: Check ALL items for sufficient stock FIRST!
      const inventoryMap = new Map<string, { id: string; quantity: number; reorderLevel: number }>();

      for (const item of delivery.items) {
        const inv = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: delivery.sourceLocationId,
            },
          },
        });

        const available = inv ? inv.quantity : 0;
        if (available < item.quantity) {
          const err: any = new Error(
            `Insufficient stock for product ${item.product.name} (${item.product.sku}) at source location. Available: ${available}, Requested: ${item.quantity}`
          );
          err.statusCode = 400;
          throw err;
        }

        inventoryMap.set(item.productId, {
          id: inv!.id,
          quantity: available,
          reorderLevel: item.product.reorderLevel,
        });
      }

      // CRITICAL STEP 2: Stock is sufficient for all items; execute deductions atomically
      for (const item of delivery.items) {
        const cached = inventoryMap.get(item.productId)!;
        const previousQuantity = cached.quantity;
        const newQuantity = previousQuantity - item.quantity;

        // 1. Update Inventory
        await tx.inventory.update({
          where: { id: cached.id },
          data: { quantity: newQuantity },
        });

        // 2. Create StockLedger entry
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            locationId: delivery.sourceLocationId,
            quantityChange: -item.quantity,
            previousQuantity,
            newQuantity,
            transactionType: TransactionType.DELIVERY,
            referenceId: delivery.id,
            userId,
            notes: `Delivery validated: ${delivery.referenceNumber}`,
          },
        });

        // 3. Evaluate alerts
        await alertService.evaluateStockAlert(
          tx,
          item.productId,
          delivery.sourceLocationId,
          newQuantity,
          cached.reorderLevel
        );
      }

      // 4. Mark delivery as VALIDATED
      return tx.delivery.update({
        where: { id: delivery.id },
        data: { status: DeliveryStatus.VALIDATED },
        include: {
          items: { include: { product: true } },
          sourceLocation: true,
        },
      });
    });
  },

  // ==========================================
  // 3. TRANSFERS WORKFLOW
  // ==========================================

  async getAllTransfers() {
    return prisma.transfer.findMany({
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getTransferById(id: string) {
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    if (!transfer) {
      const err: any = new Error("Transfer not found");
      err.statusCode = 404;
      throw err;
    }
    return transfer;
  },

  async createTransfer(data: CreateTransferInput, userId?: string) {
    if (data.fromLocationId === data.toLocationId) {
      const err: any = new Error("Source and destination locations cannot be the same");
      err.statusCode = 400;
      throw err;
    }

    const fromLoc = await prisma.location.findUnique({ where: { id: data.fromLocationId } });
    if (!fromLoc) {
      const err: any = new Error("Source location not found");
      err.statusCode = 404;
      throw err;
    }

    const toLoc = await prisma.location.findUnique({ where: { id: data.toLocationId } });
    if (!toLoc) {
      const err: any = new Error("Destination location not found");
      err.statusCode = 404;
      throw err;
    }

    for (const item of data.items) {
      const prod = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!prod) {
        const err: any = new Error(`Product ${item.productId} not found`);
        err.statusCode = 404;
        throw err;
      }
    }

    const refNumber = data.referenceNumber || `TRF-${Date.now()}`;

    return prisma.transfer.create({
      data: {
        referenceNumber: refNumber,
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        notes: data.notes,
        createdById: userId,
        status: TransferStatus.DRAFT,
        items: {
          create: data.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        fromLocation: true,
        toLocation: true,
      },
    });
  },

  async validateTransfer(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          fromLocation: true,
          toLocation: true,
        },
      });

      if (!transfer) {
        const err: any = new Error("Transfer not found");
        err.statusCode = 404;
        throw err;
      }

      if (transfer.status === TransferStatus.VALIDATED || transfer.status === TransferStatus.COMPLETED) {
        const err: any = new Error("Transfer is already validated");
        err.statusCode = 400;
        throw err;
      }

      if (transfer.status === TransferStatus.CANCELLED) {
        const err: any = new Error("Cannot validate a cancelled transfer");
        err.statusCode = 400;
        throw err;
      }

      // CRITICAL STEP 1: Verify all items have sufficient stock at source location!
      const sourceInvMap = new Map<string, { id: string; quantity: number; reorderLevel: number }>();

      for (const item of transfer.items) {
        const srcInv = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.fromLocationId,
            },
          },
        });

        const available = srcInv ? srcInv.quantity : 0;
        if (available < item.quantity) {
          const err: any = new Error(
            `Insufficient stock for product ${item.product.name} (${item.product.sku}) at source location. Available: ${available}, Requested: ${item.quantity}`
          );
          err.statusCode = 400;
          throw err;
        }

        sourceInvMap.set(item.productId, {
          id: srcInv!.id,
          quantity: available,
          reorderLevel: item.product.reorderLevel,
        });
      }

      // CRITICAL STEP 2: Stock is sufficient for all items; execute transfer atomically
      for (const item of transfer.items) {
        // --- 1. Deduct from Source ---
        const srcCached = sourceInvMap.get(item.productId)!;
        const srcPrev = srcCached.quantity;
        const srcNew = srcPrev - item.quantity;

        await tx.inventory.update({
          where: { id: srcCached.id },
          data: { quantity: srcNew },
        });

        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            locationId: transfer.fromLocationId,
            quantityChange: -item.quantity,
            previousQuantity: srcPrev,
            newQuantity: srcNew,
            transactionType: TransactionType.TRANSFER_OUT,
            referenceId: transfer.id,
            userId,
            notes: `Transfer OUT to location ${transfer.toLocation.name} (${transfer.referenceNumber})`,
          },
        });

        await alertService.evaluateStockAlert(
          tx,
          item.productId,
          transfer.fromLocationId,
          srcNew,
          srcCached.reorderLevel
        );

        // --- 2. Add to Destination ---
        let dstInv = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.toLocationId,
            },
          },
        });

        if (!dstInv) {
          dstInv = await tx.inventory.create({
            data: {
              productId: item.productId,
              locationId: transfer.toLocationId,
              quantity: 0,
            },
          });
        }

        const dstPrev = dstInv.quantity;
        const dstNew = dstPrev + item.quantity;

        await tx.inventory.update({
          where: { id: dstInv.id },
          data: { quantity: dstNew },
        });

        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            locationId: transfer.toLocationId,
            quantityChange: item.quantity,
            previousQuantity: dstPrev,
            newQuantity: dstNew,
            transactionType: TransactionType.TRANSFER_IN,
            referenceId: transfer.id,
            userId,
            notes: `Transfer IN from location ${transfer.fromLocation.name} (${transfer.referenceNumber})`,
          },
        });

        await alertService.evaluateStockAlert(
          tx,
          item.productId,
          transfer.toLocationId,
          dstNew,
          item.product.reorderLevel
        );
      }

      // Mark transfer as VALIDATED (and COMPLETED)
      return tx.transfer.update({
        where: { id: transfer.id },
        data: { status: TransferStatus.VALIDATED },
        include: {
          items: { include: { product: true } },
          fromLocation: true,
          toLocation: true,
        },
      });
    });
  },

  // ==========================================
  // 4. ADJUSTMENTS WORKFLOW
  // ==========================================

  async getAllAdjustments() {
    return prisma.adjustment.findMany({
      include: {
        location: { include: { warehouse: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getAdjustmentById(id: string) {
    const adjustment = await prisma.adjustment.findUnique({
      where: { id },
      include: {
        location: { include: { warehouse: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    if (!adjustment) {
      const err: any = new Error("Adjustment not found");
      err.statusCode = 404;
      throw err;
    }
    return adjustment;
  },

  async createAdjustment(data: CreateAdjustmentInput, userId?: string) {
    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location) {
      const err: any = new Error("Location not found");
      err.statusCode = 404;
      throw err;
    }

    for (const item of data.items) {
      if (item.countedQuantity < 0) {
        const err: any = new Error("Counted quantity cannot be negative");
        err.statusCode = 400;
        throw err;
      }
      const prod = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!prod) {
        const err: any = new Error(`Product ${item.productId} not found`);
        err.statusCode = 404;
        throw err;
      }
    }

    const refNumber = data.referenceNumber || `ADJ-${Date.now()}`;

    return prisma.adjustment.create({
      data: {
        referenceNumber: refNumber,
        locationId: data.locationId,
        reason: data.reason,
        createdById: userId,
        status: AdjustmentStatus.DRAFT,
        items: {
          create: data.items.map((it) => ({
            productId: it.productId,
            countedQuantity: it.countedQuantity,
            previousQuantity: 0,
            notes: it.notes,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        location: true,
      },
    });
  },

  async validateAdjustment(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const adjustment = await tx.adjustment.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          location: true,
        },
      });

      if (!adjustment) {
        const err: any = new Error("Adjustment not found");
        err.statusCode = 404;
        throw err;
      }

      if (adjustment.status === AdjustmentStatus.VALIDATED || adjustment.status === AdjustmentStatus.APPLIED) {
        const err: any = new Error("Adjustment is already validated");
        err.statusCode = 400;
        throw err;
      }

      if (adjustment.status === AdjustmentStatus.CANCELLED) {
        const err: any = new Error("Cannot validate a cancelled adjustment");
        err.statusCode = 400;
        throw err;
      }

      // Execute adjustment atomically for each item
      for (const item of adjustment.items) {
        if (item.countedQuantity < 0) {
          const err: any = new Error("Counted quantity cannot be negative");
          err.statusCode = 400;
          throw err;
        }

        let inventory = await tx.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: adjustment.locationId,
            },
          },
        });

        if (!inventory) {
          inventory = await tx.inventory.create({
            data: {
              productId: item.productId,
              locationId: adjustment.locationId,
              quantity: 0,
            },
          });
        }

        const previousQuantity = inventory.quantity;
        const newQuantity = item.countedQuantity;
        const difference = newQuantity - previousQuantity;

        // 1. Set inventory to physical counted quantity
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: newQuantity },
        });

        // 2. Update item previous quantity for audit record
        await tx.adjustmentItem.update({
          where: { id: item.id },
          data: { previousQuantity },
        });

        // 3. Create StockLedger entry
        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            locationId: adjustment.locationId,
            quantityChange: difference,
            previousQuantity,
            newQuantity,
            transactionType: TransactionType.ADJUSTMENT,
            referenceId: adjustment.id,
            userId,
            notes: `Adjustment validated: ${adjustment.referenceNumber} (${adjustment.reason})`,
          },
        });

        // 4. Evaluate alerts
        await alertService.evaluateStockAlert(
          tx,
          item.productId,
          adjustment.locationId,
          newQuantity,
          item.product.reorderLevel
        );
      }

      // Mark adjustment as VALIDATED
      return tx.adjustment.update({
        where: { id: adjustment.id },
        data: { status: AdjustmentStatus.VALIDATED },
        include: {
          items: { include: { product: true } },
          location: true,
        },
      });
    });
  },

  // ==========================================
  // 5. STOCK LEDGER AUDIT QUERIES
  // ==========================================

  async getAllLedgerEntries(filters?: {
    productId?: string;
    locationId?: string;
    transactionType?: TransactionType;
  }) {
    return prisma.stockLedger.findMany({
      where: {
        ...(filters?.productId ? { productId: filters.productId } : {}),
        ...(filters?.locationId ? { locationId: filters.locationId } : {}),
        ...(filters?.transactionType ? { transactionType: filters.transactionType } : {}),
      },
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
    });
  },
};
