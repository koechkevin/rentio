import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";
import { IssueStatus } from "@prisma/client";

export const getPropertyDashboardMetrics = async (
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

  // Get issues stats (replacing storage)
  const [openIssues, closedIssues, totalIssues] = await Promise.all([
    prisma.issue.count({
      where: {
        unit: { propertyId },
        status: { in: [IssueStatus.OPEN, IssueStatus.IN_PROGRESS] },
      },
    }),
    prisma.issue.count({
      where: {
        unit: { propertyId },
        status: IssueStatus.RESOLVED,
      },
    }),
    prisma.issue.count({
      where: {
        unit: { propertyId },
      },
    }),
  ]);

  // Get recent issues (replacing projects - show 8)
  const recentIssues = await prisma.issue.findMany({
    where: {
      unit: { propertyId },
    },
    include: {
      unit: { select: { unitNumber: true } },
      reportedByUser: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Get recent unit activity (replacing inbox - show 6)
  const recentActivity = await prisma.lease.findMany({
    where: {
      unit: { propertyId },
    },
    include: {
      unit: { select: { id: true, unitNumber: true } },
      user: { select: { id: true, fullName: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

  // Get monthly payments (replacing monthly sales)
  const currentYear = new Date().getFullYear();
  const monthlyPayments = await prisma.$queryRaw<
    Array<{ month: number; total: number }>
  >`
    SELECT 
      EXTRACT(MONTH FROM p."paid_at")::int as month,
      SUM(p.amount)::float as total
    FROM "payments" p
    INNER JOIN "leases" l ON p."lease_id" = l.id
    INNER JOIN "units" u ON l."unit_id" = u.id
    WHERE u."property_id" = ${propertyId}
      AND EXTRACT(YEAR FROM p."paid_at") = ${currentYear}
      AND p.status = 'COMPLETED'
    GROUP BY EXTRACT(MONTH FROM p."paid_at")
    ORDER BY month
  `;

  // Format monthly payments for all 12 months
  const monthlyPaymentsData = Array.from({ length: 12 }, (_, i) => {
    const monthData = monthlyPayments.find((m) => m.month === i + 1);
    return {
      month: i + 1,
      total: monthData ? Number(monthData.total) : 0,
    };
  });

  // Calculate cumulative payments
  let cumulative = 0;
  const cumulativePayments = monthlyPaymentsData.map((item) => {
    cumulative += item.total;
    return {
      month: item.month,
      total: item.total,
      cumulative,
    };
  });

  return {
    issuesStats: {
      open: openIssues,
      closed: closedIssues,
      total: totalIssues,
      percentage: totalIssues > 0 ? (closedIssues / totalIssues) * 100 : 0,
    },
    recentIssues: recentIssues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      unitNumber: issue.unit?.unitNumber,
      reportedBy: issue.reportedByUser?.fullName,
      createdAt: issue.createdAt,
    })),
    recentActivity: recentActivity.map((lease) => ({
      id: lease.id,
      unitNumber: lease.unit.unitNumber,
      tenantName: lease.user.fullName,
      startDate: lease.leaseStart,
      endDate: lease.leaseEnd,
      active: lease.active,
      updatedAt: lease.updatedAt,
    })),
    monthlyPayments: cumulativePayments,
  };
};

export const getTenantDashboardMetrics = async (userId: string) => {
  // Get active lease
  const activeLease = await prisma.lease.findFirst({
    where: {
      userId,
      active: true,
    },
    include: {
      unit: {
        include: {
          property: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { leaseStart: "desc" },
  });

  if (!activeLease) {
    return {
      hasActiveLease: false,
      tenancyDetails: null,
      arrears: 0,
      duration: null,
    };
  }

  // Calculate arrears
  const invoices = await prisma.invoice.findMany({
    where: {
      customerId: activeLease.userId,
      unitId: activeLease.unitId,
      status: { in: ["SENT", "OVERDUE"] },
    },
    include: {
      allocations: true,
    },
  });

  let arrears = 0;
  invoices.forEach((invoice) => {
    const totalAllocated = invoice.allocations.reduce(
      (sum: number, allocation: any) => sum + Number(allocation.amount),
      0,
    );
    const balance = Number(invoice.totalAmount) - totalAllocated;
    arrears += balance;
  });

  // Calculate duration
  const startDate = new Date(activeLease.leaseStart);
  const today = new Date();
  const durationInDays = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const years = Math.floor(durationInDays / 365);
  const months = Math.floor((durationInDays % 365) / 30);

  let durationText = "";
  if (years > 0) {
    durationText = `${years} year${years > 1 ? "s" : ""}`;
    if (months > 0) {
      durationText += ` ${months} month${months > 1 ? "s" : ""}`;
    }
  } else if (months > 0) {
    durationText = `${months} month${months > 1 ? "s" : ""}`;
  } else {
    durationText = `${durationInDays} day${durationInDays !== 1 ? "s" : ""}`;
  }

  return {
    hasActiveLease: true,
    tenancyDetails: {
      propertyName: activeLease.unit.property.name,
      unitNumber: activeLease.unit.unitNumber,
      startDate: activeLease.leaseStart,
      endDate: activeLease.leaseEnd,
      rentAmount: activeLease.agreedRent,
    },
    arrears,
    duration: durationText,
  };
};
