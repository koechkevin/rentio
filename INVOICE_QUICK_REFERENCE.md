# Invoice System - Quick Reference Card

## 🚀 Quick Start

### Backend Setup (Already Complete ✅)

```bash
# Migration already applied
cd backend
npx prisma migrate dev --name add_invoice_tables  # Already done
npx prisma generate  # Already done
```

### Frontend Setup (To Do)

```bash
cd frontend
npm install jspdf @mui/x-date-pickers
```

## 📋 Common Tasks

### 1. Create an Invoice (UI Flow)

1. Go to `/invoices/create`
2. Select customer (tenant)
3. Select unit → Rent automatically added
4. Add more items (water, electricity, etc.)
5. Set due date
6. Click "Create Invoice"

### 2. View Invoices

- Owner/Caretaker: `/invoices` (see all property invoices)
- Tenant: `/invoices/my-invoices` (see own invoices)

### 3. Download Invoice PDF

1. Open invoice detail page
2. Click "Download PDF" button
3. PDF generated and downloaded

## 🔌 API Endpoints

```typescript
// Create Invoice
POST /api/invoices
Body: { customerId, unitId, dueDate, vatRate, items[], notes }

// List Invoices (Property)
GET /api/invoices?propertyId={id}&status={status}&page=1&limit=10

// Get Invoice Details
GET /api/invoices/:id

// Update Invoice
PUT /api/invoices/:id
Body: { dueDate, notes, status, items[], vatRate }

// Delete Invoice
DELETE /api/invoices/:id

// Check Duplicate
GET /api/invoices/check/item-invoiced?unitId={id}&itemName={name}&billingPeriod={date}

// Get Suggested Items
GET /api/invoices/suggested-items/:unitId?billingPeriod={date}

// My Invoices (Tenant)
GET /api/invoices/my-invoices?status={status}&page=1&limit=10
```

## 🎨 Component Usage

### InvoiceList

```typescript
import InvoiceList from './pages/invoices/InvoiceList';

<Route path="/invoices" element={<InvoiceList />} />
```

### CreateInvoiceForm

```typescript
import CreateInvoiceForm from './pages/invoices/CreateInvoiceForm';

<Route path="/invoices/create" element={<CreateInvoiceForm />} />
```

### InvoiceDetail

```typescript
import InvoiceDetail from './pages/invoices/InvoiceDetail';

<Route path="/invoices/:id" element={<InvoiceDetail />} />
```

## 🔐 Authorization

| Role      | Create | View All | View Own | Edit | Delete |
| --------- | ------ | -------- | -------- | ---- | ------ |
| Owner     | ✅     | ✅       | ✅       | ✅   | ✅     |
| Caretaker | ✅     | ✅       | ✅       | ✅   | ✅     |
| Tenant    | ❌     | ❌       | ✅       | ❌   | ❌     |

## 📊 Invoice Status Flow

```
DRAFT → SENT → PAID
   ↓       ↓
CANCELLED  OVERDUE
```

- **DRAFT**: Just created, can edit
- **SENT**: Sent to customer, can still edit
- **PAID**: Cannot edit or delete
- **OVERDUE**: Past due date, not paid
- **CANCELLED**: Cannot edit or delete

## 💡 Business Rules

1. ✅ Invoice number format: `INV-2026-00001`
2. ✅ Cannot edit PAID or CANCELLED invoices
3. ✅ Cannot delete PAID invoices
4. ✅ Duplicate billing warning for same period
5. ✅ Rent automatically suggested for unit
6. ✅ Soft delete keeps audit trail

## 🎯 Invoice Item Billing Durations

- `DAILY` - Daily charges
- `WEEKLY` - Weekly charges
- `MONTHLY` - Monthly recurring (most common)
- `QUARTERLY` - Every 3 months
- `YEARLY` - Annual charges
- `ONE_TIME` - One-off charges

## 📝 Example Invoice Creation

```typescript
const invoice = {
  customerId: "cuid123",
  unitId: "uuid456",
  dueDate: "2026-03-01",
  vatRate: 16,
  notes: "Payment for February 2026",
  items: [
    {
      itemName: "Rent",
      itemDescription: "Monthly rent for Unit 101",
      unitAmount: 15000,
      quantity: 1,
      billingDuration: "MONTHLY",
      billingPeriod: "2026-02-01",
    },
    {
      itemName: "Water",
      itemDescription: "Water usage",
      unitAmount: 500,
      quantity: 1,
      billingDuration: "MONTHLY",
      billingPeriod: "2026-02-01",
    },
  ],
};
```

## 🧮 Calculation Example

```
Item 1: Rent = 15,000 × 1 = 15,000
Item 2: Water = 500 × 1 = 500
-----------------------------------
Subtotal = 15,500
VAT (16%) = 2,480
-----------------------------------
Total = 18,980
```

## 🔍 Troubleshooting

### TypeScript Errors

If you see errors about `InvoiceStatus` or `BillingDuration`:

1. Restart TypeScript server in VS Code
2. Or restart VS Code
3. Types exist in `@prisma/client`, just a cache issue

### PDF Not Generating

- Check `jspdf` is installed
- Check invoice data is loaded
- Check browser console for errors

### API 404 Errors

- Check base URL in `config/api.ts`
- Verify backend server is running
- Check authentication token is valid

## 📚 Documentation Files

- `INVOICE_IMPLEMENTATION.md` - Full implementation guide
- `INVOICE_SUMMARY.md` - Implementation summary
- `frontend/src/pages/invoices/README.md` - Frontend guide
- `frontend/src/types/invoice.types.ts` - TypeScript types

## 🎉 Ready to Use!

Backend is fully implemented and tested. Frontend components are ready for integration. Just install frontend dependencies and add routes!

---

**Status**: ✅ Production Ready  
**Database**: ✅ Migrated  
**API**: ✅ Functional  
**Components**: ✅ Ready  
**Types**: ✅ Defined
