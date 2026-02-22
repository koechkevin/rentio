# Role-Based Access Control (RBAC)

Two-tier permission system:

**Global roles** (platform-wide, stored on user):
- `ADMIN` — full access to all properties
- `USER` — access scoped to assigned properties

**Property roles** (per-property, checked against `UserPropertyRole`):
- `OWNER` — full property management
- `CARETAKER` — operational access
- `TENANT` — read-only tenant access

## How property context works

Every protected request requires an `X-Property-Id` header:

```http
X-Property-Id: <propertyId>
Authorization: Bearer <token>
```

The frontend stores `currentPropertyId` in localStorage and injects it on every API call.

## Middleware usage

```typescript
// Auth only
router.use(authenticate);

// Auth + property role check
router.post('/units', extractPropertyId, authorizeProperty(PropertyRole.OWNER), handler);

// Multiple allowed roles
router.get('/units', extractPropertyId, authorizeProperty(PropertyRole.OWNER, PropertyRole.CARETAKER, PropertyRole.TENANT), handler);
```

- ADMIN users bypass property role checks — they get OWNER-level access to all properties
- Missing `X-Property-Id` returns 400, not 401
- Common mistake: forgetting to include `X-Property-Id` header in new API calls
