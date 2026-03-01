import { Response, NextFunction } from "express";
import {
  BillingFrequency,
  BillingItemType,
  BillingDuration,
  InvoiceStatus,
  Prisma,
} from "@prisma/client";
import { AuthRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import prisma from "../../utils/prisma";
import {
  BillingItemService,
  BILLING_ITEM_TYPE_LABELS,
} from "../../services/billingItem.service";
import { InvoiceService } from "../../services/invoice.service";

// ─── Create ─────────────────────────────────────────────────────────────────

export const createBillingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      unitId,
      itemType,
      frequency,
      billingPeriod,
      year,
      amount,
      currency,
      notes,
    } = req.body;
    const propertyId = req.propertyId!;
    const userId = req.user!.id;

    if (!unitId || !itemType || !frequency || !year || !amount) {
      throw new AppError(
        "unitId, itemType, frequency, year and amount are required",
        400,
      );
    }

    if (!Object.values(BillingFrequency).includes(frequency)) {
      throw new AppError(
        "Invalid frequency. Must be MONTHLY, QUARTERLY, or ANNUALLY",
        400,
      );
    }

    if (!Object.values(BillingItemType).includes(itemType)) {
      throw new AppError(
        `Invalid itemType. Must be one of: ${Object.values(BillingItemType).join(", ")}`,
        400,
      );
    }

    const normalizedPeriod = BillingItemService.normalizeBillingPeriod(
      frequency,
      billingPeriod,
    );

    if (frequency !== BillingFrequency.ANNUALLY && !billingPeriod) {
      throw new AppError(
        "billingPeriod is required for MONTHLY and QUARTERLY frequency",
        400,
      );
    }

    const validPeriods = BillingItemService.validPeriodsForFrequency(frequency);
    if (!validPeriods.includes(normalizedPeriod)) {
      throw new AppError(
        `Invalid billingPeriod "${normalizedPeriod}" for frequency ${frequency}. Valid values: ${validPeriods.join(", ")}`,
        400,
      );
    }

    // Verify unit belongs to property and has an active tenant
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, propertyId, deletedAt: null },
      include: {
        leases: {
          where: { active: true },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!unit) throw new AppError("Unit not found in this property", 404);

    const activeLease = unit.leases[0];
    if (!activeLease) {
      throw new AppError(
        "This unit has no active tenant. A billing item requires an active lease.",
        400,
      );
    }

    const customerId = activeLease.user.id;

    // Calculate pro-rata if it's a rent item
    let finalAmount = new Prisma.Decimal(amount);
    if (itemType === BillingItemType.RENT) {
      const proRataAmount = BillingItemService.calculateProRataRent(
        Number(amount),
        frequency,
        normalizedPeriod,
        Number(year),
        activeLease.leaseStart,
      );
      if (proRataAmount === null) {
        throw new AppError(
          "Lease starts after the billing period. Cannot create billing item.",
          400,
        );
      }
      finalAmount = new Prisma.Decimal(proRataAmount);
    }

    // Enforce unique constraint: unitId + billingPeriod + year + itemType
    const existing = await prisma.billingItem.findFirst({
      where: {
        unitId,
        billingPeriod: normalizedPeriod,
        year: Number(year),
        itemType,
        deletedAt: null,
      },
    });
    if (existing) {
      const typeLabel =
        BILLING_ITEM_TYPE_LABELS[itemType as BillingItemType] ?? itemType;
      throw new AppError(
        `A "${typeLabel}" billing item for this unit, period (${normalizedPeriod}), and year (${year}) already exists`,
        409,
      );
    }

    const billingItem = await prisma.billingItem.create({
      data: {
        propertyId,
        unitId,
        customerId,
        itemType,
        frequency,
        billingPeriod: normalizedPeriod,
        year: Number(year),
        amount: finalAmount,
        currency: currency ?? "KES",
        notes,
        createdBy: userId,
      },
      include: {
        unit: { select: { id: true, unitNumber: true } },
        customer: { select: { id: true, fullName: true, email: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Billing item created successfully",
      data: billingItem,
    });
  } catch (err) {
    next(err);
  }
};

// ─── List ────────────────────────────────────────────────────────────────────

export const getBillingItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.propertyId!;
    const {
      unitId,
      status,
      year,
      frequency,
      billingPeriod,
      itemType,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const where: Prisma.BillingItemWhereInput = {
      propertyId,
      deletedAt: null,
      ...(unitId && { unitId }),
      ...(status && { status: status as any }),
      ...(year && { year: Number(year) }),
      ...(frequency && { frequency: frequency as BillingFrequency }),
      ...(billingPeriod && { billingPeriod: billingPeriod.toUpperCase() }),
      ...(itemType && { itemType: itemType as BillingItemType }),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      prisma.billingItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        include: {
          unit: { select: { id: true, unitNumber: true } },
          customer: { select: { id: true, fullName: true, email: true } },
          invoice: { select: { id: true, invoiceNumber: true, status: true } },
        },
      }),
      prisma.billingItem.count({ where }),
    ]);

    return res.json({
      success: true,
      message: "Billing items retrieved successfully",
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get by ID ───────────────────────────────────────────────────────────────

export const getBillingItemById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const propertyId = req.propertyId!;

    const billingItem = await prisma.billingItem.findFirst({
      where: { id, propertyId, deletedAt: null },
      include: {
        unit: { select: { id: true, unitNumber: true, type: true } },
        customer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!billingItem) throw new AppError("Billing item not found", 404);

    return res.json({
      success: true,
      message: "Billing item retrieved successfully",
      data: billingItem,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update ──────────────────────────────────────────────────────────────────

export const updateBillingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const propertyId = req.propertyId!;
    const { amount, currency, notes } = req.body;

    const billingItem = await prisma.billingItem.findFirst({
      where: { id, propertyId, deletedAt: null },
    });

    if (!billingItem) throw new AppError("Billing item not found", 404);
    if (billingItem.status === "INVOICED") {
      throw new AppError("Cannot update an already invoiced billing item", 400);
    }

    const updated = await prisma.billingItem.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: new Prisma.Decimal(amount) }),
        ...(currency && { currency }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        unit: { select: { id: true, unitNumber: true } },
        customer: { select: { id: true, fullName: true, email: true } },
      },
    });

    return res.json({
      success: true,
      message: "Billing item updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete (soft) ───────────────────────────────────────────────────────────

export const deleteBillingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const propertyId = req.propertyId!;

    const billingItem = await prisma.billingItem.findFirst({
      where: { id, propertyId, deletedAt: null },
    });

    if (!billingItem) throw new AppError("Billing item not found", 404);
    if (billingItem.status === "INVOICED") {
      throw new AppError("Cannot delete an already invoiced billing item", 400);
    }

    await prisma.billingItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return res.json({
      success: true,
      message: "Billing item deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ─── Generate Invoice ────────────────────────────────────────────────────────

export const generateInvoiceFromBillingItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const propertyId = req.propertyId!;
    const userId = req.user!.id;

    const billingItem = await prisma.billingItem.findFirst({
      where: { id, propertyId, deletedAt: null },
    });

    if (!billingItem) throw new AppError("Billing item not found", 404);
    if (billingItem.status === "INVOICED") {
      throw new AppError(
        "This billing item has already been converted to an invoice",
        400,
      );
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const typeLabel =
      BILLING_ITEM_TYPE_LABELS[billingItem.itemType] ?? billingItem.itemType;
    const periodLabel = BillingItemService.generateBillingPeriodLabel(
      billingItem.frequency,
      billingItem.billingPeriod,
      billingItem.year,
    );

    const invoiceNumber = await InvoiceService.generateInvoiceNumber();
    const amount = Number(billingItem.amount);

    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: billingItem.customerId,
          propertyId,
          unitId: billingItem.unitId,
          totalAmount: new Prisma.Decimal(amount),
          vatAmount: new Prisma.Decimal(0),
          subTotal: new Prisma.Decimal(amount),
          vatRate: new Prisma.Decimal(0),
          dueDate,
          status: InvoiceStatus.DRAFT,
          notes: billingItem.notes ?? undefined,
          createdBy: userId,
          items: {
            create: {
              itemName: typeLabel,
              itemDescription: `${typeLabel} — ${periodLabel}`,
              unitAmount: new Prisma.Decimal(amount),
              quantity: new Prisma.Decimal(1),
              billingDuration: BillingDuration.ONE_TIME,
              total: new Prisma.Decimal(amount),
            },
          },
        },
        include: {
          items: true,
          customer: { select: { id: true, fullName: true, email: true } },
          unit: { select: { id: true, unitNumber: true } },
        },
      });

      await tx.billingItem.update({
        where: { id },
        data: { status: "INVOICED", invoiceId: newInvoice.id },
      });

      return newInvoice;
    });

    return res.status(201).json({
      success: true,
      message: "Invoice generated successfully from billing item",
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Bulk Create Rent Billing Items ──────────────────────────────────────────

export const bulkCreateRentBillingItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { frequency, billingPeriod, year } = req.body;
    const propertyId = req.propertyId!;
    const userId = req.user!.id;

    if (!frequency || !year) {
      throw new AppError("frequency and year are required", 400);
    }

    if (!Object.values(BillingFrequency).includes(frequency)) {
      throw new AppError("Invalid frequency", 400);
    }

    const normalizedPeriod = BillingItemService.normalizeBillingPeriod(
      frequency,
      billingPeriod,
    );

    if (frequency !== BillingFrequency.ANNUALLY && !billingPeriod) {
      throw new AppError(
        "billingPeriod is required for MONTHLY and QUARTERLY frequency",
        400,
      );
    }

    const validPeriods = BillingItemService.validPeriodsForFrequency(frequency);
    if (!validPeriods.includes(normalizedPeriod)) {
      throw new AppError(
        `Invalid billingPeriod "${normalizedPeriod}" for ${frequency}. Valid: ${validPeriods.join(", ")}`,
        400,
      );
    }

    // Fetch all non-deleted units in the property with their active leases
    const units = await prisma.unit.findMany({
      where: { propertyId, deletedAt: null },
      include: {
        leases: {
          where: { active: true },
          include: { user: { select: { id: true, fullName: true } } },
          take: 1,
        },
      },
      orderBy: { unitNumber: "asc" },
    });

    const created: Array<{
      unitNumber: string;
      tenantName: string;
      amount: number;
    }> = [];
    const skipped: Array<{ unitNumber: string; reason: string }> = [];

    for (const unit of units) {
      const activeLease = unit.leases[0];

      if (!activeLease) {
        skipped.push({
          unitNumber: unit.unitNumber,
          reason: "No active tenant",
        });
        continue;
      }

      const rentAmount = Number(activeLease.agreedRent);
      if (!rentAmount || rentAmount <= 0) {
        skipped.push({
          unitNumber: unit.unitNumber,
          reason: "Agreed rent is zero",
        });
        continue;
      }

      // Calculate pro-rata rent
      const proRataAmount = BillingItemService.calculateProRataRent(
        rentAmount,
        frequency,
        normalizedPeriod,
        Number(year),
        activeLease.leaseStart,
      );

      if (proRataAmount === null) {
        skipped.push({
          unitNumber: unit.unitNumber,
          reason: `Lease starts after ${normalizedPeriod} ${year}`,
        });
        continue;
      }

      // Check for existing billing item
      const existing = await prisma.billingItem.findFirst({
        where: {
          unitId: unit.id,
          billingPeriod: normalizedPeriod,
          year: Number(year),
          itemType: BillingItemType.RENT,
          deletedAt: null,
        },
      });

      if (existing) {
        skipped.push({
          unitNumber: unit.unitNumber,
          reason: `Rent billing item for ${normalizedPeriod} ${year} already exists`,
        });
        continue;
      }

      await prisma.billingItem.create({
        data: {
          propertyId,
          unitId: unit.id,
          customerId: activeLease.user.id,
          itemType: BillingItemType.RENT,
          frequency,
          billingPeriod: normalizedPeriod,
          year: Number(year),
          amount: new Prisma.Decimal(proRataAmount),
          currency: "KES",
          createdBy: userId,
        },
      });

      created.push({
        unitNumber: unit.unitNumber,
        tenantName: activeLease.user.fullName,
        amount: proRataAmount,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Bulk rent billing items: ${created.length} created, ${skipped.length} skipped`,
      data: { created, skipped },
    });
  } catch (err) {
    next(err);
  }
};
