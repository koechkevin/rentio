import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";
import { PropertyRole } from "@prisma/client";
import { resetPasswordUtil } from "../auth.controller";
import bcrypt from "bcrypt";

export const assignRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const { email, nationalId, phone, role } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    // Verify property exists and user is owner
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId: req.user!.id },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    // Check if user exists by email
    let targetUser = await prisma.user.findUnique({
      where: { email },
    });

    let userCreated = false;

    // If user doesn't exist, create them
    if (!targetUser) {
      if (!nationalId || !phone) {
        throw new AppError(
          "Email, nationalId, and phone are required for new users",
          400,
        );
      }
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      targetUser = await prisma.user.create({
        data: {
          email,
          nationalId,
          phone,
          fullName: email.split("@")[0],
          status: "INACTIVE",
          isEmailVerified: false,
          password: hashedPassword,
        },
      });

      userCreated = true;

      // Send password reset email
      try {
        await resetPasswordUtil(email);
      } catch (emailError) {
        throw new AppError(
          "User created but failed to send password reset email. Please contact support.",
          500,
        );
      }
    }

    // Check if role already exists
    const existingRole = await prisma.userPropertyRole.findFirst({
      where: {
        userId: targetUser.id,
        propertyId,
        role: role as PropertyRole,
        removedAt: null,
      },
    });

    if (existingRole) {
      throw new AppError("User already has this role", 400);
    }

    // Assign role
    const propertyRole = await prisma.userPropertyRole.create({
      data: {
        userId: targetUser.id,
        propertyId,
        role: role as PropertyRole,
        assignedBy: req.user!.id,
      },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        assignedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        propertyId,
        action: "ASSIGN_ROLE",
        entity: "PropertyRole",
        entityId: propertyRole.id,
        changes: { role, userId: targetUser.id, userCreated },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    const message = userCreated
      ? `New user created and ${role} role assigned to ${targetUser.email}. Password reset email sent.`
      : `${role} role assigned to ${targetUser.fullName || targetUser.email}`;

    res.status(201).json({
      success: true,
      data: propertyRole,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const removeRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId, userId } = req.params;

    // Verify property exists and user is owner
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId: req.user!.id },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    // Find and soft delete role
    const propertyRole = await prisma.userPropertyRole.findFirst({
      where: {
        userId,
        propertyId,
        removedAt: null,
      },
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });

    if (!propertyRole) {
      throw new AppError("Role assignment not found", 404);
    }
    const isOwnerRole = propertyRole.role === PropertyRole.OWNER;
    // Prevent removing owner's own OWNER role
    if (userId === req.user!.id && isOwnerRole) {
      throw new AppError("Cannot remove your own OWNER role", 400);
    }

    // Soft delete
    const updated = await prisma.userPropertyRole.update({
      where: { id: propertyRole.id },
      data: { removedAt: new Date() },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        propertyId,
        action: "REMOVE_ROLE",
        entity: "PropertyRole",
        entityId: propertyRole.id,
        changes: { role: propertyRole.role, userId },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    res.json({
      success: true,
      data: updated,
      message: `role removed from ${propertyRole.user.fullName}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const { role } = req.query;

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    const members = await prisma.userPropertyRole.findMany({
      where: { propertyId, role: role as PropertyRole, removedAt: null },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            status: true,
          },
        },
        assignedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};
