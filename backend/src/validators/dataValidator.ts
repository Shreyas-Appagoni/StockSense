import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  unit: z.string().optional().default("units"),
  reorderLevel: z.number().int().nonnegative().optional().default(10),
});

export const createWarehouseSchema = z.object({
  name: z.string().min(2, "Warehouse name must be at least 2 characters"),
  code: z.string().min(2, "Warehouse code must be at least 2 characters"),
  address: z.string().optional(),
});

export const createLocationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters"),
  code: z.string().optional(),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
