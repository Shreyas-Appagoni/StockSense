import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../validators/authValidator.js";

const router = Router();

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.getMe);

router.post("/forgot-password", validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post("/verify-otp", validateBody(verifyOtpSchema), authController.verifyOtp);
router.post("/reset-password", validateBody(resetPasswordSchema), authController.resetPassword);

export default router;
