import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as dashboardService from "../../services/dashboard.service";
import { AppError } from "../../middleware/errorHandler";

export const getPropertyMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      throw new AppError("Property ID is required", 400);
    }

    const metrics = await dashboardService.getPropertyDashboardMetrics(
      propertyId,
      req.user!.id,
    );

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};
