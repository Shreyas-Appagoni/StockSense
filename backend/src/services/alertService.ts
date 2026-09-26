import { Prisma, AlertType, AlertStatus } from "@prisma/client";
import { prisma } from "./databaseService.js";

export const alertService = {
  /**
   * Evaluates and updates alerts for a given product and location inside an ongoing transaction.
   * Ensures no duplicate active alerts are spammed.
   */
  async evaluateStockAlert(
    tx: Prisma.TransactionClient,
    productId: string,
    locationId: string,
    newQuantity: number,
    reorderLevel: number
  ) {
    if (newQuantity <= 0) {
      // 1. OUT OF STOCK
      const existingOos = await tx.alert.findFirst({
        where: {
          productId,
          locationId,
          alertType: AlertType.OUT_OF_STOCK,
          status: { in: [AlertStatus.UNREAD, AlertStatus.ACKNOWLEDGED] },
        },
      });

      if (!existingOos) {
        await tx.alert.create({
          data: {
            productId,
            locationId,
            alertType: AlertType.OUT_OF_STOCK,
            message: `Product is OUT OF STOCK. Current quantity: ${newQuantity}`,
            status: AlertStatus.UNREAD,
          },
        });
      }

      // Automatically resolve any pending LOW_STOCK alerts since it has reached OUT_OF_STOCK
      await tx.alert.updateMany({
        where: {
          productId,
          locationId,
          alertType: AlertType.LOW_STOCK,
          status: { in: [AlertStatus.UNREAD, AlertStatus.ACKNOWLEDGED] },
        },
        data: { status: AlertStatus.RESOLVED },
      });
    } else if (newQuantity <= reorderLevel) {
      // 2. LOW STOCK
      const existingLow = await tx.alert.findFirst({
        where: {
          productId,
          locationId,
          alertType: AlertType.LOW_STOCK,
          status: { in: [AlertStatus.UNREAD, AlertStatus.ACKNOWLEDGED] },
        },
      });

      if (!existingLow) {
        await tx.alert.create({
          data: {
            productId,
            locationId,
            alertType: AlertType.LOW_STOCK,
            message: `Product is LOW ON STOCK. Current quantity: ${newQuantity} (Reorder level: ${reorderLevel})`,
            status: AlertStatus.UNREAD,
          },
        });
      }

      // Automatically resolve any previous OUT_OF_STOCK alert since quantity is now > 0
      await tx.alert.updateMany({
        where: {
          productId,
          locationId,
          alertType: AlertType.OUT_OF_STOCK,
          status: { in: [AlertStatus.UNREAD, AlertStatus.ACKNOWLEDGED] },
        },
        data: { status: AlertStatus.RESOLVED },
      });
    } else {
      // 3. HEALTHY STOCK (quantity > reorderLevel)
      // Resolve any previous unread/acknowledged alerts for this product/location
      await tx.alert.updateMany({
        where: {
          productId,
          locationId,
          status: { in: [AlertStatus.UNREAD, AlertStatus.ACKNOWLEDGED] },
        },
        data: { status: AlertStatus.RESOLVED },
      });
    }
  },

  async getAllAlerts(filters?: { status?: AlertStatus; alertType?: AlertType }) {
    return prisma.alert.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.alertType ? { alertType: filters.alertType } : {}),
      },
      include: {
        product: true,
        location: {
          include: { warehouse: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateAlertStatus(id: string, status: AlertStatus) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) {
      const err: any = new Error("Alert not found");
      err.statusCode = 404;
      throw err;
    }
    return prisma.alert.update({
      where: { id },
      data: { status },
      include: { product: true, location: true },
    });
  },
};
