# Invoice System Architecture

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         INVOICE                              │
├─────────────────────────────────────────────────────────────┤
│ id (uuid)                                                    │
│ invoiceNumber (unique) - "INV-2026-00001"                   │
│ customerId → User (tenant)                                   │
│ propertyId → Property                                        │
│ unitId → Unit                                                │
│ totalAmount (Decimal)                                        │
│ vatAmount (Decimal)                                          │
│ subTotal (Decimal)                                           │
│ dueDate (DateTime)                                           │
│ issueDate (DateTime)                                         │
│ status (DRAFT|SENT|PAID|OVERDUE|CANCELLED)                  │
│ notes (Text)                                                 │
│ createdBy → User                                             │
│ createdAt, updatedAt, deletedAt                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      INVOICE_ITEM                            │
├─────────────────────────────────────────────────────────────┤
│ id (uuid)                                                    │
│ invoiceId → Invoice                                          │
│ itemName (String) - "Rent", "Water", etc.                   │
│ itemDescription (Text)                                       │
│ unitAmount (Decimal)                                         │
│ quantity (Decimal)                                           │
│ billingDuration (MONTHLY|QUARTERLY|etc.)                     │
│ billingPeriod (DateTime) - tracks monthly cycles            │
│ total (Decimal) = unitAmount × quantity                     │
│ createdAt, updatedAt                                         │
└─────────────────────────────────────────────────────────────┘
```

## System Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        INVOICE CREATION FLOW                      │
└──────────────────────────────────────────────────────────────────┘

Owner/Caretaker                                              System
     │                                                         │
     │  1. Navigate to Create Invoice                         │
     ├──────────────────────────────────────────────────────►│
     │                                                         │
     │  2. Select Customer (Tenant)                           │
     ├──────────────────────────────────────────────────────►│
     │                                                         │
     │  3. Select Unit                                        │
     ├──────────────────────────────────────────────────────►│
     │                                                         │
     │                     4. Fetch Suggested Items (Rent)    │
     │◄────────────────────────────────────────────────────────┤
     │                                                         │
     │  5. Add Additional Items (Water, Electricity)          │
     ├──────────────────────────────────────────────────────►│
     │                                                         │
     │     6. For Each Item: Check if Already Invoiced        │
     │◄────────────────────────────────────────────────────────┤
     │                                                         │
     │                     7. Show Warnings if Duplicates     │
     │◄────────────────────────────────────────────────────────┤
     │                                                         │
     │  8. Set Due Date & VAT Rate                            │
     ├──────────────────────────────────────────────────────►│
     │                                                         │
     │  9. Submit Invoice                                     │
     ├──────────────────────────────────────────────────────►│
     │                                                         │
     │                     10. Validate Data                  │
     │                     11. Generate Invoice Number        │
     │                     12. Calculate Totals               │
     │                     13. Create Invoice & Items         │
     │                                                         │
     │                     14. Return Success                 │
     │◄────────────────────────────────────────────────────────┤
     │                                                         │
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────┐
    │                    InvoiceList                        │
    │  - Displays all invoices                             │
    │  - Pagination & Filters                              │
    │  - Actions: View, Edit, Delete                       │
    └─────────┬──────────────────┬─────────────────────────┘
              │                  │
              │                  │
    ┌─────────▼──────────┐  ┌───▼────────────────────────┐
    │  CreateInvoiceForm │  │     InvoiceDetail          │
    │  - Customer Select │  │  - Full invoice display    │
    │  - Unit Select     │  │  - Customer & Property     │
    │  - Items Table     │  │  - Itemized breakdown      │
    │  - Calculations    │  │  - PDF Download Button     │
    │  - Validations     │  │  - Status Display          │
    └─────────┬──────────┘  └───┬────────────────────────┘
              │                  │
              │                  │
              └──────────┬───────┘
                         │
                         │ API Calls
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                         BACKEND API                               │
└───────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────┐
    │              invoice.routes.ts                        │
    │  - POST   /invoices                                  │
    │  - GET    /invoices                                  │
    │  - GET    /invoices/:id                              │
    │  - PUT    /invoices/:id                              │
    │  - DELETE /invoices/:id                              │
    │  - GET    /invoices/check/item-invoiced              │
    │  - GET    /invoices/suggested-items/:unitId          │
    │  - GET    /my-invoices                               │
    └─────────┬────────────────────────────────────────────┘
              │
              │ Authorization & Validation
              │
    ┌─────────▼────────────────────────────────────────────┐
    │           invoice.controller.ts                       │
    │  - createInvoice()                                   │
    │  - getInvoices()                                     │
    │  - getInvoiceById()                                  │
    │  - updateInvoice()                                   │
    │  - deleteInvoice()                                   │
    │  - checkItemInvoiced()                               │
    │  - getSuggestedItems()                               │
    │  - getCustomerInvoices()                             │
    └─────────┬────────────────────────────────────────────┘
              │
              │ Business Logic
              │
    ┌─────────▼────────────────────────────────────────────┐
    │           invoice.service.ts                          │
    │  - generateInvoiceNumber()                           │
    │  - calculateTotals()                                 │
    │  - isItemInvoicedForPeriod()                         │
    │  - getInvoicedItemsForPeriod()                       │
    │  - getSuggestedItems()                               │
    │  - updateOverdueInvoices()                           │
    │  - getPropertyInvoiceStats()                         │
    │  - getCustomerInvoiceStats()                         │
    └─────────┬────────────────────────────────────────────┘
              │
              │ Database Operations
              │
    ┌─────────▼────────────────────────────────────────────┐
    │              Prisma Client                            │
    │  - Invoice Model                                     │
    │  - InvoiceItem Model                                 │
    └─────────┬────────────────────────────────────────────┘
              │
              │
┌─────────────▼─────────────────────────────────────────────────────┐
│                      PostgreSQL Database                           │
│  - invoices table                                                 │
│  - invoice_items table                                            │
└────────────────────────────────────────────────────────────────────┘
```

