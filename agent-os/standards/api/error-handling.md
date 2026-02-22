# Error Handling

Use `AppError` for all expected (operational) errors. The global `errorHandler` middleware catches them.

```typescript
import { AppError } from '../middleware/errorHandler';

// Throw in controllers/services
throw new AppError('User already exists', 400);
throw new AppError('Access denied', 403);
throw new AppError('Not found', 404);
```

## In route handlers

```typescript
try {
  // logic
} catch (error) {
  return next(error); // delegates to errorHandler middleware
}
```

## When to use direct res.json() instead

Simple validation errors that don't need middleware propagation may use `res.status(400).json(...)` directly. Prefer `AppError` for consistency.

## AppError class

```typescript
new AppError(message: string, statusCode: number = 500)
```

- Sets `isOperational = true` to distinguish from unexpected crashes
- Captured in error handler: logs full stack, returns `{ success: false, message }` to client
- 500 errors return generic "Internal Server Error" message to client (full error only in logs)
