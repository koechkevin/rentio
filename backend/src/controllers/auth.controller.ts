import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";
import { GlobalRole } from "@prisma/client";
import { sendVerificationEmail } from "../services/email.service";
import { AuthRequest } from "../middleware/auth";

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fullName, phone, email, password, nationalId } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email: email || undefined }] },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await prisma.user.create({
      data: {
        fullName,
        phone,
        email,
        nationalId,
        password: hashedPassword,
        globalRole: GlobalRole.USER,
        verificationCode,
        verificationCodeExpiresAt,
        isEmailVerified: false,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        globalRole: true,
        isEmailVerified: true,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Verify email with code sent to user
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    if (!user.verificationCode || user.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (
      user.verificationCodeExpiresAt &&
      user.verificationCodeExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        globalRole: true,
        isEmailVerified: true,
      },
    });

    const token = jwt.sign(
      { id: updatedUser.id, globalRole: updatedUser.globalRole },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    return res.json({
      success: true,
      message: "Email verified successfully",
      data: { user: updatedUser, token },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Resend verification code to email
 */
export const resendVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email already verified", 400);
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpiresAt,
      },
    });

    await sendVerificationEmail(email, verificationCode);

    res.json({
      success: true,
      message: "Verification code sent to email",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        userPropertyRoles: {
          where: { removedAt: null },
        },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("Account is not active", 403);
    }

    if (!user.isEmailVerified) {
      throw new AppError("Please verify your email before logging in", 403);
    }

    const token = jwt.sign(
      { id: user.id, globalRole: user.globalRole },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions,
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          globalRole: user.globalRole,
          userPropertyRoles: user.userPropertyRoles.map((pr: any) => ({
            propertyId: pr.propertyId,
            role: pr.role,
          })),
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as { id: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new AppError("Invalid token", 401);
    }

    const newToken = jwt.sign(
      { id: user.id, globalRole: user.globalRole },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    res.json({ success: true, data: { token: newToken } });
  } catch (error) {
    next(new AppError("Invalid refresh token", 401));
  }
};

// Implement logout if using token blacklisting or similar strategy
export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // For stateless JWT, logout can be handled on client side by deleting the token
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        nationalId: true,
        globalRole: true,
        status: true,
        isEmailVerified: true,
        displayPicture: true,
        backgroundPicture: true,
        about: true,
        website: true,
        createdAt: true,
        updatedAt: true,
        userPropertyRoles: {
          where: { removedAt: null },
          select: {
            propertyId: true,
            role: true,
            property: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          nationalId: user.nationalId,
          globalRole: user.globalRole,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
          displayPicture: user.displayPicture,
          backgroundPicture: user.backgroundPicture,
          about: user.about,
          website: user.website,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        userPropertyRoles: user.userPropertyRoles,
      },
    });
  } catch (error) {
    next(error);
  }
};
