# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RentalHub is a multi-tenant property management SaaS built for Kenya. The core concept: each **Property** is a tenant boundary. Users can have different roles on different properties. The system handles rent invoicing, payment collection (M-Pesa, PesaPal, bank), maintenance issues, and subscriptions.

## Repository Structure

```
property-saas/
├── backend/          # Node.js + Express + TypeScript API
├── frontend/         # React 19 + TypeScript + Vite SPA
├── server/           # Nginx reverse proxy config
└── agent-os/         # Project standards (read these!)
    └── standards/
        ├── api/      # error-handling, rbac, response-format, swagger-docs
        ├── database/ # prisma-patterns
        └── frontend/ # state-management, ui-stack
```

## Development Commands

### Backend (`backend/`)
```bash
yarn install          # Install dependencies
yarn run dev          # Start dev server with nodemon
yarn run build        # Compile TypeScript → dist/
yarn start            # Run compiled output
yarn run lint         # ESLint check
yarn run test         # Jest tests

# Database
yarn run prisma:generate   # Regenerate Prisma client after schema changes
yarn run prisma:migrate    # Run pending migrations
yarn run prisma:studio     # Open Prisma GUI at localhost:5555
yarn run prisma:seed       # Seed with test data
```

Or via Makefile:
```bash
make dev              # Start dev server
make db-migrate       # Run migrations
make db-studio        # Open Prisma Studio
make db-seed          # Seed database
make db-reset         # Reset database
make up               # docker-compose up --build
make setup            # Full setup (install + docker + migrate + seed)
```

### Frontend (`frontend/`)
```bash
npm install           # Install dependencies
npm run dev           # Vite dev server
npm run build         # Type-check + build
npm run lint          # ESLint check
npm run preview       # Preview production build
```

## Architecture

### Multi-Tenancy Model

- Every protected API request requires both `Authorization: Bearer <token>` and `X-Property-Id: <propertyId>` headers.
- Frontend stores `currentPropertyId` in localStorage; it's auto-injected into every RTK Query call via `prepareHeaders`.
- Use `useCurrentProperty()` hook to read the current property in components—never read localStorage directly.
- ADMIN global role bypasses property role checks; `USER` is scoped to assigned properties.

### Backend Structure

```
src/
├── app.ts                   # Express app setup (middleware, routes)
├── index.ts                 # Server entry point
├── controllers/
│   ├── owner/               # Property management controllers
│   └── tenant/              # Tenant-facing controllers
├── routes/                  # Route definitions with Swagger JSDoc
├── services/                # Business logic (invoice, payment, email, etc.)
├── middleware/
│   ├── auth.ts              # authenticate, extractPropertyId, authorizeProperty
│   └── errorHandler.ts      # AppError class + global error handler
└── utils/
    ├── prisma.ts            # Prisma client singleton
    └── logger.ts            # Winston logger
```

API base path: `/api/v1/`

### Frontend Structure

```
src/
├── store/
│   ├── store.ts             # Redux store
│   ├── slices/              # authSlice, propertySlice
│   └── services/            # 13 RTK Query API slices
├── hooks/                   # useCurrentProperty() and other custom hooks
├── routes/                  # React Router config
├── pages/                   # Page components
├── components/              # Reusable components
└── layouts/                 # Header, sidebar, layout wrappers
```

Auth state lives in both Redux and localStorage and must stay in sync. On 401, `baseQueryWithReauth` auto-refreshes the token via `POST /auth/refresh` and retries; on refresh failure it clears state and redirects to `/auth/login`.

## Key Standards (from `agent-os/standards/`)

### API Responses
Every endpoint returns this envelope—no exceptions:
```json
{ "success": true, "message": "...", "data": { ... } }
{ "success": true, "message": "...", "data": [...], "pagination": { "page": 1, "limit": 20, "totalPages": 5, "totalItems": 100 } }
{ "success": false, "message": "Error description" }
```

### Error Handling
```typescript
import { AppError } from '../middleware/errorHandler';
throw new AppError('User not found', 404);  // caught by global errorHandler
// In async controllers, pass errors to next(error)
```

### RBAC Middleware
```typescript
router.use(authenticate);  // auth only
router.post('/units', extractPropertyId, authorizeProperty(PropertyRole.OWNER), handler);
router.get('/units', extractPropertyId, authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER, PropertyRole.TENANT), handler);
```

### Database (Prisma)
- Use Prisma enums for all status/role/type fields—never raw strings in enum columns.
- Use `deletedAt` (nullable DateTime) for soft deletes on audit-sensitive records; always filter `where: { deletedAt: null }`.
- Always `select` specific fields on user queries; never return `password`, `verificationCode`, etc.

### Frontend UI
- **React Bootstrap** for layout, forms, tables, badges, modals.
- **Lucide React** for all icons—do not add other icon libraries.
- Status-to-variant mapping pattern:
  ```typescript
  const getStatusVariant = (status: InvoiceStatus): string => ({
    DRAFT: 'secondary', SENT: 'info', PAID: 'success', OVERDUE: 'danger', CANCELLED: 'warning',
  }[status] ?? 'secondary');
  ```

### Swagger Docs
Every new route must have a `@swagger` JSDoc block. Register new route files in the Swagger spec config. Swagger UI is at `/docs` (basic auth protected in production).

## Domain Model Highlights

- **User** → has a `globalRole` (ADMIN | USER)
- **UserPropertyRole** → links User to Property with a `PropertyRole` (OWNER | CARETAKER | TENANT)
- **Property** → tenant boundary; has subscription, audit logs
- **Unit** → rentable unit within a property; status: VACANT | OCCUPIED | MAINTENANCE
- **Invoice** → tenant invoice; status: DRAFT | SENT | PAID | OVERDUE | CANCELLED; supports VAT, multi-item, payment allocation
- **Payment** → methods: MPESA | BANK_TRANSFER | CASH | CHEQUE | PESAPAL; allocated to invoices
- **Lease/Tenancy** → occupancy agreement linking tenant to unit
- **Issue** → maintenance ticket with priority (LOW | MEDIUM | HIGH | URGENT)

## Environment

Backend requires a `.env` file (see `.env.example`). Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- `CLOUDINARY_*` — file uploads
- `MPESA_*` — M-Pesa integration
- `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` — phone verification
