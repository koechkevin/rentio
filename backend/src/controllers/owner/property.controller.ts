import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";

export const createProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      slug,
      county,
      town,
      gpsLatitude,
      gpsLongitude,
      ownerProvidedIdentifier,
    } = req.body;

    const property = await prisma.property.create({
      data: {
        name,
        slug,
        county,
        town,
        gpsLatitude,
        gpsLongitude,
        ownerProvidedIdentifier,
        ownerId: req.user!.id,
      },
    });

    // Automatically assign owner role
    await prisma.userPropertyRole.create({
      data: {
        userId: req.user!.id,
        propertyId: property.id,
        role: "OWNER",
        assignedBy: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

export const getProperties = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.user!.id, deletedAt: null },
      include: {
        _count: { select: { units: true } },
        userPropertyRoles: {
          where: { removedAt: null },
        },
      },
    });

    res.json({ success: true, data: properties });
  } catch (error) {
    next(error);
  }
};

export const getProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const property = await prisma.property.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user!.id,
      },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.json({ success: true, data: property });
  } catch (error) {
    return next(error);
  }
};

export const updateProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const property = await prisma.property.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user!.id,
      },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

export const getDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.params.id;

    // Verify ownership
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId: req.user!.id },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    const [units, activeLeases, payments, issues] = await Promise.all([
      prisma.unit.findMany({ where: { propertyId, deletedAt: null } }),
      prisma.lease.findMany({ where: { unit: { propertyId }, active: true } }),
      prisma.payment.findMany({
        where: { lease: { unit: { propertyId } }, status: "COMPLETED" },
      }),
      prisma.issue.findMany({
        where: { unit: { propertyId }, status: { not: "RESOLVED" } },
      }),
    ]);

    const occupancyRate = units.length
      ? (activeLeases.length / units.length) * 100
      : 0;
    const monthlyIncome = payments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0,
    );

    res.json({
      success: true,
      data: {
        occupancyRate,
        monthlyIncome,
        totalUnits: units.length,
        occupiedUnits: activeLeases.length,
        openIssues: issues.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
