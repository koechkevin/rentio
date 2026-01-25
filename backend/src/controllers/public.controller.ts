import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

export const resolveProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.query;

    const property = await prisma.property.findUnique({
      where: { slug: slug as string, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        county: true,
        town: true,
      },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

export const getListings = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const listings = await prisma.marketingListing.findMany({
      where: { active: true },
      include: {
        unit: {
          include: { property: true },
        },
      },
    });

    res.json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
};

export const trackListingView = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await prisma.marketingListing.update({
      where: { id: req.params.id },
      data: { viewsCount: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
export const searchProperties = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query, county, town } = req.query;

    const properties = await prisma.property.findMany({
      where: {
        deletedAt: null,
        ...(query && {
          OR: [
            { name: { contains: query as string, mode: "insensitive" } },
            { town: { contains: query as string, mode: "insensitive" } },
            { county: { contains: query as string, mode: "insensitive" } },
          ],
        }),
        ...(county && { county: county as string }),
        ...(town && { town: town as string }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        county: true,
        town: true,
      },
    });

    res.json({ success: true, data: properties });
  } catch (error) {
    next(error);
  }
};

export const getPropertyDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id, deletedAt: null },
      include: {
        units: {
          where: { deletedAt: null },
        },
      },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};