## Authorization Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERMISSION MATRIX                             │
└─────────────────────────────────────────────────────────────────┘

Operation              │ Owner │ Caretaker │ Tenant │ Public
──────────────────────┼───────┼───────────┼────────┼────────
Create Invoice         │   ✅   │     ✅     │   ❌   │   ❌
View All Invoices      │   ✅   │     ✅     │   ❌   │   ❌
View Own Invoices      │   ✅   │     ✅     │   ✅   │   ❌
View Single Invoice*   │   ✅   │     ✅     │   ✅   │   ❌
Update Invoice         │   ✅   │     ✅     │   ❌   │   ❌
Delete Invoice         │   ✅   │     ✅     │   ❌   │   ❌
Download PDF           │   ✅   │     ✅     │   ✅   │   ❌
Check Duplicate        │   ✅   │     ✅     │   ❌   │   ❌
Get Suggested Items    │   ✅   │     ✅     │   ❌   │   ❌

* Tenant can only view invoices where they are the customer
```

## Data Flow: PDF Generation

```
User Action                  Frontend                    Output
     │                          │                          │
     │  1. Click Download       │                          │
     ├──────────────────────►   │                          │
     │                          │                          │
     │                     2. Fetch Invoice Data           │
     │                          │                          │
     │                     3. Create jsPDF Instance        │
     │                          │                          │
     │                     4. Add Header                   │
     │                          │                          │
     │                     5. Add Invoice Info             │
     │                          │                          │
     │                     6. Add Customer Details         │
     │                          │                          │
     │                     7. Add Property Details         │
     │                          │                          │
     │                     8. Add Items Table              │
     │                          │                          │
     │                     9. Add Totals                   │
     │                          │                          │
     │                     10. Add Notes                   │
     │                          │                          │
     │                     11. Add Footer                  │
     │                          │                          │
     │                     12. Generate PDF                │
     │                          │                          │
     │                     13. Download File               │
     │                          ├──────────────────────────►│
     │                          │                     invoice.pdf
```

## Invoice Status Lifecycle

```
                    ┌──────────┐
                    │  DRAFT   │ ◄── Initial creation
                    └────┬─────┘
                         │
                         │ Send to customer
                         ▼
                    ┌──────────┐
              ┌────►│   SENT   │
              │     └────┬─────┘
              │          │
              │          │ Payment received OR Due date passed
              │          ▼
    Cancel    │     ┌─────────┐
              │     │  PAID   │ ◄── Final state (success)
              │     └─────────┘
              │          │
              │     ┌────▼─────┐
              └─────┤ OVERDUE  │ ◄── Auto-updated by cron
                    └──────────┘
                         │
                         │ Manual cancel
                         ▼
                    ┌───────────┐
                    │ CANCELLED │ ◄── Final state (failure)
                    └───────────┘

Status Rules:
- DRAFT: Can edit, can delete
- SENT: Can edit, can delete
- PAID: Cannot edit, cannot delete
- OVERDUE: Can edit, can delete
- CANCELLED: Cannot edit, cannot delete
```

## Monthly Billing Cycle

```
Month: February 2026

Day 1-5: Create Invoices
┌─────────────────────────────────────────────────────────┐
│ Invoice Created                                          │
│ - Invoice Date: Feb 1, 2026                             │
│ - Due Date: Feb 15, 2026                                │
│ - Billing Period: Feb 1, 2026 (for tracking)           │
│ - Status: DRAFT                                         │
└─────────────────────────────────────────────────────────┘

Day 5-15: Invoice Processing
┌─────────────────────────────────────────────────────────┐
│ Owner/Caretaker Actions:                                │
│ 1. Review invoice                                       │
│ 2. Update status to SENT                                │
│ 3. Email/Share PDF with tenant                          │
└─────────────────────────────────────────────────────────┘

Day 15: Due Date
┌─────────────────────────────────────────────────────────┐
│ Two Outcomes:                                           │
│ A. Payment Received → Status: PAID ✅                   │
│ B. No Payment → Status: OVERDUE ⚠️                      │
└─────────────────────────────────────────────────────────┘

Day 16+: Follow-up
┌─────────────────────────────────────────────────────────┐
│ For OVERDUE:                                            │
│ - Send reminders                                        │
│ - Late fees (future feature)                            │
│ - Eventually: Mark as PAID or CANCELLED                 │
└─────────────────────────────────────────────────────────┘

⚠️ Important: System checks for duplicate items in the same
billing period (month) to prevent double-billing
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
├─────────────────────────────────────────────────────────┤
│ React + TypeScript                                      │
│ Material-UI (MUI)                                       │
│ React Router                                            │
│ jsPDF (PDF generation)                                  │
│ @mui/x-date-pickers (Date picking)                      │
│ Axios (API calls)                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      BACKEND                             │
├─────────────────────────────────────────────────────────┤
│ Node.js + Express                                       │
│ TypeScript                                              │
│ Prisma ORM                                              │
│ PostgreSQL                                              │
│ JWT Authentication                                      │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides a complete, production-ready invoicing system with proper authorization, data validation, and user experience considerations.
