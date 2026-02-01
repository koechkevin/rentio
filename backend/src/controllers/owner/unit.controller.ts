import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth";
import { PropertyRole } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler";

export const createUnit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { unitNumber, type, monthlyRent, floor, description } = req.body;

    // Check subscription availability
    const subscription = await prisma.propertySubscription.findUnique({
      where: { propertyId: req.propertyId! },
    });

    if (!subscription) {
      throw new AppError(
        "No active subscription. Please purchase unit slots first.",
        403,
      );
    }

    const availableUnits = subscription.paidUnits - subscription.usedUnits;

    if (availableUnits <= 0) {
      throw new AppError(
        "No available unit slots. Please purchase more slots to add units.",
        403,
      );
    }

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        propertyId: req.propertyId!,
        unitNumber,
        type,
        monthlyRent,
        floor,
        description,
      },
    });

    // Increment used units
    await prisma.propertySubscription.update({
      where: { id: subscription.id },
      data: {
        usedUnits: { increment: 1 },
      },
    });

    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

export const getUnits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const units = await prisma.unit.findMany({
      where: { propertyId: req.propertyId!, deletedAt: null },
      include: {
        leases: {
          where: { active: true },
          include: {
            user: { select: { id: true, fullName: true, phone: true } },
          },
        },
      },
    });

    // Filter units based on property role
    let filteredUnits = units;
    if (req.propertyRole === PropertyRole.TENANT) {
      // Tenants only see their own units
      filteredUnits = units.filter((unit: any) =>
        unit.leases.some((lease: any) => lease.userId === req.user!.id),
      );
    }

    res.json({ success: true, data: filteredUnits });
  } catch (error) {
    next(error);
  }
};

export const getUnit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const unit = await prisma.unit.findFirst({
      where: {
        id: req.params.id,
        propertyId: req.propertyId!,
        deletedAt: null,
      },
      include: {
        leases: {
          where: { active: true },
          include: {
            user: { select: { id: true, fullName: true, phone: true } },
          },
        },
      },
    });

    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

export const updateUnit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const unit = await prisma.unit.updateMany({
      where: { id: req.params.id, propertyId: req.propertyId! },
      data: req.body,
    });

    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};
