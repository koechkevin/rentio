import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";

/**
 * Auto-allocate property payment to unpaid invoices
 * Allocates payment to oldest invoices first
 */
export const autoAllocatePropertyPayment = async (
  paymentId: string,
): Promise<void> => {
  const payment = await prisma.propertyPayment.findUnique({
    where: { id: paymentId },
    include: {
      allocations: true,
    },
  });

  if (!payment || payment.status !== "COMPLETED") {
    return;
  }

  let remainingAmount = new Prisma.Decimal(payment.amount);

  // Get all unpaid invoices for this property, ordered by due date
  const unpaidInvoices = await prisma.propertyInvoice.findMany({
    where: {
      propertyId: payment.propertyId,
      status: {
        in: ["PENDING", "SENT", "OVERDUE"],
      },
    },
    include: {
      payments: true,
    },
    orderBy: { dueDate: "asc" },
  });

  for (const invoice of unpaidInvoices) {
    if (remainingAmount.lte(0)) break;

    // Calculate how much is already paid on this invoice
    const totalPaid = invoice.payments.reduce(
      (sum, payment) => sum.add(payment.amount),
      new Prisma.Decimal(0),
    );
    const invoiceBalance = invoice.totalAmount.sub(totalPaid);

    if (invoiceBalance.lte(0)) continue;

    // Determine allocation amount
    const allocationAmount = remainingAmount.gte(invoiceBalance)
      ? invoiceBalance
      : remainingAmount;

    // Create allocation
    await prisma.propertyPaymentAllocation.create({
      data: {
        paymentId,
        invoiceId: invoice.id,
        amount: allocationAmount,
      },
    });

    // Update invoice status if it will be fully paid
    const newPaidAmount = totalPaid.add(allocationAmount);
    const invoiceStatus = newPaidAmount.gte(invoice.totalAmount)
      ? "PAID"
      : invoice.status;

    await prisma.propertyInvoice.update({
      where: { id: invoice.id },
      data: {
        status: invoiceStatus,
        paidAt: invoiceStatus === "PAID" ? new Date() : null,
      },
    });

    remainingAmount = remainingAmount.sub(allocationAmount);
  }

  // Update payment with final allocated/unallocated amounts
  const finalAllocated = payment.amount.sub(remainingAmount);
  await prisma.propertyPayment.update({
    where: { id: paymentId },
    data: {
      allocatedAmount: finalAllocated,
      unallocatedAmount: remainingAmount,
      isProcessed: remainingAmount.lte(0),
    },
  });
};

/**
 * Calculate total arrears for a property
 */
export const calculatePropertyArrears = async (
  propertyId: string,
): Promise<number> => {
  // Get all unpaid invoices
  const unpaidInvoices = await prisma.propertyInvoice.findMany({
    where: {
      propertyId,
      status: {
        in: ["PENDING", "SENT", "OVERDUE"],
      },
    },
    include: {
      payments: true,
    },
  });

  let totalArrears = new Prisma.Decimal(0);

  // Calculate arrears for each invoice
  for (const invoice of unpaidInvoices) {
    const totalPaid = invoice.payments.reduce(
      (sum, payment) => sum.add(payment.amount),
      new Prisma.Decimal(0),
    );
    const invoiceBalance = invoice.totalAmount.sub(totalPaid);

    totalArrears = totalArrears.add(invoiceBalance);
  }

  return Number(totalArrears);
};

/**
 * Auto-allocate unallocated amounts from property payments to a newly created invoice
 */
export const autoAllocateToNewPropertyInvoice = async (
  invoiceId: string,
): Promise<void> => {
  const invoice = await prisma.propertyInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      payments: true,
    },
  });

  if (!invoice || invoice.status !== "PENDING") {
    return; // Only auto-allocate to PENDING invoices
  }

  // Calculate remaining invoice balance
  const totalAllocated = invoice.payments.reduce(
    (sum, payment) => sum.add(payment.amount),
    new Prisma.Decimal(0),
  );
  let invoiceBalance = invoice.totalAmount.sub(totalAllocated);

  // Skip if already fully allocated
  if (invoiceBalance.lte(0)) {
    return;
  }

  // Find property payments with unallocated amounts for this property
  const paymentsWithBalance = await prisma.propertyPayment.findMany({
    where: {
      propertyId: invoice.propertyId,
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
    await prisma.propertyPaymentAllocation.create({
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

    await prisma.propertyPayment.update({
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
    await prisma.propertyInvoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidAt: new Date() },
    });
  }
};
