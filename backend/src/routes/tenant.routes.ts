import { Router } from "express";
import {
  authenticate,
  authorizeProperty,
  extractPropertyId,
} from "../middleware/auth";
import { PropertyRole } from "@prisma/client";
import * as leaseController from "../controllers/tenant/lease.controller";
import * as paymentController from "../controllers/tenant/payment.controller";
import * as issueController from "../controllers/tenant/issue.controller";

const router = Router();

/**
 * @swagger
 * /tenant/lease:
 *   get:
 *     summary: Get current lease for tenant
 *     tags: [Tenant - Lease]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current lease details
 *       404:
 *         description: No active lease found
 */
router.get(
  "/lease",
  authenticate,
  extractPropertyId,
  authorizeProperty(
    PropertyRole.TENANT,
    PropertyRole.CARETAKER,
    PropertyRole.OWNER,
  ),
  leaseController.getCurrentLease,
);

/**
 * @swagger
 * /tenant/payments/initiate:
 *   post:
 *     summary: Initiate payment for rent or utilities
 *     tags: [Tenant - Payments]
 *     security:
 *       - bearerAuth: []
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
 *                 example: 5000
 *               description:
 *                 type: string
 *                 example: "Rent payment"
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *       400:
 *         description: Invalid amount
 */
router.post(
  "/payments/initiate",
  authenticate,
  extractPropertyId,
  authorizeProperty(
    PropertyRole.TENANT,
    PropertyRole.CARETAKER,
    PropertyRole.OWNER,
  ),
  paymentController.initiatePayment,
);

/**
 * @swagger
 * /tenant/payments:
 *   get:
 *     summary: Get all payments for tenant
 *     tags: [Tenant - Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED]
 *         description: Filter by payment status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get(
  "/payments",
  authenticate,
  extractPropertyId,
  authorizeProperty(
    PropertyRole.TENANT,
    PropertyRole.CARETAKER,
    PropertyRole.OWNER,
  ),
  paymentController.getPayments,
);

/**
 * @swagger
 * /tenant/issues:
 *   post:
 *     summary: Create a maintenance issue
 *     tags: [Tenant - Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, priority]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Broken window"
 *               description:
 *                 type: string
 *                 example: "Living room window is broken"
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *     responses:
 *       201:
 *         description: Issue created successfully
 *       400:
 *         description: Validation error
 */
router.post("/issues", authenticate, issueController.createIssue);

/**
 * @swagger
 * /tenant/issues:
 *   get:
 *     summary: Get all issues for tenant
 *     tags: [Tenant - Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *     responses:
 *       200:
 *         description: List of issues
 */
router.get("/issues", authenticate, issueController.getTenantIssues);

/**
 * @swagger
 * /tenant/issues/{id}:
 *   get:
 *     summary: Get a specific issue by ID
 *     tags: [Tenant - Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue details
 *       404:
 *         description: Issue not found
 */
router.get(
  "/issues/:id",
  authenticate,
  extractPropertyId,
  authorizeProperty(
    PropertyRole.TENANT,
    PropertyRole.CARETAKER,
    PropertyRole.OWNER,
  ),
  issueController.getIssue,
);

/**
 * @swagger
 * /tenant/leases:
 *   get:
 *     summary: Get all leases for tenant
 *     tags: [Tenant - Leases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leases
 */
router.get("/leases", authenticate, leaseController.getUserLeases);

export default router;
