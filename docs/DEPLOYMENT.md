# Deployment & Operations Guide

## 1. Environment Configuration

The backend reads configuration from environment variables defined in `.env` or system environment. A template `.env.example` is maintained in the root directory.

### Environment Variables
| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | HTTP server listening port | `3000` | No |
| `NODE_ENV` | Environment mode (`development` / `production` / `test`) | `development` | No |
| `GEMINI_API_KEY` | Google GenAI API Key for Maps Grounding | `AIzaSy...` | Optional (falls back to mock guidance) |
| `FIREBASE_PROJECT_ID`| Target Firebase project ID | `urbn-services-nashik` | No |
| `ADMIN_AUTHORIZED_EMAILS`| Comma-separated super admin emails | `someshnagote14@gmail.com` | No |

## 2. Build & Run Commands

### Development Mode
Starts full-stack Express server with integrated Vite HMR middleware:
```bash
npm run dev
```

### Production Build & Launch
1. Bundle Vite frontend to `/dist` and bundle Express backend into `/dist/server.cjs`:
```bash
npm run build
```
2. Start production server:
```bash
npm run start
```

### Type Checking & Linting
```bash
npm run lint
```

## 3. Production Health Monitoring
- **Liveness & Readiness Check:** `GET /api/health`
- **Deep System Diagnostics (Admin):** `GET /api/admin/system-health` (Headers: `x-admin-email: someshnagote14@gmail.com`)
