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

    // Check for pending or overdue property invoices
    const pendingInvoices = await prisma.propertyInvoice.findMany({
      where: {
        propertyId: req.propertyId!,
        status: {
          in: ["PENDING", "OVERDUE"],
        },
      },
      orderBy: { dueDate: "asc" },
    });

    if (pendingInvoices.length > 0) {
      const overdueInvoices = pendingInvoices.filter(
        (inv) => inv.status === "OVERDUE",
      );

      if (overdueInvoices.length > 0) {
        throw new AppError(
          `You have ${overdueInvoices.length} overdue invoice(s). Please settle outstanding invoices before adding new units.`,
          403,
        );
      }

      // Check if total pending amount exceeds a threshold (optional business rule)
      const totalPending = pendingInvoices.reduce(
        (sum, inv) => sum + Number(inv.totalAmount),
        0,
      );

      // Allow adding units if pending invoices exist but are not overdue
      // You can adjust this logic based on business requirements
      console.log(
        `Property has ${pendingInvoices.length} pending invoice(s) totaling ${totalPending}`,
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
