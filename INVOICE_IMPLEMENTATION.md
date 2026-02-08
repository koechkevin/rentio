# Invoice Management Implementation

## Overview

This implementation provides a comprehensive invoicing system for the property management SaaS application. It allows property owners and caretakers to create, manage, and track invoices for their tenants.

## Backend Implementation

### Database Schema

#### Invoice Table

- `id` - UUID primary key
- `invoiceNumber` - Unique invoice number (format: INV-YYYY-XXXXX)
- `customerId` - Reference to User (tenant)
- `propertyId` - Reference to Property
- `unitId` - Reference to Unit
- `totalAmount` - Final total with VAT
- `vatAmount` - VAT/Tax amount
- `subTotal` - Subtotal before VAT
- `dueDate` - Payment due date
- `issueDate` - Invoice creation date
- `status` - DRAFT, SENT, PAID, OVERDUE, CANCELLED
- `notes` - Additional notes
- `createdBy` - User who created the invoice
- `createdAt`, `updatedAt`, `deletedAt` - Timestamps

#### InvoiceItem Table

- `id` - UUID primary key
- `invoiceId` - Reference to Invoice
- `itemName` - Name of the item (e.g., "Rent", "Water", "Electricity")
- `itemDescription` - Detailed description
- `unitAmount` - Price per unit
- `quantity` - Quantity (default: 1)
- `billingDuration` - DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY, ONE_TIME
- `billingPeriod` - The period this item covers (e.g., January 2026)
- `total` - Line item total (unitAmount × quantity)
- `createdAt`, `updatedAt` - Timestamps

### API Endpoints

#### 1. Create Invoice

**POST** `/api/invoices`

- **Auth**: Owner, Caretaker
- **Body**:

```json
{
  "customerId": "user-uuid",
  "unitId": "unit-uuid",
  "dueDate": "2026-02-15",
  "vatRate": 16,
  "notes": "Payment for February 2026",
  "items": [
    {
      "itemName": "Rent",
      "itemDescription": "Monthly rent for Unit 101",
      "unitAmount": 15000,
      "quantity": 1,
      "billingDuration": "MONTHLY",
      "billingPeriod": "2026-02-01"
    },
    {
      "itemName": "Water",
      "itemDescription": "Water usage",
      "unitAmount": 500,
      "quantity": 1,
      "billingDuration": "MONTHLY",
      "billingPeriod": "2026-02-01"
    }
  ]
}
```

#### 2. Get Invoices (Property Owner/Caretaker)

**GET** `/api/invoices?propertyId={id}&status={status}&page=1&limit=10`

- **Auth**: Owner, Caretaker
- **Query Params**:
  - `status` (optional): DRAFT, SENT, PAID, OVERDUE, CANCELLED
  - `customerId` (optional): Filter by customer
  - `unitId` (optional): Filter by unit
  - `page`, `limit`: Pagination

#### 3. Get Customer Invoices (Tenant)

**GET** `/api/invoices/my-invoices?status={status}&page=1&limit=10`

- **Auth**: Any authenticated user
- **Returns**: Invoices where the user is the customer

#### 4. Get Invoice by ID

**GET** `/api/invoices/:id`

- **Auth**: Owner, Caretaker, or Customer (tenant)
- **Returns**: Full invoice details with items

#### 5. Update Invoice

**PUT** `/api/invoices/:id`

- **Auth**: Owner, Caretaker
- **Body**: Same as create, but all fields are optional
- **Note**: Cannot update PAID or CANCELLED invoices

#### 6. Delete Invoice

**DELETE** `/api/invoices/:id`

- **Auth**: Owner, Caretaker
- **Note**: Soft delete, cannot delete PAID invoices

#### 7. Check if Item Already Invoiced

**GET** `/api/invoices/check/item-invoiced?unitId={id}&itemName={name}&billingPeriod={date}`

- **Auth**: Owner, Caretaker
- **Returns**: Whether the item has already been invoiced for the period
- **Use Case**: Prevent duplicate billing for the same period

#### 8. Get Suggested Items

