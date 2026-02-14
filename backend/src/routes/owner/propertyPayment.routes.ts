import { Router } from "express";
import * as propertyPaymentController from "../../controllers/owner/propertyPayment.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

/**
 * @swagger
 * /property-payments/initialize:
 *   post:
 *     summary: Initialize a Pesapal payment
 *     tags: [Property Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/initialize",
  authenticate,
  propertyPaymentController.initializePayment,
);

/**
 * @swagger
 * /property-payments/ipn:
 *   post:
 *     summary: Pesapal IPN webhook
 *     tags: [Property Payments]
 */
router.post("/ipn", propertyPaymentController.handleIPN);

/**
 * @swagger
 * /property-payments/status/{orderId}:
 *   get:
 *     summary: Check payment status
 *     tags: [Property Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/status/:orderId",
  authenticate,
  propertyPaymentController.checkPaymentStatus,
);

/**
 * @swagger
 * /property-payments/property/{propertyId}:
 *   get:
 *     summary: Get payments for a property
 *     tags: [Property Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/property/:propertyId",
  authenticate,
  propertyPaymentController.getPropertyPayments,
);

/**
 * @swagger
 * /property-payments/property/{propertyId}/summary:
 *   get:
 *     summary: Get property balance summary
 *     tags: [Property Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/property/:propertyId/summary",
  authenticate,
  propertyPaymentController.getPropertyBalanceSummary,
);

export default router;
