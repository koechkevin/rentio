import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../utils/prisma";
import multer from "multer";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";

// Configure multer for memory storage (Cloudinary requires buffer)
const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
      ),
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadFile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Determine folder based on entity type from headers or body
    const entityType = (req.headers["x-entity-type"] as string) || "general";
    const folder = `rentio/${entityType.toLowerCase()}s`;

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(req.file, folder);

    const uploadRecord = await prisma.upload.create({
      data: {
        filename: req.file.originalname,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: cloudinaryUrl,
        uploadedById: req.user!.id,
      },
    });

    return res.status(201).json({
      success: true,
      data: uploadRecord,
    });
  } catch (error) {
    return next(error);
  }
};

export const linkUpload = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      uploadId,
      entityType,
      entityId,
      isPrimary = false,
      order = 0,
    } = req.body;

    if (!uploadId || !entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: "uploadId, entityType, and entityId are required",
      });
    }

    // Verify upload exists and belongs to user
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }

    // If setting as primary, unset other primary images for this entity
    if (isPrimary) {
      await prisma.entityUpload.updateMany({
        where: {
          entityType,
          entityId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const entityUpload = await prisma.entityUpload.create({
      data: {
        uploadId,
        entityType,
        entityId,
        isPrimary,
        order,
      },
      include: {
        upload: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: entityUpload,
    });
  } catch (error) {
    return next(error);
  }
};

export const getEntityUploads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { entityType, entityId } = req.params;

    const entityUploads = await prisma.entityUpload.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        upload: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    res.json({
      success: true,
      data: entityUploads,
    });
  } catch (error) {
    next(error);
  }
};

export const unlinkUpload = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const entityUpload = await prisma.entityUpload.findUnique({
      where: { id },
      include: { upload: true },
    });

    if (!entityUpload) {
      return res.status(404).json({
        success: false,
        message: "Entity upload not found",
      });
    }

    // Verify ownership
    if (entityUpload.upload.uploadedById !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this upload",
      });
    }

    await prisma.entityUpload.delete({
      where: { id },
    });

    // Optionally delete the upload if no other entities are using it
    const otherLinks = await prisma.entityUpload.count({
      where: { uploadId: entityUpload.uploadId },
    });

    if (otherLinks === 0) {
      // Delete from Cloudinary
      try {
        await deleteFromCloudinary(entityUpload.upload.url);
      } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
        // Continue with database deletion even if Cloudinary deletion fails
      }

      // Delete upload record
      await prisma.upload.delete({
        where: { id: entityUpload.uploadId },
      });
    }

    return res.json({
      success: true,
      message: "Upload unlinked successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUploadOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { order, isPrimary } = req.body;

    const entityUpload = await prisma.entityUpload.findUnique({
      where: { id },
      include: { upload: true },
    });

    if (!entityUpload) {
      return res.status(404).json({
        success: false,
        message: "Entity upload not found",
      });
    }

    // Verify ownership
    if (entityUpload.upload.uploadedById !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this upload",
      });
    }

    // If setting as primary, unset other primary images for this entity
    if (isPrimary) {
      await prisma.entityUpload.updateMany({
        where: {
          entityType: entityUpload.entityType,
          entityId: entityUpload.entityId,
          isPrimary: true,
          id: { not: id },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const updated = await prisma.entityUpload.update({
      where: { id },
      data: {
        ...(order !== undefined && { order }),
        ...(isPrimary !== undefined && { isPrimary }),
      },
      include: {
        upload: true,
      },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUpload = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const upload = await prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }

    return res.json({
      success: true,
      data: upload,
    });
  } catch (error) {
    return next(error);
  }
};
