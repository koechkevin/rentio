import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, phone, email, password, nationalId]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "+254712345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               nationalId:
 *                 type: string
 *                 example: "12345678"
 *     responses:
 *       201:
 *         description: User registered successfully. Verification code sent to email.
 *       400:
 *         description: User already exists or validation error
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email with code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, verificationCode]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               verificationCode:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully, returns token
 *       400:
 *         description: Invalid or expired verification code
 *       404:
 *         description: User not found
 */
router.post("/verify-email", authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification code to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Verification code sent to email
 *       404:
 *         description: User not found
 *       400:
 *         description: Email already verified
 */
router.post("/resend-verification", authController.resendVerificationCode);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+254712345678"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful, returns token and refreshToken
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not active or email not verified
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token generated
 *       401:
 *         description: Invalid token
 */
router.post("/refresh", authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Password reset instructions sent if email exists
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token and verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, verificationCode, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token from reset email
 *               verificationCode:
 *                 type: string
 *                 description: 6-digit verification code from email
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token, code, or validation error
 */
router.post("/reset-password", authController.resetPassword);

export default router;
