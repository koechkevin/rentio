import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";

export const getPropertyInvoices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      property: {
        OR: [
          { ownerId: req.user!.id },
          {
            userPropertyRoles: {
              some: {
                userId: req.user!.id,
                removedAt: null,
              },
            },
          },
        ],
      },
    };

    if (status) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.propertyInvoice.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              county: true,
              town: true,
            },
          },
          items: {
            orderBy: { unitNumber: "asc" },
          },
          payments: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.propertyInvoice.count({ where }),
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems: total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyInvoice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.propertyInvoice.findFirst({
      where: {
        id,
        property: {
          OR: [
            { ownerId: req.user!.id },
            {
              userPropertyRoles: {
                some: {
                  userId: req.user!.id,
                  removedAt: null,
                },
              },
            },
          ],
        },
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            county: true,
            town: true,
            owner: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        items: {
          orderBy: { unitNumber: "asc" },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            payment: {
              select: {
                method: true,
                reference: true,
                mpesaReceipt: true,
                status: true,
                paidAt: true,
                amount: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const getBillingConfig = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.billingConfig.findMany();

    const configMap = config.reduce((acc: any, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ratePerUnit: Number(configMap.RATE_PER_UNIT || 100),
        currency: configMap.CURRENCY || "KES",
        taxRate: Number(configMap.TAX_RATE || 0),
        dueDays: Number(configMap.DUE_DAYS || 14),
      },
    });
  } catch (error) {
    next(error);
  }
};
