import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";

export const getCurrentLease = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lease = await prisma.lease.findFirst({
      where: { userId: req.user!.id, active: true },
      include: { unit: { include: { property: true } }, payments: true },
    });

    if (!lease) {
      throw new AppError("No active lease found", 404);
    }

    res.json({ success: true, data: lease });
  } catch (error) {
    next(error);
  }
};

export const getUserLeases = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const leases = await prisma.lease.findMany({
      where: { userId: req.user!.id },
      include: {
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                county: true,
                town: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ success: true, data: leases });
  } catch (error) {
    next(error);
  }
};
