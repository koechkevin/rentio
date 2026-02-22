# UI Stack

## Component Libraries

- **Primary:** `react-bootstrap` — layout, forms, tables, badges, modals
- **Icons:** `lucide-react` — all icons
- **Secondary:** MUI and/or Ant Design components are used in some areas

```typescript
// Preferred imports
import { Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { Eye, Trash2, Download, Plus, Search } from 'lucide-react';
```

## Rules

- Default to React Bootstrap for new UI — only use MUI/Antd where it already exists in the same area
- All icons must come from `lucide-react`
- Do not add new icon libraries
- Bootstrap badge variants map to domain statuses via `Record<Status, string>` helpers

```typescript
// Status-to-variant mapping pattern
const getStatusVariant = (status: InvoiceStatus): string => ({
  DRAFT: 'secondary',
  SENT: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'warning',
}[status] ?? 'secondary');

<Badge bg={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
```
