import { Response, NextFunction } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";

export const getPropertySubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subscription = await prisma.propertySubscription.findUnique({
      where: { propertyId: req.propertyId! },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: null,
        message: "No subscription found for this property",
      });
    }

    const availableUnits = subscription.paidUnits - subscription.usedUnits;

    res.json({
      success: true,
      data: {
        ...subscription,
        availableUnits,
        canAddUnits: availableUnits > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const recordSubscriptionPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      unitsCount,
      amount,
      paymentMethod,
      reference,
      mpesaReceipt,
      paidAt,
    } = req.body;

    if (!unitsCount || !amount) {
      throw new AppError("Units count and amount are required", 400);
    }

    // Get or create subscription
    let subscription = await prisma.propertySubscription.findUnique({
      where: { propertyId: req.propertyId! },
    });

    if (!subscription) {
      subscription = await prisma.propertySubscription.create({
        data: {
          propertyId: req.propertyId!,
          paidUnits: 0,
          usedUnits: 0,
        },
      });
    }

    const validFrom = paidAt ? new Date(paidAt) : new Date();
    const validUntil = new Date(validFrom);
    validUntil.setMonth(validUntil.getMonth() + 1);

    // Create payment record
    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount,
        unitsCount,
        paymentMethod: paymentMethod || "MPESA",
        reference,
        mpesaReceipt,
        status: "COMPLETED",
        paidAt: validFrom,
        validFrom,
        validUntil,
      },
    });

    // Update subscription
    const updatedSubscription = await prisma.propertySubscription.update({
      where: { id: subscription.id },
      data: {
        paidUnits: { increment: unitsCount },
        lastPaymentDate: validFrom,
        nextBillingDate: validUntil,
        status: "ACTIVE",
      },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    // Create user activity
    await prisma.userActivity.create({
      data: {
        userId: req.user!.id,
        activityType: "PROPERTY_ADDITION",
        description: `Purchased ${unitsCount} unit slots for property`,
        metadata: {
          propertyId: req.propertyId,
          unitsCount,
          amount: amount.toString(),
          paymentId: payment.id,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: updatedSubscription,
      message: "Payment recorded successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const checkUnitAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subscription = await prisma.propertySubscription.findUnique({
      where: { propertyId: req.propertyId! },
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          canAddUnit: false,
          paidUnits: 0,
          usedUnits: 0,
          availableUnits: 0,
          requiresPayment: true,
        },
      });
    }

    const availableUnits = subscription.paidUnits - subscription.usedUnits;

    res.json({
      success: true,
      data: {
        canAddUnit: availableUnits > 0,
        paidUnits: subscription.paidUnits,
        usedUnits: subscription.usedUnits,
        availableUnits,
        requiresPayment: availableUnits <= 0,
        pricePerUnit: subscription.pricePerUnit,
        currency: subscription.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};
