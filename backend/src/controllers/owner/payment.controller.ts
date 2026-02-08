import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth";
import {
  processPayment,
  calculatePropertyUnitArrears,
} from "../../services/payment.service";

export const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      unitId,
      amount,
      type,
      method,
      mpesaReceipt,
      reference,
      status,
      paidAt,
    } = req.body;

    // Verify unit belongs to property
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        propertyId: req.propertyId,
        deletedAt: null,
      },
      include: {
        leases: {
          where: { active: true },
          include: { user: true },
        },
      },
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found in this property",
      });
    }

    const activeLease = unit.leases[0];
    if (!activeLease) {
      return res.status(400).json({
        success: false,
        message: "No active lease found for this unit",
      });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        leaseId: activeLease.id,
        amount,
        type,
        method,
        mpesaReceipt,
        reference,
        status,
        paidAt: paidAt ? new Date(paidAt) : null,
        unallocatedAmount: amount, // Initially all unallocated
        createdBy: req.user!.id,
      },
      include: {
        lease: {
          include: {
            user: true,
            unit: true,
          },
        },
      },
    });

    // If payment is marked as COMPLETED, process it immediately
    if (status === "COMPLETED") {
      await processPayment(payment.id);
    }

    res.status(201).json({
      success: true,
      data: payment,
      message: "Payment created successfully",
    });
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
    const { unitId, status } = req.query;

    const where: any = {
      lease: {
        unit: {
          propertyId: req.propertyId,
          deletedAt: null,
        },
      },
    };

    if (unitId) {
      where.lease.unitId = unitId;
    }

    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        lease: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
            unit: {
              select: {
                id: true,
                unitNumber: true,
                type: true,
              },
            },
          },
        },
        allocations: {
          include: {
            invoice: {
              select: {
                id: true,
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

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        lease: {
          unit: {
            propertyId: req.propertyId,
            deletedAt: null,
          },
        },
      },
      include: {
        lease: {
          include: {
            user: true,
            unit: true,
          },
        },
        allocations: {
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                totalAmount: true,
                status: true,
                dueDate: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment,
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

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        lease: {
          unit: {
            propertyId: req.propertyId,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Only COMPLETED payments can be processed",
      });
    }

    await processPayment(payment.id);

    res.json({
      success: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyUnitArrears = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.propertyId!;
    const unitArrears = await calculatePropertyUnitArrears(
      propertyId,
      req.user!.id,
    );

    res.json({
      success: true,
      data: unitArrears,
    });
  } catch (error) {
    next(error);
  }
};
