import { Router } from "express";
import {
  authenticate,
  authorizeProperty,
  extractPropertyId,
} from "../middleware/auth";
import { PropertyRole } from "@prisma/client";
import * as invoiceController from "../controllers/owner/invoice.controller";

const router = Router();

router.use(authenticate);

// Invoice routes - owner and caretaker can create/update/delete
router.post(
  "",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  invoiceController.createInvoice,
);

router.get(
  "",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  invoiceController.getInvoices,
);

router.get(
  "/:id",
  extractPropertyId,
  authorizeProperty(
    PropertyRole.OWNER,
    PropertyRole.CARETAKER,
    PropertyRole.TENANT,
  ),
  invoiceController.getInvoiceById,
);

router.put(
  "/:id",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  invoiceController.updateInvoice,
);

router.delete(
  "/:id",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  invoiceController.deleteInvoice,
);

// Check if item already invoiced for a period
router.get(
  "/check/item-invoiced",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  invoiceController.checkItemInvoiced,
);

// Get suggested items for invoice (including rent)
router.get(
  "/suggested-items/:unitId",
  extractPropertyId,
  authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER),
  invoiceController.getSuggestedItems,
);

// Customer invoices - tenants can view their own invoices
router.get("/my-invoices", invoiceController.getCustomerInvoices);

export default router;
