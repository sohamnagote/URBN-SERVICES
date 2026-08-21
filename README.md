<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# URBN Services — Nashik Household Services Marketplace

> **1-Day Service Promise** — Guaranteed 24-hour service completion for plumbing, electrical, cleaning, AC, appliance repair, carpentry, painting & home maintenance across Nashik.

## Quick Start

**Prerequisites:** Node.js v20+

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set GEMINI_API_KEY in .env

# 3. Start development server (frontend + backend)
npm run dev
```

Server starts at `http://localhost:3000`.

## Scripts

| Command          | Description                                         |
| ---------------- | --------------------------------------------------- |
| `npm run dev`    | Start dev server (Vite HMR + Express API)           |
| `npm run build`  | Production build (Vite frontend + esbuild backend)  |
| `npm start`      | Start production server                             |
| `npm test`       | Run automated test suite (30 tests)                 |
| `npm run lint`   | TypeScript type check (`tsc --noEmit`)              |

## Architecture

```text
frontend/                 → Frontend Application (React 19, Tailwind CSS v4, Vite)
  ├── public/             → Static assets & service workers
  ├── src/                → UI components, pages, services, types
  ├── index.html          → SPA entrypoint
  ├── package.json        → Frontend dependencies & scripts
  ├── tsconfig.json       → Frontend TypeScript configuration
  └── vite.config.ts      → Frontend build & dev proxy configuration

backend/                  → Backend Application (Express, TypeScript)
  ├── server.ts           → Full-stack entrypoint (Vite HMR dev / static dist)
  ├── app.ts              → Express Application Factory
  ├── types.ts            → Standalone backend domain models
  ├── package.json        → Backend dependencies & scripts
  ├── tsconfig.json       → Backend TypeScript configuration
  ├── config/             → Environment, constants, logger
  ├── middlewares/        → Error handler, request logger, admin RBAC, validator
  ├── validators/         → Input validation schemas
  ├── routes/             → Express route modules + index aggregator
  ├── controllers/        → Request/response handlers
  ├── services/           → Business domain logic & 1-Day Promise SLA
  ├── repositories/       → Data access layer
  ├── store/              → Authoritative in-memory data store
  ├── jobs/               → Background notification scheduler
  └── tests/              → Unit & integration test suites (30 tests)

docs/                     → AI context system (15 persistent documents)
```

## API Endpoints

| Group             | Base Path              | Key Endpoints                              |
| ----------------- | ---------------------- | ------------------------------------------ |
| Health            | `/api/health`          | `GET /`                                    |
| Auth              | `/api/auth`            | `POST /google`                             |
| Serviceability    | `/api/serviceability`  | `GET /areas`, `POST /check`                |
| Bookings          | `/api/bookings`        | CRUD, `/verify-otp`, `/cancel`             |
| Providers         | `/api/providers`       | Directory, `/apply`, `/duty`, `/payout`    |
| Admin             | `/api/admin`           | Overview, bookings, providers, audit-logs  |
| Notifications     | `/api/notifications`   | Devices, inbox, admin jobs, templates      |
| Operations        | `/api/operations`      | Dashboard, reassign, analytics             |
| Payments          | `/api/payments`        | `/initiate`, `/confirm`                    |
| Reviews           | `/api/reviews`         | `GET /`, `POST /`                          |
| Support           | `/api/support`         | Tickets CRUD                               |
| AI Maps           | `/api/maps`            | `/grounding`, `/route-advisor`             |

## Environment Variables

| Variable           | Required | Description                                |
| ------------------ | -------- | ------------------------------------------ |
| `GEMINI_API_KEY`   | Yes      | Google GenAI API key for Gemini 3.5 Flash  |
| `PORT`             | No       | Server port (default: `3000`)              |
| `NODE_ENV`         | No       | `development` / `production` / `test`      |
| `ADMIN_EMAIL`      | No       | Super admin email (default: configured)    |

## Testing

```bash
npm test
# 30 tests, 8 suites, 0 failures
```

## Documentation

See `/docs/` for comprehensive project context:
- `CONTEXT.md` — Project overview & tech stack
- `REQUIREMENTS.md` — Requirements matrix
- `ARCHITECTURE.md` — System architecture
- `API_CONTRACT.md` — Complete endpoint schemas
- `DATABASE.md` — Entity models & access patterns
- `BUSINESS_RULES.md` — Business invariants
- `SECURITY.md` — Authentication, authorization, RBAC
- `MEMORY.md` — Compact AI working memory
