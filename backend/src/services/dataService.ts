import { prisma } from "./databaseService.js";
import {
  CreateCategoryInput,
  CreateProductInput,
  CreateWarehouseInput,
  CreateLocationInput,
} from "../validators/dataValidator.js";

export const dataService = {
  // --- Categories ---
  async getAllCategories() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) {
      const err: any = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }
    return category;
  },

  async createCategory(data: CreateCategoryInput) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      const err: any = new Error("Category with this name already exists");
      err.statusCode = 409;
      throw err;
    }
    return prisma.category.create({ data });
  },

  // --- Products ---
  async getAllProducts() {
    return prisma.product.findMany({
      include: {
        category: true,
        inventory: {
          include: {
            location: {
              include: { warehouse: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: {
          include: {
            location: {
              include: { warehouse: true },
            },
          },
        },
      },
    });
    if (!product) {
      const err: any = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }
    return product;
  },

  async createProduct(data: CreateProductInput) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });
    if (existingSku) {
      const err: any = new Error("Product with this SKU already exists");
      err.statusCode = 409;
      throw err;
    }

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      const err: any = new Error("Referenced category does not exist");
      err.statusCode = 400;
      throw err;
    }

    return prisma.product.create({
      data,
      include: { category: true },
    });
  },

  // --- Warehouses ---
  async getAllWarehouses() {
    return prisma.warehouse.findMany({
      include: {
        locations: true,
      },
      orderBy: { name: "asc" },
    });
  },

  async getWarehouseById(id: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        locations: true,
      },
    });
    if (!warehouse) {
      const err: any = new Error("Warehouse not found");
      err.statusCode = 404;
      throw err;
    }
    return warehouse;
  },

  async createWarehouse(data: CreateWarehouseInput) {
    const existingCode = await prisma.warehouse.findUnique({
      where: { code: data.code },
    });
    if (existingCode) {
      const err: any = new Error("Warehouse with this code already exists");
      err.statusCode = 409;
      throw err;
    }
    return prisma.warehouse.create({ data });
  },

  // --- Locations ---
  async getAllLocations() {
    return prisma.location.findMany({
      include: {
        warehouse: true,
      },
      orderBy: { name: "asc" },
    });
  },

  async getLocationById(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        warehouse: true,
        inventory: {
          include: { product: true },
        },
      },
    });
    if (!location) {
      const err: any = new Error("Location not found");
      err.statusCode = 404;
      throw err;
    }
    return location;
  },

  async createLocation(data: CreateLocationInput) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    });
    if (!warehouse) {
      const err: any = new Error("Referenced warehouse does not exist");
      err.statusCode = 400;
      throw err;
    }
    return prisma.location.create({
      data,
      include: { warehouse: true },
    });
  },

  // --- Inventory ---
  async getAllInventory() {
    return prisma.inventory.findMany({
      include: {
        product: {
          include: { category: true },
        },
        location: {
          include: { warehouse: true },
        },
      },
      orderBy: [{ productId: "asc" }, { locationId: "asc" }],
    });
  },
};
