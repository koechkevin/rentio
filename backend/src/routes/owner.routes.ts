import { Router } from "express";
import {
  authenticate,
  authorizeProperty,
  extractPropertyId,
} from "../middleware/auth";
import { PropertyRole } from "@prisma/client";
import * as propertyController from "../controllers/owner/property.controller";
import * as unitController from "../controllers/owner/unit.controller";
import * as leaseController from "../controllers/owner/lease.controller";
import * as roleController from "../controllers/owner/role.controller";
import * as subscriptionController from "../controllers/owner/subscription.controller";
import * as paymentController from "../controllers/owner/payment.controller";
import * as dashboardController from "../controllers/owner/dashboard.controller";

const router = Router();

router.use(authenticate);

// Property routes - owner only
router.post("/properties", propertyController.createProperty);
router.get("/properties", propertyController.getProperties);
router.get("/properties/:id", propertyController.getProperty);
router.put("/properties/:id", propertyController.updateProperty);

// Property role management - owner only
router.post(
  "/properties/:propertyId/assign-role",
  authorizeProperty(PropertyRole.OWNER),
  roleController.assignRole,
);
router.delete(
  "/properties/:propertyId/users/:userId/revoke",
  authorizeProperty(PropertyRole.OWNER),
  roleController.removeRole,
);
router.get(
  "/properties/:propertyId/members",
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  roleController.getPropertyMembers,
);

// Unit routes - owner and caretaker
router.post(
  "/units",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  unitController.createUnit,
);
router.get(
  "/units",
  extractPropertyId,
  authorizeProperty(
    PropertyRole.OWNER,
    PropertyRole.CARETAKER,
    PropertyRole.TENANT,
  ),
  unitController.getUnits,
);

router.get(
  "/units/:id",
  extractPropertyId,
  authorizeProperty(
    PropertyRole.OWNER,
    PropertyRole.CARETAKER,
    PropertyRole.TENANT,
  ),
  unitController.getUnit,
);
router.put(
  "/units/:id",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  unitController.updateUnit,
);

// Lease routes
router.post(
  "/leases",
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  leaseController.createLeaseWithTenant,
);
router.get(
  "/leases",
  authorizeProperty(
    PropertyRole.OWNER,
    PropertyRole.CARETAKER,
    PropertyRole.TENANT,
  ),
  leaseController.getPropertyLeases,
);
router.get(
  "/leases/:id",
  authorizeProperty(
    PropertyRole.OWNER,
    PropertyRole.CARETAKER,
    PropertyRole.TENANT,
  ),
  leaseController.getLease,
);
router.patch(
  "/leases/:id/terminate",
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  leaseController.terminateLease,
);

// Subscription routes
router.get("/subscription", subscriptionController.getPropertySubscription);
router.post(
  "/subscription/payment",
  subscriptionController.recordSubscriptionPayment,
);
router.get("/subscription/check", subscriptionController.checkUnitAvailability);

/**
 * @swagger
 * /owner/properties:
 *   get:
 *     summary: Get all properties owned by user
 *     tags: [Owner - Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get(
  "/properties",
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  propertyController.getProperties,
);

/**
 * @swagger
 * /owner/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Owner - Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, bedrooms, bathrooms]
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               rentAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Property created successfully
 */
router.post("/properties", propertyController.createProperty);

/**
 * @swagger
 * /owner/properties/{id}:
 *   get:
 *     summary: Get property details by ID
 *     tags: [Owner - Properties]
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
 *         description: Property details
 */
router.get("/properties/:id", propertyController.getProperty);

/**
 * @swagger
 * /owner/properties/{id}:
 *   put:
 *     summary: Update property details
 *     tags: [Owner - Properties]
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
 *     responses:
 *       200:
 *         description: Property updated successfully
 */
router.put("/properties/:id", propertyController.updateProperty);

// Payment routes - owner and caretaker
router.post(
  "/payments",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  paymentController.createPayment,
);
router.get(
  "/payments",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  paymentController.getPayments,
);
router.get(
  "/payments/:id",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  paymentController.getPayment,
);
router.post(
  "/payments/:id/process",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  paymentController.processPaymentManually,
);

// Arrears routes
router.get(
  "/arrears",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  paymentController.getPropertyUnitArrears,
);

// Dashboard routes
router.get(
  "/dashboard/:propertyId",
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  dashboardController.getPropertyMetrics,
);

export default router;
