import { Router } from "express";
import * as propertyInvoiceController from "../../controllers/owner/propertyInvoice.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

/**
 * @swagger
 * /property-invoices:
 *   get:
 *     summary: Get all property invoices for user
 *     tags: [Property Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SENT, PAID, OVERDUE, CANCELLED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of property invoices
 */
router.get("/", authenticate, propertyInvoiceController.getPropertyInvoices);

/**
 * @swagger
 * /property-invoices/billing-config:
 *   get:
 *     summary: Get billing configuration
 *     tags: [Property Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Billing configuration
 */
router.get(
  "/billing-config",
  authenticate,
  propertyInvoiceController.getBillingConfig,
);

/**
 * @swagger
 * /property-invoices/{id}:
 *   get:
 *     summary: Get property invoice by ID
 *     tags: [Property Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property invoice details
 *       404:
 *         description: Invoice not found
 */
router.get("/:id", authenticate, propertyInvoiceController.getPropertyInvoice);

/**
 * @swagger
 * /property-invoices/{id}/payments:
 *   post:
 *     summary: Record payment for property invoice
 *     tags: [Property Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               reference:
 *                 type: string
 *               mpesaReceipt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded
 */
router.post(
  "/:id/payments",
  authenticate,
  propertyInvoiceController.recordPropertyInvoicePayment,
);

export default router;
