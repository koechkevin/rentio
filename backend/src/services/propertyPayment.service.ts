import prisma from "../utils/prisma";

/**
 * Auto-allocate payment to oldest unpaid invoices for a property
 */
export const autoAllocatePropertyPayment = async (
  paymentId: string,
): Promise<void> => {
  const payment = await prisma.propertyInvoicePayment.findUnique({
    where: { id: paymentId },
    include: {
      invoice: true,
    },
  });

  if (!payment || payment.status !== "COMPLETED") {
    return;
  }

  // Get the property from the first invoice
  const propertyId = payment.invoice.propertyId;

  // Get all unpaid invoices for this property, ordered by due date (oldest first)
  const unpaidInvoices = await prisma.propertyInvoice.findMany({
    where: {
      propertyId,
      status: {
        in: ["PENDING", "SENT", "OVERDUE"],
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  let remainingAmount = Number(payment.amount);

  // Allocate payment to each invoice
  for (const invoice of unpaidInvoices) {
    if (remainingAmount <= 0) break;

    // Calculate how much is already paid on this invoice
    const totalPaid = await prisma.propertyInvoicePayment.aggregate({
      where: { invoiceId: invoice.id, status: "COMPLETED" },
      _sum: { amount: true },
    });

    const invoicePaid = Number(totalPaid._sum.amount || 0);
    const invoiceBalance = Number(invoice.totalAmount) - invoicePaid;

    if (invoiceBalance <= 0) continue;

    // Determine allocation amount
    const allocationAmount = Math.min(remainingAmount, invoiceBalance);

    // Update invoice status if it will be fully paid
    const newPaidAmount = invoicePaid + allocationAmount;
    const invoiceStatus =
      newPaidAmount >= Number(invoice.totalAmount) ? "PAID" : invoice.status;

    await prisma.propertyInvoice.update({
      where: { id: invoice.id },
      data: {
        status: invoiceStatus,
        paidAt: invoiceStatus === "PAID" ? new Date() : null,
      },
    });

    remainingAmount -= allocationAmount;
  }
};

/**
 * Calculate total arrears for a property
 */
export const calculatePropertyArrears = async (
  propertyId: string,
): Promise<number> => {
  // Get all non-paid invoices
  const unpaidInvoices = await prisma.propertyInvoice.findMany({
    where: {
      propertyId,
      status: {
        in: ["PENDING", "SENT", "OVERDUE"],
      },
    },
  });

  let totalArrears = 0;

  // Calculate arrears for each invoice
  for (const invoice of unpaidInvoices) {
    const totalPaid = await prisma.propertyInvoicePayment.aggregate({
      where: { invoiceId: invoice.id, status: "COMPLETED" },
      _sum: { amount: true },
    });

    const invoicePaid = Number(totalPaid._sum.amount || 0);
    const invoiceBalance = Number(invoice.totalAmount) - invoicePaid;

    totalArrears += Math.max(0, invoiceBalance);
  }

  return totalArrears;
};
