import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth";

export const initiatePayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { leaseId, amount, type } = req.body;

    // TODO: Implement M-Pesa STK Push integration

    const payment = await prisma.payment.create({
      data: {
        leaseId,
        amount,
        type,
        method: "MPESA",
        status: "PENDING",
      },
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { lease: { userId: req.user!.id } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
