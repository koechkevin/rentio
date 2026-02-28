import { Router } from "express";
import { authenticate, extractPropertyId, authorizeProperty } from "../middleware/auth";
import { PropertyRole } from "@prisma/client";
import {
  createBillingItem,
  getBillingItems,
  getBillingItemById,
  updateBillingItem,
  deleteBillingItem,
  generateInvoiceFromBillingItem,
  bulkCreateRentBillingItems,
} from "../controllers/owner/billingItem.controller";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /billing-items:
 *   post:
 *     summary: Create a billing item for a unit and billing period
 *     tags: [Billing Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Property-Id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [unitId, itemType, frequency, year, amount]
 *             properties:
 *               unitId:
 *                 type: string
 *               itemType:
 *                 type: string
 *                 enum: [WATER, ELECTRICITY, GAS, GARBAGE, SEWERAGE, SECURITY, INTERNET, PARKING, SERVICE_CHARGE, OTHER]
 *               frequency:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, ANNUALLY]
 *               billingPeriod:
 *                 type: string
 *                 description: "MONTHLY: JAN-DEC | QUARTERLY: Q1-Q4 | ANNUALLY: omit"
 *               year:
 *                 type: integer
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: KES
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Billing item created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate billing item for unit/period/year
 */
router.post(
  "/",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  createBillingItem
);

/**
 * @swagger
 * /billing-items:
 *   get:
 *     summary: List billing items for the current property
 *     tags: [Billing Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Property-Id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, INVOICED]
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: frequency
 *         schema:
 *           type: string
 *           enum: [MONTHLY, QUARTERLY, ANNUALLY]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of billing items with pagination
 */
router.get(
  "/",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  getBillingItems
);

/**
 * @swagger
 * /billing-items/{id}:
 *   get:
 *     summary: Get a single billing item
 *     tags: [Billing Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Property-Id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Billing item detail
 *       404:
 *         description: Not found
 */
router.get(
  "/:id",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  getBillingItemById
);

/**
 * @swagger
 * /billing-items/{id}:
 *   put:
 *     summary: Update a billing item (only PENDING items can be updated)
 *     tags: [Billing Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Property-Id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated billing item
 *       400:
 *         description: Cannot update INVOICED item
 *       404:
 *         description: Not found
 */
router.put(
  "/:id",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  updateBillingItem
);

/**
 * @swagger
 * /billing-items/{id}:
 *   delete:
 *     summary: Soft-delete a billing item (only PENDING items can be deleted)
 *     tags: [Billing Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Property-Id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: Cannot delete INVOICED item
 *       403:
 *         description: Only OWNER can delete
 */
router.delete(
  "/:id",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER),
  deleteBillingItem
);

/**
 * @swagger
 * /billing-items/{id}/generate-invoice:
 *   post:
 *     summary: Convert a PENDING billing item into a tenant invoice
 *     tags: [Billing Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Property-Id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Invoice created and billing item marked as INVOICED
 *       400:
 *         description: Already invoiced
 *       404:
 *         description: Not found
 */
router.post(
  "/:id/generate-invoice",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  generateInvoiceFromBillingItem
);

/**
 * @swagger
 * /billing-items/bulk/rent:
 *   post:
 *     summary: Bulk create RENT billing items for all occupied units in the current property
 *     tags: [Billing Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Property-Id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [frequency, year]
 *             properties:
 *               frequency:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, ANNUALLY]
 *               billingPeriod:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Bulk result with created and skipped arrays
 *       400:
 *         description: Validation error
 */
router.post(
  "/bulk/rent",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  bulkCreateRentBillingItems
);

export default router;
