# Invoice System - Frontend Setup (React Bootstrap)

## Overview

All invoice frontend components have been rewritten to use React Bootstrap (NobleUI template) instead of Material UI.

## Components Created

### 1. InvoiceList.tsx

- Location: `/frontend/src/pages/invoices/InvoiceList.tsx`
- Features:
  - Search functionality for invoice numbers and customer names
  - Status filtering (All, Draft, Sent, Paid, Overdue, Cancelled)
  - Custom pagination
  - View and delete actions
  - Create new invoice button
- Components Used: Card, Table, Badge, Button, Form, Spinner, Alert
- Icons: Eye, Trash2, Plus, Search (lucide-react)

### 2. CreateInvoiceForm.tsx

- Location: `/frontend/src/pages/invoices/CreateInvoiceForm.tsx`
- Features:
  - Customer and unit selection
  - Dynamic items table with add/remove rows
  - Auto-populate rent item from unit details
  - Duplicate checking (warns if item already invoiced for period)
  - DatePicker integration for due dates and billing periods
  - Real-time subtotal, VAT, and total calculations
  - Validation for required fields
- Components Used: Card, Table, Form, Button, Spinner, Alert
- Icons: Plus, Trash2, ArrowLeft (lucide-react)

### 3. InvoiceDetail.tsx

- Location: `/frontend/src/pages/invoices/InvoiceDetail.tsx`
- Features:
  - Full invoice display with customer, property, and unit details
  - Items breakdown table
  - Status badge with color coding
  - PDF download functionality with formatted invoice
  - Notes display
  - Back navigation
- Components Used: Card, Table, Badge, Button, Alert, Spinner
- Icons: Download, ArrowLeft (lucide-react)
- PDF: jsPDF with autoTable plugin

## Routes Added

In `/frontend/src/routes/AppRoutes.tsx`:

```tsx
// Lazy imports
const InvoiceList = lazy(() => import('@/pages/invoices/InvoiceList'));
const CreateInvoiceForm = lazy(() => import('@/pages/invoices/CreateInvoiceForm'));
const InvoiceDetail = lazy(() => import('@/pages/invoices/InvoiceDetail'));

// Routes
<Route path="invoices" element={<InvoiceList />} />
<Route path="invoices/create" element={<CreateInvoiceForm />} />
<Route path="invoices/:id" element={<InvoiceDetail />} />
```

## Required Dependencies

### To Install:

```bash
cd frontend
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf-autotable
```

### Already Available:

- react-bootstrap
- lucide-react
- react-day-picker
- react-router-dom

## API Integration

All components use the axios instance from `/frontend/src/config/api.ts`:

### Endpoints Used:

1. `GET /invoices` - List all invoices with pagination and filters
2. `GET /invoices/:id` - Get invoice details
3. `POST /invoices` - Create new invoice
4. `DELETE /invoices/:id` - Delete invoice
5. `GET /invoices/suggested-items/:unitId` - Get suggested items (rent) for unit
6. `GET /invoices/check/item-invoiced` - Check if item already invoiced for period
7. `GET /owner/leases` - Get customers (tenants)
8. `GET /owner/units` - Get available units

## Component Patterns

### Styling

- Uses Bootstrap utility classes (d-flex, mb-3, text-end, etc.)
- Card component for containers
- Table component with bordered and hover variants
- Badge with color variants based on status

### Icons

- All icons from lucide-react
- Consistent sizing (size={16})
- Used with className for spacing

### Forms

- Form.Control for inputs
- Form.Select for dropdowns
- Form.Label for labels
- Form.Group with mb-3 for spacing

### Loading States

- Spinner component from react-bootstrap
- Disabled buttons during operations
- Loading text feedback

### Error Handling

- Alert component for errors and warnings
- Dismissible alerts
- Color variants (danger, warning, info)

## DatePicker Integration

Uses the existing DatePicker component from the dashboard:

```tsx
import DatePicker from '../dashboard/components/DatePicker';

<DatePicker selected={date} onDateSelect={(date) => handleDateChange(date)} placeholder="Select date" />;
```

## Next Steps

1. Install required dependencies:

   ```bash
   cd frontend
   npm install jspdf jspdf-autotable
   npm install --save-dev @types/jspdf-autotable
   ```

2. Add invoice menu item to navigation (sidebar)

3. Test the complete flow:
   - Create invoice with auto-populated rent
   - Check duplicate warning functionality
   - Test PDF download
   - Verify status filtering and search
   - Test pagination

4. Optional enhancements:
   - Add edit invoice functionality
   - Implement status change (mark as paid)
   - Add bulk operations
   - Export invoices list to CSV/Excel

## File Structure

```
frontend/src/pages/invoices/
├── InvoiceList.tsx          (237 lines)
├── CreateInvoiceForm.tsx    (497 lines)
├── InvoiceDetail.tsx        (323 lines)
└── README.md                (this file)
```

## Backend Integration

The frontend is fully integrated with the backend API that was previously created:

- All CRUD operations
- Authorization checks (owner/caretaker only)
- Duplicate checking
- Auto-rent suggestion
- Status management

Backend location: `/backend/src/controllers/owner/invoice.controller.ts`
