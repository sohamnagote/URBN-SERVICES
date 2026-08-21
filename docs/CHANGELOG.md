# Changelog

All notable changes to the URBN Services backend will be documented in this file.

---

### [2026-08-21] - Production Layered Architecture Refactoring
#### Added:
- Separated the codebase into dedicated, decoupled `frontend/` (frontend SPA) and `backend/` (backend API & tests) directories.
- Added standalone `backend/types.ts` making backend completely self-contained.
- Moved automated test suite to `backend/tests/` with updated import resolution.
- Initialized persistent AI context documentation system in `/docs/` (15 comprehensive documents).
- Implemented clean Layered Backend Architecture (`config/`, `middlewares/`, `validators/`, `store/`, `repositories/`, `services/`, `controllers/`, `routes/`, `jobs/`, `app.ts`).
- Created domain repositories: `BookingRepository`, `ProviderRepository`, `NotificationRepository`, `ReviewRepository`, `SupportRepository`, `AuditRepository`.
- Created domain services: `BookingService`, `ProviderService`, `NotificationService`, `OperationsService`, `AIGroundingService`, `PaymentService`, `ReviewService`, `SupportService`, `ServiceabilityService`, `AuthService`.
- Created domain controllers and master API aggregator router (`server/routes/index.ts`).
- Created isolated Express application factory (`server/app.ts`) for clean testability and modular bootstrapping.
- Added comprehensive unit test suites (`tests/unit/bookingService.test.ts`, `tests/unit/stateMachine.test.ts`, `tests/unit/notificationService.test.ts`, `tests/unit/validators.test.ts`).
- Added end-to-end integration test suites (`tests/integration/api_health.test.ts`, `tests/integration/api_serviceability.test.ts`, `tests/integration/api_bookings.test.ts`, `tests/integration/api_admin.test.ts`).
- Added `"test": "tsx --test tests/**/*.test.ts"` in `package.json`.

#### Changed:
- Refactored monolithic route handlers into single-responsibility controller/service/repository pipelines with zero breaking changes to frontend API shapes.
- Enforced strict payload validation middleware and centralized global error handling.
- Enhanced state machine verification with doorstep OTP validation and 1-Day Promise 24h SLA calculations.
- Integrated background notification scheduler worker with graceful server shutdown.

#### Validated:
- 30/30 unit and integration tests passing.
- TypeScript compiler verification (`tsc --noEmit`) 100% clean.
