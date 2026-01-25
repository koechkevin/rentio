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
