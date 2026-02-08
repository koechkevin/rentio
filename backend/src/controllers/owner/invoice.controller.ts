import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth";
import { InvoiceStatus, BillingDuration } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler";
import {
  autoAllocateToNewInvoice,
  calculateArrears,
} from "../../services/payment.service";

// Helper function to generate invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}-`,
      },
    },
  });
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
};

// Create Invoice
export const createInvoice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { customerId, unitId, dueDate, items, notes, vatRate = 0 } = req.body;

    // Validate unit belongs to property
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        propertyId: req.propertyId!,
        deletedAt: null,
      },
      include: {
        property: true,
      },
    });

    if (!unit) {
      throw new AppError(
        "Unit not found or does not belong to this property",
        404,
      );
    }

    // Validate customer
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    // Calculate totals
    let subTotal = 0;
    const invoiceItems = items.map((item: any) => {
      const itemTotal =
        parseFloat(item.unitAmount) * parseFloat(item.quantity || 1);
      subTotal += itemTotal;
      return {
        itemName: item.itemName,
        itemDescription: item.itemDescription,
        unitAmount: item.unitAmount,
        quantity: item.quantity || 1,
        billingDuration: item.billingDuration,
        billingPeriod: item.billingPeriod ? new Date(item.billingPeriod) : null,
        total: itemTotal,
        vatable: item.vatable || false,
      };
    });

    const vatAmount = (subTotal * vatRate) / 100;
    const totalAmount = subTotal + vatAmount;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        propertyId: req.propertyId!,
        unitId,
        totalAmount,
        vatAmount,
        subTotal,
        vatRate,
        dueDate: new Date(dueDate),
        notes,
        createdBy: req.user!.id,
        status: InvoiceStatus.SENT,
        items: {
          create: invoiceItems,
        },
      },
      include: {
        items: true,
        customer: {
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
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Auto-allocate any unallocated payments to this invoice
    await autoAllocateToNewInvoice(invoice.id);

    // Fetch updated invoice with allocations
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        items: true,
        customer: {
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
        property: {
          select: {
            id: true,
            name: true,
          },
        },
        allocations: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true,
                reference: true,
                paidAt: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Invoice created successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

// Get all invoices for a property
export const getInvoices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, customerId, unitId, page = 1, limit = 10 } = req.query;

    const where: any = {
      propertyId: req.propertyId!,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (unitId) {
      where.unitId = unitId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          items: true,
          customer: {
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
          property: {
            select: {
              id: true,
              name: true,
            },
          },
          allocations: {
            select: {
              id: true,
              amount: true,
              payment: {
                select: {
                  id: true,
                  reference: true,
                  paidAt: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.status(200).json({
      message: "Invoices retrieved successfully",
      data: invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get invoice by ID
export const getInvoiceById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [{ propertyId: req.propertyId! }, { customerId: req.user!.id }],
      },
      include: {
        items: true,
        customer: {
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
            monthlyRent: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            county: true,
            town: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        allocations: {
          select: {
            id: true,
            amount: true,
            payment: {
              select: {
                id: true,
                reference: true,
                paidAt: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    res.status(200).json({
      message: "Invoice retrieved successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// Update invoice
export const updateInvoice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { dueDate, notes, status, items, vatRate } = req.body;

    // Check if invoice exists and belongs to property
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        propertyId: req.propertyId!,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });

    if (!existingInvoice) {
      throw new AppError("Invoice not found", 404);
    }

    // Prevent editing paid or cancelled invoices
    if (
      existingInvoice.status === InvoiceStatus.PAID ||
      existingInvoice.status === InvoiceStatus.CANCELLED
    ) {
      throw new AppError("Cannot update paid or cancelled invoices", 400);
    }

    // Prepare update data
    const updateData: any = {};

    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status) {
      updateData.status = status;
    }

    // If items are updated, recalculate totals
    if (items && items.length > 0) {
      let subTotal = 0;
      const invoiceItems = items.map((item: any) => {
        const itemTotal =
          parseFloat(item.unitAmount) * parseFloat(item.quantity || 1);
        subTotal += itemTotal;
        return {
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          unitAmount: item.unitAmount,
          quantity: item.quantity || 1,
          billingDuration: item.billingDuration,
          billingPeriod: item.billingPeriod
            ? new Date(item.billingPeriod)
            : null,
          total: itemTotal,
        };
      });

      const vatAmount = (subTotal * (vatRate || 0)) / 100;
      const totalAmount = subTotal + vatAmount;

      // Delete old items and create new ones
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      updateData.items = {
        create: invoiceItems,
      };
      updateData.subTotal = subTotal;
      updateData.vatAmount = vatAmount;
      updateData.totalAmount = totalAmount;
    }

    // Update invoice
    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        customer: {
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
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// Delete invoice (soft delete)
export const deleteInvoice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Check if invoice exists and belongs to property
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        propertyId: req.propertyId!,
        deletedAt: null,
      },
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    // Prevent deleting paid invoices
    if (invoice.status === InvoiceStatus.PAID) {
      throw new AppError("Cannot delete paid invoices", 400);
    }

    // Soft delete
    await prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Check if item already invoiced for a period
export const checkItemInvoiced = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { unitId, itemName, billingPeriod } = req.query;

    if (!unitId || !itemName || !billingPeriod) {
      throw new AppError("Missing required parameters", 400);
    }

    const startOfMonth = new Date(billingPeriod as string);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const existingInvoices = await prisma.invoiceItem.findMany({
      where: {
        itemName: itemName as string,
        billingPeriod: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        invoice: {
          unitId: unitId as string,
          propertyId: req.propertyId!,
          status: {
            notIn: [InvoiceStatus.CANCELLED],
          },
          deletedAt: null,
        },
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            issueDate: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Check completed",
      data: {
        alreadyInvoiced: existingInvoices.length > 0,
        existingInvoices: existingInvoices,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get suggested items for invoice (including rent)
export const getSuggestedItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { unitId } = req.params;
    const { billingPeriod } = req.query;

    // Get unit details
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        propertyId: req.propertyId!,
        deletedAt: null,
      },
      include: {
        leases: {
          where: {
            active: true,
          },
          take: 1,
        },
      },
    });

    if (!unit) {
      throw new AppError("Unit not found", 404);
    }

    const suggestedItems = [];

    // Always add rent as suggested item
    if (unit.leases.length > 0) {
      const lease = unit.leases[0];
      suggestedItems.push({
        itemName: "Rent",
        itemDescription: `Monthly rent for unit ${unit.unitNumber}`,
        unitAmount: lease.agreedRent.toString(),
        quantity: 1,
        billingDuration: BillingDuration.MONTHLY,
        billingPeriod: billingPeriod || new Date(),
      });
    } else {
      suggestedItems.push({
        itemName: "Rent",
        itemDescription: `Monthly rent for unit ${unit.unitNumber}`,
        unitAmount: unit.monthlyRent.toString(),
        quantity: 1,
        billingDuration: BillingDuration.MONTHLY,
        billingPeriod: billingPeriod || new Date(),
      });
    }

    res.status(200).json({
      message: "Suggested items retrieved successfully",
      data: {
        unit: {
          id: unit.id,
          unitNumber: unit.unitNumber,
          monthlyRent: unit.monthlyRent,
        },
        suggestedItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get customer invoices (for tenants to view their own invoices)
export const getCustomerInvoices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where: any = {
      customerId: req.user!.id,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          items: true,
          unit: {
            select: {
              id: true,
              unitNumber: true,
              type: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              county: true,
              town: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.status(200).json({
      message: "Invoices retrieved successfully",
      data: invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get customer arrears
export const getCustomerArrears = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { customerId } = req.params;

    const arrears = await calculateArrears(customerId);

    res.status(200).json({
      success: true,
      data: {
        customerId,
        arrears: arrears.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
