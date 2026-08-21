# Testing Strategy Specification

## 1. Testing Philosophy
The backend follows a test-driven verification strategy prioritizing:
1. **Critical Path Business Logic:** Bill computation, state machine validation, 1-Day Promise SLA deadline calculations, and commission partitioning.
2. **Security & RBAC Enforcement:** Admin route protection, role resolution, and OTP matching.
3. **Async Job Reliability:** Notification scheduler queue processing and dynamic audience targeting.
4. **API Integration Integrity:** HTTP status code correctness, payload serialization, and backward compatibility with the frontend.

## 2. Test Suites Organization

```text
tests/
│
├── unit/
│   ├── bookingService.test.ts      <-- Bill calculations, SLA promise deadlines, provider matching
│   ├── stateMachine.test.ts        <-- Valid/invalid status transitions
│   ├── notificationService.test.ts <-- Audience resolution, scheduling queue
│   └── validators.test.ts          <-- Schema rules, phone patterns, OTP format
│
└── integration/
    ├── api_health.test.ts          <-- System health and diagnostics
    ├── api_serviceability.test.ts  <-- Nashik localities and check endpoint
    ├── api_bookings.test.ts        <-- Complete booking creation, OTP, and status flow
    ├── api_admin.test.ts           <-- Admin auth checks, overview metrics, reassignments
    └── api_notifications.test.ts   <-- Custom jobs, templates, device registration
```

## 3. Running Tests

- **Run All Tests:**
```bash
npm test
```
or directly via TypeScript test runner:
```bash
npx tsx --test tests/**/*.test.ts
```

- **Run Unit Tests Only:**
```bash
npx tsx --test tests/unit/**/*.test.ts
```

- **Run Integration Tests Only:**
```bash
npx tsx --test tests/integration/**/*.test.ts
```

## 4. Verification Gate Criteria
A module or build is considered verified only when:
- 100% of unit and integration tests pass.
- TypeScript compiler passes without any type errors (`npm run lint` / `tsc --noEmit`).
- No breaking changes are introduced to API contracts consumed by the frontend.
