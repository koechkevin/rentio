import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";
import { PropertyRole } from "@prisma/client";

export const assignRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const { userId, role } = req.body;

    // Verify property exists and user is owner
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId: req.user!.id },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    // Check if role already exists
    const existingRole = await prisma.userPropertyRole.findFirst({
      where: {
        userId,
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
        userId,
        propertyId,
        role: role as PropertyRole,
        assignedBy: req.user!.id,
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
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
        changes: { role, userId },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    res.status(201).json({
      success: true,
      data: propertyRole,
      message: `${role} role assigned to ${targetUser.fullName}`,
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
    const { propertyId } = req.params;
    const { userId, role } = req.body;

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
        role: role as PropertyRole,
        removedAt: null,
      },
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });

    if (!propertyRole) {
      throw new AppError("Role assignment not found", 404);
    }

    // Prevent removing owner's own OWNER role
    if (userId === req.user!.id && role === "OWNER") {
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
        changes: { role, userId },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    res.json({
      success: true,
      data: updated,
      message: `${role} role removed from ${propertyRole.user.fullName}`,
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

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    const members = await prisma.userPropertyRole.findMany({
      where: { propertyId, removedAt: null },
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
