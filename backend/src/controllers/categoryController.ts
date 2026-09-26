import { Request, Response } from "express";
import { dataService } from "../services/dataService.js";

export const categoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await dataService.getAllCategories();
      res.status(200).json({ status: "ok", count: categories.length, data: categories });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message || "Failed to fetch categories" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const category = await dataService.getCategoryById(req.params.id);
      res.status(200).json({ status: "ok", data: category });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to fetch category",
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const category = await dataService.createCategory(req.body);
      res.status(201).json({
        status: "ok",
        message: "Category created successfully",
        data: category,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to create category",
      });
    }
  },
};
