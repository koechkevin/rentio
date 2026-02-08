import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

/**
 * Calculate arrears for all units in a property
 * Returns unit details, tenant info, outstanding balance, and lease details
 */
export const calculatePropertyUnitArrears = async (
  propertyId: string,
  userId: string,
) => {
  // Verify user has access to this property
  const userPropertyRole = await prisma.userPropertyRole.findFirst({
    where: {
      propertyId,
      userId,
      removedAt: null,
    },
  });

  if (!userPropertyRole) {
    throw new AppError("You don't have access to this property", 403);
  }

  // Get all units with active leases
  const units = await prisma.unit.findMany({
    where: {
      propertyId,
    },
    include: {
      leases: {
        where: {
          active: true,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          leaseStart: "desc",
        },
        take: 1,
      },
    },
  });

  // Calculate arrears for each unit
  const unitArrears = await Promise.all(
    units.map(async (unit) => {
      const activeLease = unit.leases[0];

      if (!activeLease) {
        return {
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          unitType: unit.type,
          tenant: null,
          arrears: 0,
          oldestDueDate: null,
          leaseDetails: null,
        };
      }

      // Get all unpaid invoices for this unit
      const invoices = await prisma.invoice.findMany({
        where: {
          unitId: unit.id,
          customerId: activeLease.userId,
          status: { in: ["SENT", "OVERDUE"] },
          deletedAt: null,
        },
        include: {
          allocations: true,
        },
        orderBy: {
          dueDate: "asc",
        },
      });

      // Calculate total arrears
      let totalArrears = new Prisma.Decimal(0);
      let oldestDueDate: Date | null = null;

      invoices.forEach((invoice) => {
        const totalAllocated = invoice.allocations.reduce(
          (sum, allocation) => sum.add(allocation.amount),
          new Prisma.Decimal(0),
        );
        const balance = invoice.totalAmount.sub(totalAllocated);
        totalArrears = totalArrears.add(balance);

        if (!oldestDueDate || invoice.dueDate < oldestDueDate) {
          oldestDueDate = invoice.dueDate;
        }
      });

      return {
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        unitType: unit.type,
        tenant: {
          id: activeLease.user.id,
          fullName: activeLease.user.fullName,
          email: activeLease.user.email,
          phone: activeLease.user.phone,
        },
        arrears: Number(totalArrears),
        oldestDueDate,
        leaseDetails: {
          leaseStart: activeLease.leaseStart,
          leaseEnd: activeLease.leaseEnd,
          agreedRent: Number(activeLease.agreedRent),
          deposit: Number(activeLease.deposit),
        },
      };
    }),
  );

  // Filter to only show units with arrears or active leases
  return unitArrears.filter((unit) => unit.tenant !== null);
};

/**
 * Allocate payment to pending SENT invoices
 * Marks invoices as PAID when fully allocated
 * Returns remaining unallocated amount
 */
export const allocatePaymentToInvoices = async (
  paymentId: string,
  customerId: string,
  amount: Prisma.Decimal | number | string,
): Promise<{
  allocatedAmount: Prisma.Decimal;
  unallocatedAmount: Prisma.Decimal;
}> => {
  const paymentAmount = new Prisma.Decimal(amount);
  let remainingAmount = paymentAmount;
  let totalAllocated = new Prisma.Decimal(0);

  // Get all SENT invoices for this customer ordered by due date (oldest first)
  const sentInvoices = await prisma.invoice.findMany({
    where: {
      customerId,
      status: "SENT",
      deletedAt: null,
    },
    include: {
      allocations: true,
    },
    orderBy: { dueDate: "asc" },
  });

  for (const invoice of sentInvoices) {
    if (remainingAmount.lte(0)) break;

    // Calculate remaining balance: totalAmount - sum of existing allocations
    const existingAllocations = invoice.allocations.reduce(
      (sum, allocation) => sum.add(allocation.amount),
      new Prisma.Decimal(0),
    );
    const invoiceBalance = invoice.totalAmount.sub(existingAllocations);

    // Skip if invoice is fully allocated
    if (invoiceBalance.lte(0)) continue;

    const allocationAmount = remainingAmount.gte(invoiceBalance)
      ? invoiceBalance
      : remainingAmount;

    // Create payment allocation
    await prisma.paymentAllocation.create({
      data: {
        paymentId,
        invoiceId: invoice.id,
        amount: allocationAmount,
      },
    });

    remainingAmount = remainingAmount.sub(allocationAmount);
    totalAllocated = totalAllocated.add(allocationAmount);

    console.log(
      `Allocated ${allocationAmount.toFixed(2)} to invoice ${invoice.invoiceNumber}, remaining balance: ${invoiceBalance.sub(allocationAmount).toFixed(2)}, remaining unallocated: ${remainingAmount.toFixed(2)}`,
    );

    // Mark invoice as PAID only if fully allocated (including this allocation)
    if (invoiceBalance.sub(allocationAmount).lte(0)) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID" },
      });
    }
  }

  return {
    allocatedAmount: totalAllocated,
    unallocatedAmount: remainingAmount,
  };
};

