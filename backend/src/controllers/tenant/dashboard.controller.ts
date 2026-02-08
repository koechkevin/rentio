import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as dashboardService from "../../services/dashboard.service";

export const getTenantMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const metrics = await dashboardService.getTenantDashboardMetrics(
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
