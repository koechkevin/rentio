import { autoAllocateToNewPropertyInvoice } from "../services/propertyPayment.service";
import prisma from "../utils/prisma";

interface BillingConfigMap {
  RATE_PER_UNIT: string;
  CURRENCY: string;
  TAX_RATE: string;
  DUE_DAYS: string;
}

const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PROP-${year}${month}-${random}`;
};

const getBillingConfig = async (): Promise<BillingConfigMap> => {
  const config = await prisma.billingConfig.findMany();

  const defaults: BillingConfigMap = {
    RATE_PER_UNIT: "100",
    CURRENCY: "KES",
    TAX_RATE: "0",
    DUE_DAYS: "14",
  };

  return config.reduce((acc, item) => {
    acc[item.key as keyof BillingConfigMap] = item.value;
    return acc;
  }, defaults);
};

const generateMonthlyInvoices = async () => {
  console.log("Starting monthly invoice generation...");

  try {
    const config = await getBillingConfig();
    const ratePerUnit = Number(config.RATE_PER_UNIT);
    const taxRate = Number(config.TAX_RATE);
    const dueDays = Number(config.DUE_DAYS);
    const currency = config.CURRENCY;

    // Get current date for default billing period calculation
    const now = new Date();
    const defaultBillingPeriodEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );
    const defaultBillingPeriodStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
    );

    // Get all active properties
    const properties = await prisma.property.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        units: {
          where: {
            deletedAt: null,
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
            },
          },
        },
      },
    });

    console.log(`Found ${properties.length} properties to process`);

    let invoicesCreated = 0;
    let invoicesSkipped = 0;

    for (const property of properties) {
      // Determine billing period based on last billing period
      let billingPeriodStart: Date;
      let billingPeriodEnd: Date;

      if (property.lastBillingPeriodEnd) {
        // Start from day after last billing period
        billingPeriodStart = new Date(property.lastBillingPeriodEnd);
        billingPeriodStart.setDate(billingPeriodStart.getDate() + 1);
        billingPeriodStart.setHours(0, 0, 0, 0);

        // End at the end of the month containing the start date
        billingPeriodEnd = new Date(
          billingPeriodStart.getFullYear(),
          billingPeriodStart.getMonth() + 1,
          0,
          23,
          59,
          59,
        );
      } else {
        // First time billing - use default period
        billingPeriodStart = defaultBillingPeriodStart;
        billingPeriodEnd = defaultBillingPeriodEnd;
      }

      // Skip if billing period end is in the future
      if (billingPeriodEnd > now) {
        console.log(
          `Skipping ${property.name}: Billing period not yet complete`,
        );
        invoicesSkipped++;
        continue;
      }

      // Check if invoice already exists for this period
      const existingInvoice = await prisma.propertyInvoice.findFirst({
        where: {
          propertyId: property.id,
          billingPeriodStart,
          billingPeriodEnd,
        },
      });

      if (existingInvoice) {
        console.log(`Skipping ${property.name}: Invoice already exists`);
        invoicesSkipped++;
        continue;
      }

      // Get occupied units with active leases during billing period
      const occupiedUnits = property.units.filter((unit) => {
        return unit.leases.some((lease) => {
          const leaseStart = new Date(lease.leaseStart);
          const leaseEnd = lease.leaseEnd ? new Date(lease.leaseEnd) : null;
          console.log({
            leaseStart,
            leaseEnd,
            billingPeriodStart,
            billingPeriodEnd,
          });
          // Lease must have started before or during billing period
          // and must not have ended before billing period started
          return (
            leaseStart <= billingPeriodEnd &&
            (leaseEnd === null || leaseEnd >= billingPeriodStart)
          );
        });
      });

      // Skip if no occupied units
      if (occupiedUnits.length === 0) {
        console.log(`Skipping ${property.name}: No occupied units`);
        invoicesSkipped++;
        continue;
      }

      // Prepare invoice items
      const invoiceItems = occupiedUnits.map((unit) => {
        const activeLease = unit.leases.find((lease) => {
          const leaseStart = new Date(lease.leaseStart);
          const leaseEnd = lease.leaseEnd ? new Date(lease.leaseEnd) : null;
          return (
            leaseStart <= billingPeriodEnd &&
            (leaseEnd === null || leaseEnd >= billingPeriodStart)
          );
        });

        return {
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          unitType: unit.type,
          tenantName: activeLease?.user?.fullName || null,
          tenantEmail: activeLease?.user?.email || null,
          description: `Monthly management fee - Unit ${unit.unitNumber} (${unit.type})`,
          unitAmount: ratePerUnit,
          quantity: 1,
          total: ratePerUnit,
        };
      });

      // Calculate amounts
      const subtotal = occupiedUnits.length * ratePerUnit;
      const tax = subtotal * (taxRate / 100);
      const totalAmount = subtotal + tax;

      // Calculate due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDays);

      // Create invoice with items in a transaction
      const invoice = await prisma.$transaction(async (tx) => {
        const newInvoice = await tx.propertyInvoice.create({
          data: {
            invoiceNumber: generateInvoiceNumber(),
            propertyId: property.id,
            billingPeriodStart,
            billingPeriodEnd,
            occupiedUnits: occupiedUnits.length,
            ratePerUnit,
            subtotal,
            tax,
            totalAmount,
            currency,
            status: "PENDING",
            dueDate,
            notes: `Monthly billing for ${occupiedUnits.length} occupied unit(s) - Period: ${billingPeriodStart.toLocaleDateString()} to ${billingPeriodEnd.toLocaleDateString()}`,
            items: {
              create: invoiceItems,
            },
          },
          include: {
            items: true,
          },
        });

        // Update property's last billing period
        await tx.property.update({
          where: { id: property.id },
          data: { lastBillingPeriodEnd: billingPeriodEnd },
        });

        return newInvoice;
      });
      await autoAllocateToNewPropertyInvoice(invoice.id);
      console.log(
        `Created invoice ${invoice.invoiceNumber} for ${property.name}:`,
      );
      console.log(`  - Units: ${occupiedUnits.length}`);
      console.log(`  - Amount: ${currency} ${totalAmount}`);
      console.log(
        `  - Period: ${billingPeriodStart.toLocaleDateString()} to ${billingPeriodEnd.toLocaleDateString()}`,
      );
      invoicesCreated++;
    }

    console.log(`\nInvoice generation complete:`);
    console.log(`- Invoices created: ${invoicesCreated}`);
    console.log(`- Invoices skipped: ${invoicesSkipped}`);

    // Update overdue invoices
    const overdueCount = await prisma.propertyInvoice.updateMany({
      where: {
        status: "PENDING",
        dueDate: { lt: new Date() },
      },
      data: {
        status: "OVERDUE",
      },
    });

    console.log(`- Invoices marked overdue: ${overdueCount.count}`);
  } catch (error) {
    console.error("Error generating invoices:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run if called directly
if (require.main === module) {
  generateMonthlyInvoices()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { generateMonthlyInvoices };
