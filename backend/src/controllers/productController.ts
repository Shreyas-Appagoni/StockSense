import { Request, Response } from "express";
import { dataService } from "../services/dataService.js";

export const productController = {
  async getAll(req: Request, res: Response) {
    try {
      const products = await dataService.getAllProducts();
      res.status(200).json({ status: "ok", count: products.length, data: products });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch products" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const product = await dataService.getProductById(req.params.id);
      res.status(200).json({ status: "ok", data: product });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to fetch product",
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const product = await dataService.createProduct(req.body);
      res.status(201).json({
        status: "ok",
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to create product",
      });
    }
  },
};
