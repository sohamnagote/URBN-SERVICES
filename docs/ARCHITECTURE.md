# Backend Architecture Specification

## 1. System Overview

URBN Services backend is built as a modular, API-first, layered Node.js/Express service written in TypeScript. It provides business logic for hyper-local booking lifecycle management, SLA adherence monitoring, multi-channel push notifications, automated dispatch matching, and Google Maps-grounded AI assistance for Nashik, India.

```text
+-------------------------------------------------------------------------------+
|                                React 19 Frontend                              |
|   (Customer App / Technician Console / Operations Desk / Admin Center)        |
+-------------------------------------------------------------------------------+
                                      |
                                HTTPS / REST
                                      v
+-------------------------------------------------------------------------------+
|                              Express API Gateway                              |
|  [Security Headers] [CORS] [JSON Parser] [Request Logger] [Rate Limiter]      |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                               Middlewares Layer                               |
|        [AuthTokenVerifier] [AdminRBAC] [PayloadValidator] [ErrorHandler]       |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                               Controllers Layer                               |
|   (Auth, Bookings, Providers, Notifications, Admin, Payments, AI, Support)    |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                                 Services Layer                                |
|   (BookingService, ProviderService, NotificationEngine, AIGrounding, etc.)    |
+-------------------------------------------------------------------------------+
                       |                                       |
                       v                                       v
+-------------------------------+             +---------------------------------+
|       Repositories Layer      |             |     External Integrations       |
|  [Bookings] [Providers]       |             |  - Google OAuth Token Verifier  |
|  [Notifications] [Audits]     |             |  - Google GenAI (Gemini 3.5)    |
|  [Reviews] [SupportTickets]   |             |  - Google Maps Grounding Tool   |
+-------------------------------+             |  - Web Push / FCM Gateway       |
               |                              +---------------------------------+
               v
+-------------------------------------------------------------------------------+
|                           Authoritative Store / Database                      |
|       - In-Memory Active Operations Store (Indexed Maps & Fast Lookups)       |
|       - Firestore Cloud Database Synchronizer                                 |
+-------------------------------------------------------------------------------+
```

## 2. Request Data Flow

Every inbound request flows through strict, decoupled layers:

```text
Frontend Client Request
         |
         v
 Express Route Definition  (/api/bookings, /api/admin/...)
         |
         v
 Middlewares Layer         (authMiddleware, validateMiddleware)
         |
         v
 Controller Function       (extracts input, invokes service, shapes HTTP status)
         |
         v
 Service Logic             (business rules, commission calc, state transitions)
         |
         v
 Repository Layer          (data access, query filters, atomic updates)
         |
         v
 Data Store / Persistence  (in-memory state, Firestore sync, audit log recording)
         |
         v
 Response Serialization    (consistent JSON output: { success: true, ... })
```

## 3. Background Jobs & Asynchronous Workers
- **Notification Scheduler Job:** Runs continuously on a 5-second interval (`jobs/notificationScheduler.ts`), checking for scheduled push campaigns whose `scheduledFor` timestamp has arrived, resolving dynamic audience IDs, and executing atomic dispatch.
- **SLA Promise Monitor:** Tracks active bookings nearing the 24-hour deadline and dispatches proactive operational notifications for high-priority intervention.

## 4. Layer Responsibilities

| Layer | Responsibility | Forbidden Behaviors |
| :--- | :--- | :--- |
| **Routes** | Define URL paths, HTTP verbs, apply route middlewares, bind to controller handlers. | No business logic, no direct store access. |
| **Middlewares** | Authentication verification, role authorization, schema validation, structured error catchers. | No mutating business domain state directly. |
| **Controllers** | Parse parameters, call domain services, determine HTTP status codes (200, 201, 400, 403, 404, 500). | No direct database queries or complex business calculations. |
| **Services** | Core business rules, commission math, state transition checks, external API orchestration, audit dispatch. | No direct HTTP `req` / `res` manipulation. |
| **Repositories** | CRUD operations, entity map indexing, pagination, sorting, query filters. | No business rules or validation enforcement. |
| **Store / Models** | Type schemas, authoritative state holding, immutable audit logs. | No external network calls. |

## 5. Directory Structure & Module Separation

```text
vision2app/
├── frontend/                   # Frontend Application (React 19, Tailwind CSS v4, Vite)
│   ├── public/                 # Static web assets & service worker (sw.js)
│   ├── src/                    # UI components, views, services (apiClient), types
│   ├── index.html              # Frontend SPA entrypoint
│   ├── package.json            # Frontend workspace configuration
│   ├── tsconfig.json           # Frontend TypeScript configuration
│   └── vite.config.ts          # Frontend Vite build & dev proxy configuration
│
├── backend/                    # Backend Application (Express, TypeScript)
│   ├── server.ts               # Production & Dev server bootstrap (Vite HMR dev / static dist)
│   ├── app.ts                  # Isolated Express Application Factory
│   ├── types.ts                # Standalone backend domain models & entity types
│   ├── package.json            # Backend workspace configuration
│   ├── tsconfig.json           # Backend TypeScript configuration
│   ├── config/                 # Environment & constants (env.ts, constants.ts, logger.ts)
│   ├── controllers/            # Request handlers (auth, bookings, providers, notifications, etc.)
│   ├── services/               # Business domain logic (1-Day SLA, bills, OTP, notifications, AI)
│   ├── repositories/           # Data access layer (in-memory indexed query filters)
│   ├── middlewares/            # Error handling, request logging, admin RBAC, validation
│   ├── validators/             # Input payload schemas
│   ├── jobs/                   # Background notification scheduler & SLA monitor
│   ├── routes/                 # Express subrouters + master apiRouter aggregator
│   ├── store/                  # Authoritative in-memory state engine & seed data
│   └── tests/                  # Automated test suite
│       ├── unit/               # BookingService, StateMachine, NotificationService, Validators
│       └── integration/        # Health, Serviceability, Bookings lifecycle, Admin RBAC
│
├── docs/                       # AI Context System (15 persistent documentation files)
├── package.json                # Workspace root build, dev, test, and lint scripts
├── tsconfig.json               # Workspace root TypeScript configuration
└── vite.config.ts              # Root Vite configuration delegating to frontend/
```
