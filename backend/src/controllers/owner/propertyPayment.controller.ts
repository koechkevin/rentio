import { Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";
import { pesapalService } from "../../services/pesapal.service";
import {
  autoAllocatePropertyPayment,
  calculatePropertyArrears,
} from "../../services/propertyPayment.service";
import { Prisma } from "@prisma/client";

const CALLBACK_URL =
  process.env.PESAPAL_CALLBACK_URL ||
  "http://localhost:5173/billing/payment-callback";
const IPN_URL =
  process.env.PESAPAL_IPN_URL ||
  `http://localhost:${process.env.PORT || 5556}/api/property-payments/ipn`;

/**
 * Initialize a payment for property
 */
export const initializePayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId, amount, description } = req.body;

    if (!propertyId || !amount) {
      throw new AppError("Property ID and amount are required", 400);
    }

    // Verify property exists and user has access
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        OR: [
          { ownerId: req.user!.id },
          {
            userPropertyRoles: {
              some: {
                userId: req.user!.id,
                removedAt: null,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      throw new AppError("Property not found or access denied", 404);
    }

    // Generate unique order ID
    const orderId = `PROP-PAY-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create pending payment record
    const payment = await prisma.propertyPayment.create({
      data: {
        propertyId,
        amount: new Prisma.Decimal(amount),
        allocatedAmount: new Prisma.Decimal(0),
        unallocatedAmount: new Prisma.Decimal(amount),
        type: "OTHER",
        method: "PESAPAL",
        reference: orderId,
        status: "PENDING",
        createdBy: req.user!.id,
      },
    });

    // Get or register IPN
    let ipnId: string;
    try {
      const ipns = await pesapalService.getRegisteredIPNs();
      const existingIpn = ipns.find((ipn: any) => ipn.url === IPN_URL);

      if (existingIpn) {
        ipnId = existingIpn.ipn_id;
      } else {
        const ipnResponse = await pesapalService.registerIPN(IPN_URL);
        ipnId = ipnResponse.ipn_id;
      }
    } catch (error) {
      console.error("IPN registration error:", error);
      ipnId = process.env.PESAPAL_IPN_ID || "";
    }

    // Submit order to Pesapal
    const orderRequest = {
      id: orderId,
      currency: "KES",
      amount: Number(amount).toFixed(2),
      description: description || `Property payment for ${property.name}`,
      callback_url: CALLBACK_URL,
      notification_id: ipnId,
      billing_address: {
        email_address: property.owner.email,
        phone_number: property.owner.phone,
        first_name: property.owner.fullName.split(" ")[0],
        last_name: property.owner.fullName.split(" ").slice(1).join(" ") || "",
      },
    };

    const pesapalResponse = await pesapalService.submitOrder(orderRequest);

    res.status(201).json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId,
        redirectUrl: pesapalResponse.redirect_url,
        orderTrackingId: pesapalResponse.order_tracking_id,
      },
      message: "Payment initialized. Redirect to complete payment.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Pesapal IPN callback
 */
export const handleIPN = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } =
      req.body;

    console.log("Pesapal IPN received:", req.body);
    if (!OrderTrackingId) {
      return res.status(200).json({ status: "received" });
    }

    // Get transaction status from Pesapal
    const transactionStatus =
      await pesapalService.getTransactionStatus(OrderTrackingId);

    console.log("Transaction status:", transactionStatus);

    // Find the payment by reference (orderId)
    const payment = await prisma.propertyPayment.findFirst({
      where: {
        reference: OrderMerchantReference,
      },
    });

    if (!payment) {
      console.error("Payment not found for IPN:", OrderTrackingId);
      return res.status(200).json({ status: "payment_not_found" });
    }

    // Map Pesapal status codes
    let paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED" =
      "PENDING";

    switch (transactionStatus.status_code) {
      case 0:
        paymentStatus = "PENDING";
        break;
      case 1:
        paymentStatus = "COMPLETED";
        break;
      case 2:
        paymentStatus = "FAILED";
        break;
      case 3:
        paymentStatus = "REVERSED";
        break;
      default:
        paymentStatus = "PENDING";
    }

    // Update payment with full transaction response
    await prisma.propertyPayment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        mpesaReceipt: transactionStatus.payment_method
          ?.toUpperCase()
          .includes("MPESA")
          ? transactionStatus.confirmation_code
          : null,
        paidAt: paymentStatus === "COMPLETED" ? new Date() : null,
        transactionResponse: JSON.parse(JSON.stringify(transactionStatus)),
      },
    });

    // If payment completed, auto-allocate to invoices for this property
    if (paymentStatus === "COMPLETED") {
      await autoAllocatePropertyPayment(payment.id);
    }

    res.status(200).json({
      status: "success",
      orderNotificationType: OrderNotificationType,
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
    });
  } catch (error) {
    console.error("IPN handling error:", error);
    res.status(200).json({ status: "error", message: "Processing error" });
  }
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.propertyPayment.findUnique({
      where: { id: paymentId },
      include: {
        allocations: {
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                totalAmount: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payments for a property
 */
export const getPropertyPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Verify property access
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        OR: [
          { ownerId: req.user!.id },
          {
            userPropertyRoles: {
              some: {
                userId: req.user!.id,
                removedAt: null,
              },
            },
          },
        ],
      },
    });

    if (!property) {
      throw new AppError("Property not found or access denied", 404);
    }

    const where: any = {
      propertyId,
    };

    if (status) {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      prisma.propertyPayment.findMany({
        where,
        include: {
          allocations: {
            include: {
              invoice: {
                select: {
                  id: true,
                  invoiceNumber: true,
                  totalAmount: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.propertyPayment.count({ where }),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems: total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get property balance and arrears summary
 */
export const getPropertyBalanceSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;

    // Verify property access
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        OR: [
          { ownerId: req.user!.id },
          {
            userPropertyRoles: {
              some: {
                userId: req.user!.id,
                removedAt: null,
              },
            },
          },
        ],
      },
    });

    if (!property) {
      throw new AppError("Property not found or access denied", 404);
    }

    // Calculate current arrears
    const arrears = await calculatePropertyArrears(propertyId);

    // Get recent invoices summary
    const invoiceSummary = await prisma.propertyInvoice.groupBy({
      by: ["status"],
      where: { propertyId },
      _count: true,
      _sum: {
        totalAmount: true,
      },
    });

    // Calculate total paid
    const totalPaidResult = await prisma.propertyPayment.aggregate({
      where: {
        propertyId,
        status: "COMPLETED",
      },
      _sum: { amount: true },
    });

    // Calculate total unallocated amount
    const totalUnallocatedResult = await prisma.propertyPayment.aggregate({
      where: {
        propertyId,
        status: "COMPLETED",
      },
      _sum: { unallocatedAmount: true },
    });

    res.json({
      success: true,
      data: {
        totalPaid: Number(totalPaidResult._sum.amount || 0),
        unallocatedBalance: Number(
          totalUnallocatedResult._sum.unallocatedAmount || 0,
        ),
        arrears,
        invoiceSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};