/**
 * Process payment: allocate to invoices and update payment status
 */
export const processPayment = async (paymentId: string): Promise<void> => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      lease: {
        include: { user: true },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.isProcessed) {
    return; // Already processed
  }

  const customerId = payment.lease.userId;

  // Allocate payment to invoices
  const { allocatedAmount, unallocatedAmount } =
    await allocatePaymentToInvoices(payment.id, customerId, payment.amount);

  console.log("----------------->", {
    allocatedAmount,
    unallocatedAmount,
  });
  // Update payment with allocation info
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      allocatedAmount,
      unallocatedAmount,
      isProcessed: unallocatedAmount.lte(0), // Fully processed if no unallocated amount
      status: "COMPLETED",
      paidAt: new Date(),
    },
  });
};

/**
 * Auto-allocate unallocated amounts to a newly created invoice
 */
export const autoAllocateToNewInvoice = async (
  invoiceId: string,
): Promise<void> => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      allocations: true, // Include existing allocations
    },
  });

  if (!invoice || invoice.status !== "SENT") {
    return; // Only auto-allocate to SENT invoices
  }

  // Calculate remaining invoice balance
  const totalAllocated = invoice.allocations.reduce(
    (sum, allocation) => sum.add(allocation.amount),
    new Prisma.Decimal(0),
  );
  let invoiceBalance = invoice.totalAmount.sub(totalAllocated);

  // Skip if already fully allocated
  if (invoiceBalance.lte(0)) {
    return;
  }

  // Find payments with unallocated amounts for this customer
  const paymentsWithBalance = await prisma.payment.findMany({
    where: {
      lease: { userId: invoice.customerId },
      unallocatedAmount: { gt: 0 },
      status: "COMPLETED",
    },
    orderBy: { paidAt: "asc" }, // Use oldest payments first
  });

  for (const payment of paymentsWithBalance) {
    if (invoiceBalance.lte(0)) break;

    const allocationAmount = payment.unallocatedAmount.gte(invoiceBalance)
      ? invoiceBalance
      : payment.unallocatedAmount;

    // Create allocation
    await prisma.paymentAllocation.create({
      data: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        amount: allocationAmount,
      },
    });

    invoiceBalance = invoiceBalance.sub(allocationAmount);

    // Update payment
    const newUnallocated = payment.unallocatedAmount.sub(allocationAmount);
    const newAllocated = payment.allocatedAmount.add(allocationAmount);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        allocatedAmount: newAllocated,
        unallocatedAmount: newUnallocated,
        isProcessed: newUnallocated.lte(0),
      },
    });
  }

  // Mark invoice as PAID if fully allocated
  if (invoiceBalance.lte(0)) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID" },
    });
  }
};

/**
 * Calculate outstanding arrears for a customer
 * Arrears = Sum of (invoice totalAmount - allocated amounts) for SENT/OVERDUE invoices
 */
export const calculateArrears = async (
  customerId: string,
): Promise<Prisma.Decimal> => {
  // Get all outstanding invoices with their allocations
  const outstandingInvoices = await prisma.invoice.findMany({
    where: {
      customerId,
      status: { in: ["SENT", "OVERDUE"] },
      deletedAt: null,
    },
    include: {
      allocations: true,
    },
  });

  // Calculate arrears: sum of (invoice total - allocations)
  let totalArrears = new Prisma.Decimal(0);

  for (const invoice of outstandingInvoices) {
    const totalAllocated = invoice.allocations.reduce(
      (sum, allocation) => sum.add(allocation.amount),
      new Prisma.Decimal(0),
    );

    const remainingBalance = invoice.totalAmount.sub(totalAllocated);

    if (remainingBalance.gt(0)) {
      totalArrears = totalArrears.add(remainingBalance);
    }
  }

  return totalArrears;
};
