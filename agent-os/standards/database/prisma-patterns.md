# Prisma Patterns

## Enums for fixed-value fields

Use Prisma enums for statuses, roles, and types. Plain strings only for open-ended values.

```prisma
enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

enum PaymentMethod {
  MPESA
  BANK_TRANSFER
  CASH
  CHEQUE
  PESAPAL
}
```

- New domain statuses/roles must be added as Prisma enums with a migration
- Never store status values as raw strings in enum fields

## Soft deletes

Use `deletedAt` (nullable DateTime) instead of hard deletes for audit-sensitive records.

```typescript
// Always filter out soft-deleted records
await prisma.someModel.findMany({
  where: { deletedAt: null },
});

// Soft delete
await prisma.someModel.update({
  where: { id },
  data: { deletedAt: new Date() },
});
```

## Selective field fetching

Always use `select` on queries that return user data or sensitive fields.

```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    fullName: true,
    email: true,
    globalRole: true,
    // Never select: password, verificationCode, etc.
  },
});
```
