# PROJECT MEMORY

## Current State
- Backend: **100% Complete** — All 6 phases implemented and verified
- Phase: Production-ready, post-verification
- All 30 automated tests passing, TypeScript compilation clean

## Completed
- Complete separation into distinct `frontend/` and `backend/` folders
- `/docs/` AI context system (15 files)
- `frontend/` — React 19 SPA with Vite, Tailwind CSS v4, Lucide Icons, Motion, package.json, tsconfig.json
- `backend/types.ts` — Standalone backend domain models and entity schemas
- `backend/config/` — env, constants, logger
- `backend/middlewares/` — errorHandler, requestLogger, adminAuth, validateMiddleware
- `backend/validators/` — booking, notification, provider, review
- `backend/store/backendStore.ts` — authoritative in-memory store with indexes
- `backend/repositories/` — booking, provider, notification, review, support, audit
- `backend/services/` — auth, booking, provider, notification, operations, ai, payment, review, support, serviceability
- `backend/controllers/` — 11 controllers (auth, booking, provider, admin, notification, ops, ai, payment, review, support, serviceability)
- `backend/routes/` — all route modules + index.ts aggregator
- `backend/app.ts` — Express application factory
- `backend/jobs/notificationScheduler.ts` — background worker
- `backend/server.ts` — full-stack entrypoint with Vite HMR + graceful shutdown
- `backend/tests/` — 4 unit + 4 integration test suites (30 tests passing)

## In Progress
- None. All known requirements implemented.

## Important Decisions
- DEC-001: In-memory authoritative store (no external DB required for MVP)
- DEC-002: Super admin = `someshnagote14@gmail.com` (hardcoded, bypasses RBAC)
- DEC-003: Layered architecture: Routes → Controllers → Services → Repositories → Store
- DEC-004: Server-side bill calculation only (never trust client prices)
- DEC-005: 4-digit OTP for doorstep verification; universal dev fallback `4829`
- DEC-006: 15% platform commission, 85% provider net earnings

## Important Constraints
- Visit charge: ₹49 fixed
- Platform discount: 10% (max ₹100)
- Tax rate: 5%
- SLA: 24 hours (1-Day Promise)
- Target: Nashik corridors only (Gangapur Road, College Road, Indira Nagar, Nashik Road, Panchavati, Mumbai Naka, Mahatma Nagar)
- Frontend API compatibility: all `/api/*` paths and response shapes must remain identical

## Known Issues
- None. All tests passing, TypeScript clean.

## Next Actions
- None remaining in current scope.
- Future: Firestore cloud sync, real FCM push delivery, Razorpay payment gateway integration, production deployment pipeline.

## Important Files
- `server.ts` — Entrypoint (Vite HMR dev / static prod)
- `server/app.ts` — Express factory (isolated for testing)
- `server/config/constants.ts` — Business constants (commission, visit charge, tax, SLA)
- `server/config/env.ts` — Environment variables
- `server/store/backendStore.ts` — Authoritative data store
- `server/services/bookingService.ts` — Core booking lifecycle, bill calc, OTP, SLA
- `server/services/notificationService.ts` — Push notification engine & scheduler
- `server/middlewares/adminAuthMiddleware.ts` — Admin RBAC guard
- `server/routes/index.ts` — API route aggregator
- `src/services/apiClient.ts` — Frontend API caller (source of truth for API contracts)
- `src/types.ts` — Shared domain type definitions
