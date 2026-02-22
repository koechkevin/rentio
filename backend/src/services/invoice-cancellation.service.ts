import prisma from "../utils/prisma";
import { InvoiceStatus } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

/**
 * Cancel an invoice and handle payment allocations
 * @param invoiceId - ID of invoice to cancel
 * @returns Updated invoice
 */
export const cancelInvoice = async (invoiceId: string) => {
  // Start transaction
  const result = await prisma.$transaction(async (tx) => {
    // Get invoice with allocations
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        allocations: {
          where: { deletedAt: null },
          include: {
            payment: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new AppError("Invoice is already cancelled", 400);
    }

    // Soft delete all allocations and update payment unallocated amounts
    for (const allocation of invoice.allocations) {
      // Mark allocation as deleted
      await tx.paymentAllocation.update({
        where: { id: allocation.id },
        data: { deletedAt: new Date() },
      });

      // Update payment unallocated amount
      await tx.payment.update({
        where: { id: allocation.paymentId },
        data: {
          unallocatedAmount: {
            increment: allocation.amount,
          },
          allocatedAmount: {
            decrement: allocation.amount,
          },
        },
      });
    }

    // Update invoice status to cancelled
    const cancelledInvoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.CANCELLED,
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
        allocations: {
          where: { deletedAt: null },
          select: {
            id: true,
            amount: true,
            payment: {
              select: {
                id: true,
                reference: true,
              },
            },
          },
        },
      },
    });

    return cancelledInvoice;
  });

  return result;
};

/**
 * Restore a cancelled invoice and recreate allocations
 * @param invoiceId - ID of invoice to restore
 * @returns Updated invoice
 */
export const restoreInvoice = async (invoiceId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        allocations: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    if (invoice.status !== InvoiceStatus.CANCELLED) {
      throw new AppError("Only cancelled invoices can be restored", 400);
    }

    // Restore all soft-deleted allocations
    const deletedAllocations = await tx.paymentAllocation.findMany({
      where: {
        invoiceId,
        deletedAt: { not: null },
      },
    });

    for (const allocation of deletedAllocations) {
      // Restore allocation
      await tx.paymentAllocation.update({
        where: { id: allocation.id },
        data: { deletedAt: null },
      });

      // Update payment allocated/unallocated amounts back
      await tx.payment.update({
        where: { id: allocation.paymentId },
        data: {
          allocatedAmount: {
            increment: allocation.amount,
          },
          unallocatedAmount: {
            decrement: allocation.amount,
          },
        },
      });
    }

    // Restore invoice
    const restoredInvoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.SENT,
        deletedAt: null,
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
        allocations: {
          where: { deletedAt: null },
          select: {
            id: true,
            amount: true,
            payment: {
              select: {
                id: true,
                reference: true,
              },
            },
          },
        },
      },
    });

    return restoredInvoice;
  });

  return result;
};
