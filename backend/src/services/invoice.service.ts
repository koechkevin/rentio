import prisma from "../utils/prisma";
import { InvoiceStatus, BillingDuration } from "@prisma/client";

interface InvoiceItemData {
  itemName: string;
  itemDescription?: string;
  unitAmount: number;
  quantity: number;
  billingDuration: BillingDuration;
  billingPeriod?: Date;
}

export class InvoiceService {
  /**
   * Generate a unique invoice number
   */
  static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}-`,
        },
      },
    });
    return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
  }

  /**
   * Calculate invoice totals
   */
  static calculateTotals(items: InvoiceItemData[], vatRate: number = 0) {
    const subTotal = items.reduce((sum, item) => {
      return sum + item.unitAmount * item.quantity;
    }, 0);

    const vatAmount = (subTotal * vatRate) / 100;
    const totalAmount = subTotal + vatAmount;

    return {
      subTotal,
      vatAmount,
      totalAmount,
    };
  }

  /**
   * Check if an item has already been invoiced for a specific period
   */
  static async isItemInvoicedForPeriod(
    unitId: string,
    itemName: string,
    billingPeriod: Date,
  ): Promise<boolean> {
    const startOfMonth = new Date(billingPeriod);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const existingInvoices = await prisma.invoiceItem.count({
      where: {
        itemName,
        billingPeriod: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        invoice: {
          unitId,
          status: {
            notIn: [InvoiceStatus.CANCELLED],
          },
          deletedAt: null,
        },
      },
    });

    return existingInvoices > 0;
  }

  /**
   * Get invoiced items for a unit in a specific period
   */
  static async getInvoicedItemsForPeriod(
    unitId: string,
    propertyId: string,
    billingPeriod: Date,
  ) {
    const startOfMonth = new Date(billingPeriod);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    return await prisma.invoiceItem.findMany({
      where: {
        billingPeriod: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        invoice: {
          unitId,
          propertyId,
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
            dueDate: true,
          },
        },
      },
    });
  }

  /**
   * Get suggested invoice items for a unit (including rent)
   */
  static async getSuggestedItems(unitId: string, billingPeriod?: Date) {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
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
      return [];
    }

    const suggestedItems: InvoiceItemData[] = [];
    const period = billingPeriod || new Date();

    // Add rent item
    if (unit.leases.length > 0) {
      const lease = unit.leases[0];
      suggestedItems.push({
        itemName: "Rent",
        itemDescription: `Monthly rent for unit ${unit.unitNumber}`,
        unitAmount: parseFloat(lease.agreedRent.toString()),
        quantity: 1,
        billingDuration: BillingDuration.MONTHLY,
        billingPeriod: period,
      });
    } else {
      suggestedItems.push({
        itemName: "Rent",
        itemDescription: `Monthly rent for unit ${unit.unitNumber}`,
        unitAmount: parseFloat(unit.monthlyRent.toString()),
        quantity: 1,
        billingDuration: BillingDuration.MONTHLY,
        billingPeriod: period,
      });
    }

    return suggestedItems;
  }

  /**
   * Update invoice status based on due date
   */
  static async updateOverdueInvoices() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.invoice.updateMany({
      where: {
        status: {
          in: [InvoiceStatus.DRAFT, InvoiceStatus.SENT],
        },
        dueDate: {
          lt: today,
        },
        deletedAt: null,
      },
      data: {
        status: InvoiceStatus.OVERDUE,
      },
    });

    return result.count;
  }

  /**
   * Get invoice statistics for a property
   */
  static async getPropertyInvoiceStats(propertyId: string) {
    const [total, paid, pending, overdue, totalAmount, paidAmount] =
      await Promise.all([
        prisma.invoice.count({
          where: {
            propertyId,
            deletedAt: null,
          },
        }),
        prisma.invoice.count({
          where: {
            propertyId,
            status: InvoiceStatus.PAID,
            deletedAt: null,
          },
        }),
        prisma.invoice.count({
          where: {
            propertyId,
            status: {
              in: [InvoiceStatus.DRAFT, InvoiceStatus.SENT],
            },
            deletedAt: null,
          },
        }),
        prisma.invoice.count({
          where: {
            propertyId,
            status: InvoiceStatus.OVERDUE,
            deletedAt: null,
          },
        }),
        prisma.invoice.aggregate({
          where: {
            propertyId,
            deletedAt: null,
          },
          _sum: {
            totalAmount: true,
          },
        }),
        prisma.invoice.aggregate({
          where: {
            propertyId,
            status: InvoiceStatus.PAID,
            deletedAt: null,
          },
          _sum: {
            totalAmount: true,
          },
        }),
      ]);

    return {
      total,
      paid,
      pending,
      overdue,
      totalAmount: totalAmount._sum.totalAmount || 0,
      paidAmount: paidAmount._sum.totalAmount || 0,
      outstandingAmount:
        ((totalAmount._sum.totalAmount || 0) as number) -
        ((paidAmount._sum.totalAmount || 0) as number),
    };
  }

  /**
   * Get customer invoice statistics
   */
  static async getCustomerInvoiceStats(customerId: string) {
    const [total, paid, pending, overdue, totalAmount, paidAmount] =
      await Promise.all([
        prisma.invoice.count({
          where: {
            customerId,
            deletedAt: null,
          },
        }),
        prisma.invoice.count({
          where: {
            customerId,
            status: InvoiceStatus.PAID,
            deletedAt: null,
          },
        }),
        prisma.invoice.count({
          where: {
            customerId,
            status: {
              in: [InvoiceStatus.DRAFT, InvoiceStatus.SENT],
            },
            deletedAt: null,
          },
        }),
        prisma.invoice.count({
          where: {
            customerId,
            status: InvoiceStatus.OVERDUE,
            deletedAt: null,
          },
        }),
        prisma.invoice.aggregate({
          where: {
            customerId,
            deletedAt: null,
          },
          _sum: {
            totalAmount: true,
          },
        }),
        prisma.invoice.aggregate({
          where: {
            customerId,
            status: InvoiceStatus.PAID,
            deletedAt: null,
          },
          _sum: {
            totalAmount: true,
          },
        }),
      ]);

    return {
      total,
      paid,
      pending,
      overdue,
      totalAmount: totalAmount._sum.totalAmount || 0,
      paidAmount: paidAmount._sum.totalAmount || 0,
      outstandingAmount:
        ((totalAmount._sum.totalAmount || 0) as number) -
        ((paidAmount._sum.totalAmount as any) || 0),
    };
  }
}

export default InvoiceService;
