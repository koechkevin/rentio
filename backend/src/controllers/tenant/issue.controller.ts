import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";

export const createIssue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { leaseId, unitId, category, title, description, priority } =
      req.body;

    const issue = await prisma.issue.create({
      data: {
        leaseId,
        unitId,
        reportedBy: req.user!.id,
        category,
        title,
        description,
        priority,
      },
    });

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

export const getIssues = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const issues = await prisma.issue.findMany({
      where: { reportedBy: req.user!.id },
      include: { unit: true },
      orderBy: { createdAt: "desc" },
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
      where: { id: req.params.id, reportedBy: req.user!.id },
      include: { unit: true },
    });

    if (!issue) {
      throw new AppError("Issue not found", 404);
    }

    res.json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};
