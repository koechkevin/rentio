import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth";
import {
  processPayment,
  calculateArrears,
} from "../../services/payment.service";

export const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { leaseId, amount, type, mpesaReceipt, reference } = req.body;

    const payment = await prisma.payment.create({
      data: {
        leaseId,
        amount,
        type,
        method: "MPESA",
        status: "PENDING",
        mpesaReceipt,
        reference,
        unallocatedAmount: amount, // Initially all unallocated
      },
    });

    // Process payment allocation in background (or could be done via webhook)
    // For now, we'll process immediately if status is COMPLETED
    if (req.body.status === "COMPLETED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED" },
      });
      await processPayment(payment.id);
    }

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
      include: {
        allocations: {
          include: {
            invoice: {
              select: {
                invoiceNumber: true,
                totalAmount: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const getArrears = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const arrears = await calculateArrears(userId);

    res.json({
      success: true,
      data: {
        customerId: userId,
        arrears: arrears.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const processPaymentManually = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { lease: true },
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    // Verify ownership
    if (payment.lease.userId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await processPayment(id);

    const updatedPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        allocations: {
          include: {
            invoice: {
              select: {
                invoiceNumber: true,
                totalAmount: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data: updatedPayment });
  } catch (error) {
    next(error);
  }
};
