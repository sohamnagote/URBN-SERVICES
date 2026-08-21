# Error Handling Specification

## 1. Centralized Error Response Format

All API errors returned by the backend adhere to a predictable, standardized JSON structure:

```json
{
  "success": false,
  "error": "Human-readable description of the error",
  "code": "ERROR_CODE_CONSTANT",
  "details": null
}
```

For validation errors with multiple field failures:

```json
{
  "success": false,
  "error": "Validation failed on request payload.",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "items", "message": "At least one service item is required in cart." },
    { "field": "address.locality", "message": "Valid Nashik address with locality is required." }
  ]
}
```

## 2. Standard Error Codes

| Code | HTTP Status | Meaning |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 400 | Missing or invalid request parameters or body. |
| `AUTHENTICATION_ERROR` | 401 | Invalid or expired Google authentication token. |
| `FORBIDDEN` | 403 | Insufficient role or unauthorized administrative access. |
| `NOT_FOUND` | 404 | Requested booking, provider, application, or resource does not exist. |
| `INVALID_STATE_TRANSITION`| 400 | Attempted illegal lifecycle step (e.g. `Completed` -> `Requested`). |
| `OTP_MISMATCH` | 400 | Incorrect 4-digit customer verification code supplied. |
| `SLA_VIOLATION` | 422 | Target locality is unserviceable or outside operating boundaries. |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled server exception (sanitized in production). |

## 3. Central Error Middleware
The Express application mounts a global error handling middleware:
`server/middlewares/errorHandler.ts`
- Catches unhandled promise rejections and operational errors.
- Logs full error stack traces to server logs with timestamp and request URI.
- Emits clean, client-safe error payloads without exposing internal file paths.
