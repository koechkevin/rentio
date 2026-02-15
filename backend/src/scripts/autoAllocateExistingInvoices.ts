import { autoAllocateToNewPropertyInvoice } from "../services/propertyPayment.service";
import prisma from "../utils/prisma";

const autoAllocateExistingInvoices = async () => {
  console.log("Starting auto-allocation for existing invoices...");

  try {
    // Get all unpaid property invoices
    const unpaidInvoices = await prisma.propertyInvoice.findMany({
      where: {
        status: {
          in: ["PENDING", "SENT", "OVERDUE"],
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(`Found ${unpaidInvoices.length} unpaid invoices to process`);

    let invoicesAllocated = 0;
    let invoicesSkipped = 0;

    for (const invoice of unpaidInvoices) {
      try {
        // Attempt to auto-allocate unallocated payments to this invoice
        await autoAllocateToNewPropertyInvoice(invoice.id);

        // Check if invoice status changed
        const updatedInvoice = await prisma.propertyInvoice.findUnique({
          where: { id: invoice.id },
          include: { payments: true },
        });

        if (updatedInvoice?.status === "PAID") {
          console.log(
            `✓ Invoice ${updatedInvoice.invoiceNumber} fully allocated and marked as PAID`,
          );
          invoicesAllocated++;
        } else if (
          updatedInvoice?.payments &&
          updatedInvoice.payments.length > 0
        ) {
          console.log(
            `✓ Invoice ${updatedInvoice.invoiceNumber} received allocations`,
          );
          invoicesAllocated++;
        } else {
          console.log(`- Invoice ${invoice.invoiceNumber} has no allocations`);
          invoicesSkipped++;
        }
      } catch (error) {
        console.error(
          `✗ Error processing invoice ${invoice.invoiceNumber}:`,
          error,
        );
        invoicesSkipped++;
      }
    }

    console.log(`\nAuto-allocation complete:`);
    console.log(`- Invoices with allocations: ${invoicesAllocated}`);
    console.log(`- Invoices skipped: ${invoicesSkipped}`);

    // Summary statistics
    const paidInvoices = await prisma.propertyInvoice.count({
      where: { status: "PAID" },
    });

    const pendingInvoices = await prisma.propertyInvoice.count({
      where: {
        status: {
          in: ["PENDING", "SENT", "OVERDUE"],
        },
      },
    });

    console.log(`\nInvoice Status Summary:`);
    console.log(`- Total PAID: ${paidInvoices}`);
    console.log(`- Total Outstanding: ${pendingInvoices}`);
  } catch (error) {
    console.error("Error in auto-allocation script:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run if called directly
if (require.main === module) {
  autoAllocateExistingInvoices()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { autoAllocateExistingInvoices };