**GET** `/api/invoices/suggested-items/:unitId?billingPeriod={date}`

- **Auth**: Owner, Caretaker
- **Returns**: Suggested invoice items including rent
- **Use Case**: Auto-populate invoice form with rent details

### Business Logic

#### Invoice Number Generation

- Format: `INV-YYYY-XXXXX` (e.g., INV-2026-00001)
- Auto-incremented per year
- Unique across all invoices

#### Duplicate Prevention

- System checks if an item has already been invoiced for a specific month
- Uses `billingPeriod` to track monthly billing cycles
- Prevents accidental duplicate charges

#### Authorization Rules

1. **Create/Update/Delete**: Only OWNER and CARETAKER roles
2. **View All Invoices**: Only OWNER and CARETAKER for their property
3. **View Single Invoice**: OWNER, CARETAKER, or the CUSTOMER (tenant) of that invoice
4. **View My Invoices**: Any authenticated user sees their own invoices

#### Automatic Status Updates

- The `InvoiceService.updateOverdueInvoices()` method can be called periodically (e.g., daily cron job) to update invoice status to OVERDUE when past due date

### Invoice Service Utility Methods

The `InvoiceService` class provides several utility methods:

1. **generateInvoiceNumber()** - Creates unique invoice numbers
2. **calculateTotals()** - Calculates subtotal, VAT, and total
3. **isItemInvoicedForPeriod()** - Checks for duplicate billing
4. **getInvoicedItemsForPeriod()** - Gets all invoiced items for a period
5. **getSuggestedItems()** - Returns suggested items (including rent)
6. **updateOverdueInvoices()** - Updates overdue invoice status
7. **getPropertyInvoiceStats()** - Gets statistics for a property
8. **getCustomerInvoiceStats()** - Gets statistics for a customer

## Frontend Implementation Guide

### Invoice Creation Form

The UI should include:

1. **Customer Selection** - Dropdown of tenants
2. **Unit Selection** - Dropdown of units (filtered by property)
3. **Due Date Picker**
4. **VAT/Tax Rate** - Input field (default: 0 or 16%)
5. **Invoice Items Table** with columns:
   - Item Name
   - Description
   - Unit Amount
   - Quantity
   - Billing Duration (dropdown)
   - Billing Period (date picker)
   - Total (calculated)
   - Actions (Add/Remove)

### Features to Implement in UI

#### 1. Auto-populate Rent

When a unit is selected:

```typescript
// Call API to get suggested items
const response = await fetch(
  `/api/invoices/suggested-items/${unitId}?billingPeriod=2026-02-01`,
);
const { suggestedItems } = await response.json();
// Add suggested items to the form
```

#### 2. Check for Existing Invoices

Before submitting, for each item:

```typescript
// Check if already invoiced
const response = await fetch(
  `/api/invoices/check/item-invoiced?unitId=${unitId}&itemName=${itemName}&billingPeriod=${billingPeriod}`,
);
const { alreadyInvoiced, existingInvoices } = await response.json();

if (alreadyInvoiced) {
  // Show warning to user
  alert(
    `This item has already been invoiced in: ${existingInvoices[0].invoice.invoiceNumber}`,
  );
}
```

#### 3. Invoice PDF Generation

Use a library like `react-pdf` or `jspdf` to generate PDFs on the frontend:

