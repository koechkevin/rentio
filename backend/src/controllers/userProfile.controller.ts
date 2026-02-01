import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../utils/cloudinary";

const prisma = new PrismaClient();

export class UserProfileController {
  async getUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          displayPicture: true,
          backgroundPicture: true,
          about: true,
          website: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json(user);
    } catch (error) {
      console.error("Get user profile error:", error);
      return res.status(500).json({ error: "Failed to fetch user profile" });
    }
  }

  async updateUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { about, website } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const updateData: any = {};

      if (about !== undefined) updateData.about = about;
      if (website !== undefined) updateData.website = website;

      // Handle display picture upload
      if (files?.displayPicture?.[0]) {
        const displayPictureUrl = await uploadToCloudinary(
          files.displayPicture[0],
        );
        updateData.displayPicture = displayPictureUrl;
      }

      // Handle background picture upload
      if (files?.backgroundPicture?.[0]) {
        const backgroundPictureUrl = await uploadToCloudinary(
          files.backgroundPicture[0],
        );
        updateData.backgroundPicture = backgroundPictureUrl;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          displayPicture: true,
          backgroundPicture: true,
          about: true,
          website: true,
        },
      });

      // Log profile update activity
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: "PROFILE_UPDATE",
          description: "Updated profile information",
          metadata: { fields: Object.keys(updateData) },
        },
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Update user profile error:", error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  }

  async getUserActivities(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      res.json(activities);
    } catch (error) {
      console.error("Get user activities error:", error);
      res.status(500).json({ error: "Failed to fetch user activities" });
    }
  }

  async getTenancyAgreement(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const tenancy = await prisma.tenancyAgreement.findFirst({
        where: {
          userId,
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(tenancy);
    } catch (error) {
      console.error("Get tenancy agreement error:", error);
      res.status(500).json({ error: "Failed to fetch tenancy agreement" });
    }
  }

  async getUserUploads(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const uploads = await prisma.upload.findMany({
        where: {
          uploadedById: userId,
        },
        include: {
          entityUploads: {
            select: {
              entityType: true,
              entityId: true,
              isPrimary: true,
              order: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      res.json(uploads);
    } catch (error) {
      console.error("Get user uploads error:", error);
      res.status(500).json({ error: "Failed to fetch user uploads" });
    }
  }
}
