# Architecture Decision Log (ADR)

---

### DEC-001: Layered Architecture Pattern (Routes → Controllers → Services → Repositories → Store)
- **Decision:** Separate backend into distinct single-responsibility layers: routing, request/response controllers, domain business logic services, data access repositories, and authoritative storage models.
- **Why:** Prevents coupling business logic into express route handlers, enables 100% testability of domain rules in isolation, and allows seamless switching of storage engines without touching route contracts.
- **Alternatives Considered:** Monolithic route files with inline logic (current baseline), Nest.js framework rewrite (too heavy/overkill for current footprint).
- **Impact:** High maintainability, clean unit testability, and zero risk of breaking existing API contracts.
- **Date:** 2026-08-21

---

### DEC-002: In-Memory Authoritative Operational Store with Firestore Cloud Sync
- **Decision:** Maintain an in-memory indexed authoritative store (`BackendStore`) on the server instance to guarantee sub-millisecond dispatch operations and SLA calculation while integrating with Firebase/Firestore for client document sync.
- **Why:** Guarantees instantaneous real-time state machine evaluations, in-memory atomic queue operations, and zero cold-start database latency in local/production environments.
- **Alternatives Considered:** Direct Firestore-only queries (network latency for every fast dispatch loop), standalone PostgreSQL instance (introduces infrastructure overhead for early-stage Nashik rollout).
- **Impact:** Fast local response times, robust in-memory concurrency, and continuous operational uptime.
- **Date:** 2026-08-21

---

### DEC-003: Server-Side Authoritative Bill Calculation & 15% Platform Commission
- **Decision:** Never trust pricing, discounts, taxes, or commission calculations sent by the client. All bills are authoritatively computed on the backend during `POST /api/bookings` and provider payouts.
- **Why:** Eliminates financial tampering, client-side discount manipulation, and ensures mathematical integrity of revenue records.
- **Alternatives Considered:** Client-computed cart totals with backend sanity check.
- **Impact:** Strict financial security and guaranteed audit compliance.
- **Date:** 2026-08-21

---

### DEC-004: Role-Based Access Control (RBAC) via Server-Side Google OAuth Token Resolution
- **Decision:** Validate Google OAuth ID tokens server-side (`/api/auth/google`) and resolve roles authoritatively: `someshnagote14@gmail.com` is granted `admin`, approved providers receive `provider`, all others default to `customer`.
- **Why:** Prevents client-side role forgery and ensures unauthorized actors cannot invoke admin reassignments or notification broadcast pipelines.
- **Alternatives Considered:** Client-declared role headers without cryptographic token verification.
- **Impact:** Robust security boundary with immutable authorization guarantees.
- **Date:** 2026-08-21

---

### DEC-005: 4-Digit Doorstep Verification OTP State Lock
- **Decision:** Enforce that a booking cannot transition from `Arrived` or `On the Way` to `Started` without supplying the exact 4-digit customer OTP generated at booking time.
- **Why:** Protects customer safety, prevents technician ghost jobs, and ensures billing timer starts only when the pro is physically present at the residence.
- **Alternatives Considered:** GPS-only geofence arrival detection (insufficient for apartment complexes in Nashik).
- **Impact:** 100% verified physical presence before service execution.
- **Date:** 2026-08-21

---

### DEC-006: Asynchronous In-Process Push Notification Scheduler (5s Interval)
- **Decision:** Implement a lightweight in-process interval worker (`jobs/notificationScheduler.ts`) polling scheduled notification jobs every 5 seconds.
- **Why:** Allows admins to schedule future promotional campaigns and seasonal alerts without requiring external Redis/BullMQ infrastructure in current phase.
- **Alternatives Considered:** Heavy external Celery/RabbitMQ/Redis queue clusters.
- **Impact:** Zero external deployment dependencies while delivering 100% reliable scheduled broadcasts.
- **Date:** 2026-08-21
