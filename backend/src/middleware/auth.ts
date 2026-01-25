import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { GlobalRole, PropertyRole as PropertyRoleEnum } from "@prisma/client";
import prisma from "../utils/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    globalRole: GlobalRole;
  };
  propertyId?: string;
  propertyRole?: PropertyRoleEnum;
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      globalRole: GlobalRole;
    };

    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};

export const authorizeGlobal = (...roles: GlobalRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.globalRole)) {
      return next(new AppError("Insufficient global permissions", 403));
    }

    next();
  };
};

export const authorizeProperty = (...roles: PropertyRoleEnum[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError("Authentication required", 401));
      }

      const propertyId = req.headers["x-property-id"] as string;

      if (!propertyId) {
        return next(new AppError("Property context required", 400));
      }

      // ADMIN users have all permissions
      if (req.user.globalRole === GlobalRole.ADMIN) {
        req.propertyId = propertyId;
        req.propertyRole = PropertyRoleEnum.OWNER;
        return next();
      }

      // Check property role
      const propertyRole = await prisma.userPropertyRole.findFirst({
        where: {
          userId: req.user.id,
          propertyId,
          removedAt: null,
        },
      });

      if (!propertyRole) {
        return next(new AppError("Access denied to this property", 403));
      }

      if (!roles.includes(propertyRole.role)) {
        return next(new AppError("Insufficient property permissions", 403));
      }

      req.propertyId = propertyId;
      req.propertyRole = propertyRole.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const extractPropertyId = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const propertyId = req.headers["x-property-id"] as string;

  if (!propertyId) {
    return next(new AppError("Property context required", 400));
  }

  req.propertyId = propertyId;
  next();
};
