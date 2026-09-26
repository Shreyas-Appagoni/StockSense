import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { inventoryAgent } from "../ai/inventoryAgent.js";

export const aiController = {
  async chat(req: AuthRequest, res: Response) {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string" || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Message is required and must be a non-empty string.",
        });
        return;
      }

      const result = await inventoryAgent.chat(
        message,
        Array.isArray(history) ? history : [],
        req.user
          ? {
              id: req.user.id,
              name: req.user.name,
              role: req.user.role,
            }
          : undefined
      );

      if (!result.success) {
        const statusCode =
          result.error === "OPENROUTER_NOT_CONFIGURED" ? 503 : 400;
        res.status(statusCode).json({
          success: false,
          error: result.message,
          message: result.message,
          toolCalls: result.toolCalls || [],
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        toolCalls: result.toolCalls || [],
      });
    } catch (err: any) {
      console.error("AI Controller unexpected error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Internal AI processing error",
        message: err.message || "Internal AI processing error",
      });
    }
  },
};
