import { z } from "zod";

export const receiptItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Received quantity must be greater than 0"),
  unitPrice: z.number().nonnegative().optional(),
});

export const createReceiptSchema = z.object({
  referenceNumber: z.string().min(3).optional(),
  supplierId: z.string().optional(),
  destinationLocationId: z.string().min(1, "Destination location ID is required"),
  notes: z.string().optional(),
  items: z.array(receiptItemSchema).min(1, "At least one receipt item is required"),
});

export const deliveryItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Requested delivery quantity must be greater than 0"),
});

export const createDeliverySchema = z.object({
  referenceNumber: z.string().min(3).optional(),
  customerName: z.string().optional(),
  sourceLocationId: z.string().min(1, "Source location ID is required"),
  notes: z.string().optional(),
  items: z.array(deliveryItemSchema).min(1, "At least one delivery item is required"),
});

export const transferItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Transfer quantity must be greater than 0"),
});

export const createTransferSchema = z
  .object({
    referenceNumber: z.string().min(3).optional(),
    fromLocationId: z.string().min(1, "Source location ID is required"),
    toLocationId: z.string().min(1, "Destination location ID is required"),
    notes: z.string().optional(),
    items: z.array(transferItemSchema).min(1, "At least one transfer item is required"),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: "Source and destination locations cannot be the same",
    path: ["toLocationId"],
  });

export const adjustmentItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  countedQuantity: z.number().int().nonnegative("Counted quantity must be 0 or greater"),
  notes: z.string().optional(),
});

export const createAdjustmentSchema = z.object({
  referenceNumber: z.string().min(3).optional(),
  locationId: z.string().min(1, "Location ID is required"),
  reason: z.string().min(2, "Reason is required"),
  items: z.array(adjustmentItemSchema).min(1, "At least one adjustment item is required"),
});

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>;
