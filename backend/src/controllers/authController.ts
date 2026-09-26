import { Response } from "express";
import { authService } from "../services/authService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const authController = {
  async register(req: AuthRequest, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: "ok",
        message: "User registered successfully",
        ...result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to register user",
      });
    }
  },

  async login(req: AuthRequest, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        status: "ok",
        message: "Login successful",
        ...result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 401).json({
        status: "error",
        error: error.message || "Invalid credentials",
      });
    }
  },

  async logout(req: AuthRequest, res: Response) {
    // For JWT, server informs client to discard token
    res.status(200).json({
      status: "ok",
      message: "Logged out successfully",
    });
  },

  async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", error: "Unauthenticated" });
        return;
      }
      const user = await authService.getUserById(req.user.id);
      res.status(200).json({
        status: "ok",
        user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to get user profile",
      });
    }
  },

  async forgotPassword(req: AuthRequest, res: Response) {
    try {
      const result = await authService.generateForgotPasswordOtp(req.body.email);
      res.status(200).json({
        status: "ok",
        ...result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: "error",
        error: error.message || "Failed to generate OTP",
      });
    }
  },

  async verifyOtp(req: AuthRequest, res: Response) {
    try {
      const result = await authService.verifyOtp(req.body.email, req.body.otp);
      res.status(200).json({
        status: "ok",
        ...result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        status: "error",
        error: error.message || "Failed to verify OTP",
      });
    }
  },

  async resetPassword(req: AuthRequest, res: Response) {
    try {
      const result = await authService.resetPassword(
        req.body.email,
        req.body.otp,
        req.body.newPassword
      );
      res.status(200).json({
        status: "ok",
        ...result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        status: "error",
        error: error.message || "Failed to reset password",
      });
    }
  },
};
