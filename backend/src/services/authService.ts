import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "./databaseService.js";
import { RegisterInput, LoginInput } from "../validators/authValidator.js";

const JWT_SECRET = process.env.JWT_SECRET || "stocksense-jwt-secret-dev";
const JWT_EXPIRES_IN = "24h";

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  passwordHash?: string;
}): SanitizedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function generateToken(user: SanitizedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const error: any = new Error("User with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role as Role,
      },
    });

    const sanitized = sanitizeUser(user);
    const token = generateToken(sanitized);

    return { user: sanitized, token };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      const error: any = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const sanitized = sanitizeUser(user);
    const token = generateToken(sanitized);

    return { user: sanitized, token };
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return sanitizeUser(user);
  },

  async generateForgotPasswordOtp(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error: any = new Error("User not found with this email");
      error.statusCode = 404;
      throw error;
    }

    // 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordResetOtp.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    const isDev = process.env.NODE_ENV !== "production";
    return {
      message: "Password reset OTP generated successfully",
      // Surface devOtp in non-production for local testing as instructed
      ...(isDev ? { devOtp: otp } : {}),
    };
  },

  async verifyOtp(email: string, otp: string) {
    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      const error: any = new Error("Invalid or expired OTP");
      error.statusCode = 400;
      throw error;
    }

    return { valid: true, message: "OTP verified successfully" };
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      const error: any = new Error("Invalid or expired OTP");
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and mark OTP as used
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { passwordHash },
      }),
      prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return { message: "Password reset successfully. You can now login with your new password." };
  },
};
