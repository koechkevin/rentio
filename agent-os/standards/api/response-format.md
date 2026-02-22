# API Response Format

All responses use this envelope:

```json
// Success (single item)
{ "success": true, "message": "...", "data": { ... } }

// Success (list)
{
  "success": true,
  "message": "...",
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "totalPages": 5, "totalItems": 100 }
}

// Error
{ "success": false, "message": "Error description" }
```

- `success` is always a boolean
- `message` is always a string
- `data` is omitted on error responses
- List endpoints include `pagination` with `page`, `limit`, `totalPages`, `totalItems`
- No exceptions — every endpoint uses this format
