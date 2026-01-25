import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth";

export const createLease = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, unitId, leaseStart, agreedRent, deposit } = req.body;

    const lease = await prisma.lease.create({
      data: { userId, unitId, leaseStart, agreedRent, deposit },
    });

    await prisma.unit.update({
      where: { id: unitId },
      data: { status: "OCCUPIED" },
    });

    res.status(201).json({ success: true, data: lease });
  } catch (error) {
    next(error);
  }
};

export const getLeases = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const leases = await prisma.lease.findMany({
      where: { unit: { propertyId: req.propertyId! } },
      include: { user: true, unit: true },
    });

    res.json({ success: true, data: leases });
  } catch (error) {
    next(error);
  }
};

export const terminateLease = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lease = await prisma.lease.update({
      where: { id: req.params.id },
      data: { active: false, terminatedAt: new Date() },
    });

    await prisma.unit.update({
      where: { id: lease.unitId },
      data: { status: "VACANT" },
    });

    res.json({ success: true, data: lease });
  } catch (error) {
    next(error);
  }
};
