# Swagger API Documentation

Every route endpoint must have a `@swagger` JSDoc block. Swagger UI is served at `/docs`.

## Required format

```typescript
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Short description of what the endpoint does
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fieldName]
 *             properties:
 *               fieldName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Success message
 *       400:
 *         description: Validation error
 */
router.post('/register', authController.register);
```

- Tags group related endpoints (e.g., `[Auth]`, `[Owner]`, `[Invoices]`)
- List at minimum: the success response code and common error codes (400, 401, 403)
- Every new route file added must also be registered in the Swagger spec config
