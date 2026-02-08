import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import bcrypt from "bcrypt";
import { resetPasswordUtil } from "../auth.controller";

export const createLeaseWithTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      unitId,
      startDate,
      leaseEnd,
      agreedRent,
      deposit,
      email,
      fullName,
      nationalId,
      phone,
    } = req.body;

    // Validate required fields
    if (
      !unitId ||
      !agreedRent ||
      !deposit ||
      !email ||
      !fullName ||
      !nationalId ||
      !phone
    ) {
      throw new AppError("Missing required fields", 400);
    }

    // Verify unit belongs to owner's property
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        propertyId: req.propertyId!,
        deletedAt: null,
      },
      include: {
        property: true,
      },
    });

    if (!unit) {
      throw new AppError(
        "Unit not found or does not belong to your property",
        404,
      );
    }

    // Check if unit already has an active lease
    const existingLease = await prisma.lease.findFirst({
      where: {
        unitId,
        active: true,
      },
    });

    if (existingLease) {
      throw new AppError("Unit already has an active lease", 400);
    }

    // Check if user exists by national ID
    let user = await prisma.user.findUnique({
      where: { nationalId },
    });

    let isNewUser = false;

    if (!user) {
      // Check if email or phone already exists
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });

      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUserByEmail) {
        throw new AppError(
          "Email already exists with different national ID",
          400,
        );
      }

      if (existingUserByPhone) {
        throw new AppError(
          "Phone number already exists with different national ID",
          400,
        );
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          fullName,
          nationalId,
          phone,
          password: hashedPassword,
          status: "INACTIVE",
          isEmailVerified: false,
        },
      });

      isNewUser = true;

      // Send verification email with temporary password
      const isPasswordReset = await resetPasswordUtil(email);
      if (!isPasswordReset) {
        throw new AppError("Failed to send verification email", 500);
      }
    }

    // Create the lease
    const lease = await prisma.lease.create({
      data: {
        userId: user.id,
        unitId,
        leaseStart: startDate ? new Date(startDate) : new Date(),
        leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
        agreedRent,
        deposit,
        active: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            nationalId: true,
          },
        },
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    // Create UserPropertyRole for tenant
    await prisma.userPropertyRole.create({
      data: {
        userId: user.id,
        propertyId: req.propertyId!,
        role: "TENANT",
        assignedBy: req.user!.id,
      },
    });

    // Update unit status to OCCUPIED
    await prisma.unit.update({
      where: { id: unitId },
      data: { status: "OCCUPIED" },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        propertyId: req.propertyId!,
        action: "CREATE_LEASE",
        entity: "LEASE",
        entityId: lease.id,
        changes: {
          unitId,
          tenantId: user.id,
          agreedRent,
          deposit,
          isNewUser,
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    // Create user activity for tenant
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: "PROPERTY_ADDITION",
        description: `Lease started for ${unit.property.name} - Unit ${unit.unitNumber}`,
        metadata: {
          leaseId: lease.id,
          propertyId: req.propertyId,
          propertyName: unit.property.name,
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          agreedRent: agreedRent.toString(),
          deposit: deposit.toString(),
          leaseStart: lease.leaseStart.toISOString(),
          leaseEnd: lease.leaseEnd?.toISOString() || null,
          isNewUser,
        },
      },
    });

    // Create user activity for property owner
    await prisma.userActivity.create({
      data: {
        userId: req.user!.id,
        activityType: "PROPERTY_ADDITION",
        description: `New tenant ${fullName} added to Unit ${unit.unitNumber}`,
        metadata: {
          leaseId: lease.id,
          propertyId: req.propertyId,
          propertyName: unit.property.name,
          tenantId: user.id,
          tenantName: fullName,
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          agreedRent: agreedRent.toString(),
          deposit: deposit.toString(),
          action: "lease_created",
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        lease,
        isNewUser,
        message: isNewUser
          ? "Lease created and verification email sent to tenant"
          : "Lease created successfully with existing user",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyLeases = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const leases = await prisma.lease.findMany({
      where: {
        unit: {
          propertyId: req.propertyId!,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            nationalId: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            type: true,
            monthlyRent: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ success: true, data: leases });
  } catch (error) {
    next(error);
  }
};

export const getLease = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lease = await prisma.lease.findFirst({
      where: {
        id: req.params.id,
        unit: {
          propertyId: req.propertyId!,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            nationalId: true,
            status: true,
          },
        },
        unit: {
          include: {
            property: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        issues: {
          where: {
            status: {
              in: ["OPEN", "IN_PROGRESS"],
            },
          },
        },
      },
    });

    if (!lease) {
      throw new AppError("Lease not found", 404);
    }

    res.json({ success: true, data: lease });
  } catch (error) {
    next(error);
  }
};

export const terminateLease = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { terminationDate, reason } = req.body;

    const lease = await prisma.lease.findFirst({
      where: {
        id,
        unit: {
          propertyId: req.propertyId!,
        },
        active: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
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

    if (!lease) {
      throw new AppError("Active lease not found", 404);
    }

    // Update lease
    const updatedLease = await prisma.lease.update({
      where: { id },
      data: {
        active: false,
        terminatedAt: terminationDate ? new Date(terminationDate) : new Date(),
      },
    });

    // Update unit status to VACANT
    await prisma.unit.update({
      where: { id: lease.unitId },
      data: { status: "VACANT" },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        propertyId: req.propertyId!,
        action: "TERMINATE_LEASE",
        entity: "LEASE",
        entityId: id,
        changes: {
          reason,
          terminationDate,
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    // Create user activity for tenant
    await prisma.userActivity.create({
      data: {
        userId: lease.userId,
        activityType: "PROPERTY_ADDITION",
        description: `Lease terminated for ${lease.unit.property.name} - Unit ${lease.unit.unitNumber}`,
        metadata: {
          leaseId: lease.id,
          propertyId: lease.unit.propertyId,
          propertyName: lease.unit.property.name,
          unitId: lease.unit.id,
          unitNumber: lease.unit.unitNumber,
          terminationDate: updatedLease.terminatedAt?.toISOString(),
          reason: reason || "Not specified",
          agreedRent: lease.agreedRent.toString(),
        },
      },
    });

    // Create user activity for property owner
    await prisma.userActivity.create({
      data: {
        userId: req.user!.id,
        activityType: "PROPERTY_ADDITION",
        description: `Lease terminated for tenant ${lease.user.fullName} in Unit ${lease.unit.unitNumber}`,
        metadata: {
          leaseId: lease.id,
          propertyId: lease.unit.propertyId,
          propertyName: lease.unit.property.name,
          tenantId: lease.userId,
          tenantName: lease.user.fullName,
          unitId: lease.unit.id,
          unitNumber: lease.unit.unitNumber,
          terminationDate: updatedLease.terminatedAt?.toISOString(),
          reason: reason || "Not specified",
          action: "lease_terminated",
        },
      },
    });

    res.json({
      success: true,
      data: updatedLease,
      message: "Lease terminated successfully",
    });
  } catch (error) {
    next(error);
  }
};
