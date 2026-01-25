# Multi-Tenant Property Management System (Kenya-Focused)
## Frontend (Noble UI) + Single-Domain API Architecture

---

## 1. High-Level Overview

This document defines the **full implementation blueprint** for a **multi-tenant SaaS property management system** where:

- Each **property** is accessed via its **own frontend subdomain**
  - Example: `greenpark.rentals.co.ke`
- A **single API domain** serves all tenants
  - Example: `api.rentals.co.ke`
- Strict **tenant isolation** is enforced at API and data layers

The system serves **Property Owners (Landlords)** and **Occupants (Tenants)**, with optional **public marketing listings**.

---

## 2. Core Architectural Principles

### 2.1 Multi-Tenancy Strategy

**Tenant boundary = Property**

- Every property is a hard tenant boundary
- Users can belong to multiple properties over time (historical leases)
- Subdomain → Property resolution is mandatory for all FE requests

### 2.2 Frontend Resolution Flow

1. User visits `subdomain.platform.co.ke`
2. Frontend resolves:
   - `subdomain` → `property_slug`
3. Frontend fetches property context:
   ```
   GET /public/properties/resolve?slug=greenpark
   ```
4. API returns:
   - property_id
   - branding
   - allowed auth modes
5. All subsequent API calls include:
   ```
   X-Property-ID: <uuid>
   ```

---

## 3. Domain Model (Core Entities)

### 3.1 User

- id (UUID)
- full_name
- national_id
- phone
- email
- role (OWNER | TENANT | CARETAKER | ADMIN)
- status
- created_at

---

### 3.2 Property

- id (UUID)
- owner_id
- name
- slug (used for subdomain)
- owner_provided_identifier
- location (county, town, GPS optional)
- base_currency (KES)
- is_marketable
- created_at

---

### 3.3 Unit

- id
- property_id
- unit_number
- type (bedsitter, 1br, shop)
- monthly_rent
- status (vacant | occupied)
- floor
- photos[]

---

### 3.4 Lease / Occupancy

- id
- user_id
- unit_id
- lease_start
- lease_end
- agreed_rent
- deposit
- active
- rating (given after exit)
- feedback

---

### 3.5 Payment

- id
- lease_id
- amount
- type (rent | deposit | penalty)
- method (MPESA)
- mpesa_receipt
- status
- created_at

---

### 3.6 Issue / Maintenance Ticket

- id
- lease_id
- unit_id
- category
- description
- status (open | in_progress | resolved)
- priority
- created_at

---

### 3.7 Marketing Listing

- id
- unit_id
- active
- price
- views_count
- published_at

---

## 4. API Design (REST)

### 4.1 Authentication

- JWT (access + refresh)
- Tokens scoped to:
  - user_id
  - role
- Property context passed via header

---

### 4.2 Owner APIs

#### Create Property
```
POST /owner/properties
```

#### Update Property
```
PUT /owner/properties/{property_id}
```

#### Add Unit
```
POST /owner/units
```

#### Assign Tenant to Unit
```
POST /owner/leases
```

#### Remove Tenant (End Lease)
```
POST /owner/leases/{id}/terminate
```

#### Upload Property Photos
```
POST /owner/properties/{id}/photos
```

#### View Property Dashboard
```
GET /owner/properties/{id}/dashboard
```

Metrics:
- occupancy rate
- monthly income
- arrears
- maintenance backlog

---

### 4.3 Tenant APIs

#### View Occupancy
```
GET /tenant/lease
```

#### Pay Rent (Mpesa STK)
```
POST /tenant/payments/initiate
```

#### View Receipts & Invoices
```
GET /tenant/payments
```

#### Report Issue
```
POST /tenant/issues
```

#### Track Issues
```
GET /tenant/issues
```

---

### 4.4 Public APIs

#### Resolve Property by Subdomain
```
GET /public/properties/resolve
```

#### View Market Listings
```
GET /public/listings
```

#### Track Listing Views
```
POST /public/listings/{id}/view
```

---

## 5. Frontend (Noble UI) Implementation

### 5.1 App Structure

```
src/
 ├── app/
 │   ├── auth/
 │   ├── owner/
 │   ├── tenant/
 │   ├── public/
 │   └── shared/
 ├── api/
 ├── store/
 └── utils/
```

---

### 5.2 Context Providers

- AuthContext
- PropertyContext
- PermissionContext

---

### 5.3 Subdomain Handling

```ts
const subdomain = window.location.hostname.split('.')[0];
```

Resolve before rendering protected routes.

---

## 6. Role Capabilities Matrix

| Feature | Owner | Tenant |
|------|------|------|
| Add Property | Yes | No |
| View Financials | Yes | No |
| Pay Rent | No | Yes |
| Report Issue | No | Yes |
| View Past Property | Yes | Limited |

---

## 7. Marketing Listings Module

- Optional paid subscription
- Owner enables per unit
- Public SEO-friendly pages
- Track:
  - views
  - inquiries

---

## 8. Security & Compliance

- Row-level tenant isolation
- Soft deletes
- Audit logs
- Mpesa callback verification
- Rate limiting per property

---

## 9. Important Enhancements (Recommended)

- Caretaker role
- Arrears automation
- SMS notifications
- Lease document uploads
- Document e-signatures
- Export financial reports
- Analytics per county

---

## 10. Deployment Notes

- Wildcard DNS (*.platform.co.ke)
- CDN for images
- Object storage (S3-compatible)
- Background workers for Mpesa + notifications

---

## 11. Roadmap (Suggested)

Phase 1:
- Core PMS
- Mpesa
- Dashboards

Phase 2:
- Marketing listings
- Analytics
- Caretaker app

Phase 3:
- Accounting integrations
- Credit scoring
- Owner marketplaces

---

## 12. Conclusion

This design provides:
- Strong tenant isolation
- SaaS scalability
- Kenyan payment realities
- Clear frontend/backend contract

It is production-grade and extensible.

