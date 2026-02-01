import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";

export const createIssue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, title, description, priority } = req.body;

    if (!category || !title || !description) {
      throw new AppError("Category, title, and description are required", 400);
    }

    // Get tenant's active lease
    const activeLease = await prisma.lease.findFirst({
      where: {
        userId: req.user!.id,
        active: true,
      },
      include: {
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!activeLease) {
      throw new AppError("No active lease found", 404);
    }

    // Create the issue
    const issue = await prisma.issue.create({
      data: {
        leaseId: activeLease.id,
        unitId: activeLease.unitId,
        reportedBy: req.user!.id,
        category,
        title,
        description,
        priority: priority || "MEDIUM",
        status: "OPEN",
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        reportedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Create user activity for tenant
    await prisma.userActivity.create({
      data: {
        userId: req.user!.id,
        activityType: "PROPERTY_ADDITION",
        description: `Reported ${category} issue: ${title}`,
        metadata: {
          issueId: issue.id,
          category,
          title,
          priority: issue.priority,
          propertyId: activeLease.unit.propertyId,
          propertyName: activeLease.unit.property.name,
          unitId: activeLease.unitId,
          unitNumber: activeLease.unit.unitNumber,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: issue,
      message: "Issue reported successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getTenantIssues = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, limit = "10" } = req.query;

    const whereClause: any = {
      reportedBy: req.user!.id,
    };

    if (status) {
      whereClause.status = status;
    }

    const issues = await prisma.issue.findMany({
      where: whereClause,
      include: {
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parseInt(limit as string),
    });

    res.json({ success: true, data: issues });
  } catch (error) {
    next(error);
  }
};

export const getIssue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const issue = await prisma.issue.findFirst({
      where: {
        id: req.params.id,
        reportedBy: req.user!.id,
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        lease: {
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
    });

    if (!issue) {
      throw new AppError("Issue not found", 404);
    }

    res.json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};
