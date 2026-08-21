# Security Specification & Threat Model

## 1. Authentication & Token Verification
- **Google OAuth ID Token Verification:** The server decodes and validates Google ID tokens via Google's `tokeninfo` endpoint with cryptographic expiry checks (`exp > nowSeconds`).
- **Stateless Verification:** Identity assertions rely on cryptographically verifiable tokens or verified user identities mapped to database records.

## 2. Authorization & RBAC
- **Admin Access Control:** Protected endpoints (`/api/admin/*`, `/api/notifications/admin/*`) strictly verify authorized administrative credentials (`someshnagote14@gmail.com`).
- **Role Hierarchy:**
  - `admin`: Full unrestricted control across providers, dispatch queues, financial payouts, broadcasts, and audit trails.
  - `operations`: Real-time monitoring, live dispatch view, manual technician reassignments, support ticketing.
  - `provider`: View assigned jobs, verify customer OTP, toggle duty online/offline, view personal earnings, request payouts.
  - `customer`: Create bookings, view personal bookings and invoices, manage saved addresses, submit reviews, open support tickets.

## 3. Object-Level Access Control & Ownership
- Resource operations (such as viewing user inboxes or cancelling personal bookings) require matching `userId` or administrative role elevation.
- Critical mutations (e.g., reassignments, duty toggles, cancellations) record the `actorId` and `actorRole` into the immutable audit trail.

## 4. Input Sanitization & Attack Prevention
- **Injection Prevention:** All text fields (reviews, support messages, custom notes) are sanitized, trimmed, and length-checked before persistence.
- **Strict Payload Validation:** Extraneous, malicious, or type-mismatched payload fields are rejected at the middleware layer.
- **Price Tampering Protection:** Client-sent prices, totals, or discounts are discarded in favor of server-calculated values.

## 5. Information Leakage Prevention
- Centralized error handlers strip internal stack traces and server internals in production responses.
- Passwords, internal API tokens, and cloud secrets are never exposed in logs or API payloads.
- Structured logs omit personally identifiable information (PII) and sensitive payment tokens.

## 6. Rate Limiting & Denial-of-Service Defense
- Express application applies request rate limiting to protect public endpoints (e.g., serviceability checks, Gemini AI grounding queries, and authentication verification).