```typescript
import { jsPDF } from "jspdf";

const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();

  // Add invoice header
  doc.setFontSize(20);
  doc.text("INVOICE", 105, 20, { align: "center" });

  // Add invoice details
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 40);
  doc.text(
    `Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`,
    20,
    50,
  );
  doc.text(
    `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
    20,
    60,
  );

  // Add customer details
  doc.text(`Bill To:`, 20, 80);
  doc.text(invoice.customer.fullName, 20, 90);
  doc.text(invoice.customer.email, 20, 100);
  doc.text(invoice.customer.phone, 20, 110);

  // Add property/unit details
  doc.text(`Property: ${invoice.property.name}`, 120, 80);
  doc.text(`Unit: ${invoice.unit.unitNumber}`, 120, 90);

  // Add items table
  let y = 130;
  doc.text("Item", 20, y);
  doc.text("Qty", 100, y);
  doc.text("Unit Price", 120, y);
  doc.text("Total", 160, y);
  y += 10;

  invoice.items.forEach((item) => {
    doc.text(item.itemName, 20, y);
    doc.text(item.quantity.toString(), 100, y);
    doc.text(item.unitAmount.toFixed(2), 120, y);
    doc.text(item.total.toFixed(2), 160, y);
    y += 10;
  });

  // Add totals
  y += 10;
  doc.text(`Subtotal: ${invoice.subTotal.toFixed(2)}`, 120, y);
  y += 10;
  doc.text(`VAT: ${invoice.vatAmount.toFixed(2)}`, 120, y);
  y += 10;
  doc.setFontSize(14);
  doc.text(`Total: ${invoice.totalAmount.toFixed(2)}`, 120, y);

  // Save PDF
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
};
```

### Invoice List View

Display invoices in a table with:

- Invoice Number
- Customer Name
- Unit
- Total Amount
- Due Date
- Status (with color coding)
- Actions (View, Edit, Delete, Download PDF)

### Invoice Detail View

Show full invoice details with:

- All invoice information
- Items breakdown
- Payment history (if integrated)
- Download PDF button
- Edit button (if not PAID/CANCELLED)
- Mark as Paid button (for owners/caretakers)

## Testing the Implementation

### 1. Create an Invoice

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid",
    "unitId": "unit-uuid",
    "dueDate": "2026-03-01",
    "vatRate": 16,
    "notes": "February 2026 invoice",
    "items": [
      {
        "itemName": "Rent",
        "itemDescription": "Monthly rent",
        "unitAmount": 15000,
        "quantity": 1,
        "billingDuration": "MONTHLY",
        "billingPeriod": "2026-02-01"
      }
    ]
  }'
```

### 2. Get Invoices

```bash
curl -X GET "http://localhost:3000/api/invoices?propertyId=property-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Check if Item Already Invoiced

```bash
curl -X GET "http://localhost:3000/api/invoices/check/item-invoiced?unitId=unit-uuid&itemName=Rent&billingPeriod=2026-02-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Migration

The database migration has been created and applied:

- Migration file: `20260207104622_add_invoice_tables`
- Tables created: `invoices`, `invoice_items`
- Enums added: `InvoiceStatus`, `BillingDuration`

## Next Steps

1. **Frontend Implementation**:
   - Create invoice form component
   - Create invoice list component
   - Create invoice detail component
   - Implement PDF generation

2. **Payment Integration** (Optional):
   - Link invoices with the existing Payment model
   - Auto-update invoice status when payment is received

3. **Email Notifications** (Optional):
   - Send invoice to customer via email when status changes to SENT
   - Send reminders for overdue invoices

4. **Reporting** (Optional):
   - Add invoice analytics dashboard
   - Generate revenue reports
   - Track payment collection rates

5. **Recurring Invoices** (Optional):
   - Implement automatic monthly invoice generation
   - Set up cron job to create recurring invoices

## Security Considerations

1. ✅ Authorization checks on all endpoints
2. ✅ Property ownership verification
3. ✅ Tenant can only view their own invoices
4. ✅ Soft deletes to maintain audit trail
5. ✅ Validation of all input data
6. ✅ Prevention of duplicate billing

## Files Created/Modified

### Backend

- ✅ `backend/prisma/schema.prisma` - Added Invoice and InvoiceItem models
- ✅ `backend/src/controllers/owner/invoice.controller.ts` - Invoice controller
- ✅ `backend/src/routes/invoice.routes.ts` - Invoice routes
- ✅ `backend/src/routes/index.ts` - Added invoice routes
- ✅ `backend/src/services/invoice.service.ts` - Invoice service with utilities
- ✅ `backend/prisma/migrations/20260207104622_add_invoice_tables/` - Database migration

### Frontend (To be implemented)

- Create invoice form component
- Create invoice list component
- Create invoice detail component
- Add PDF generation functionality
