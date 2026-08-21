# URBN Services - AI Context

## Project Overview
- **Project Name:** URBN Services
- **Purpose:** Nashik-first hyper-local household services marketplace connecting residents with verified trade professionals for plumbing, electrical, cleaning, AC service, appliance repair, carpentry, painting, and home maintenance.
- **Differentiator:** Strict "1-Day Service Promise" guaranteeing 24-hour service completion or service recovery credit.
- **Target Market:** Nashik, Maharashtra, India (Core Corridors: Gangapur Road, College Road, Indira Nagar, Nashik Road, Panchavati, Mumbai Naka, Mahatma Nagar).

## Target Users & Roles
1. **Customer:** Nashik residents requesting household repairs, tracking live technician dispatch, verifying doorstep OTP, rating services, and receiving automated push notifications.
2. **Provider (Partner):** Verified local tradespeople who manage online/offline duty status, receive geo-matched service leads, verify OTP to start work, and track weekly earnings/UPI payouts (15% platform commission).
3. **Operations / Admin:** Central dispatch controller & super administrator (`someshnagote14@gmail.com`) monitoring live queues, SLA compliance, partner approvals, manual dispatch overrides, custom scheduled push broadcasts, and audit logs.

## Technology Stack
- **Runtime:** Node.js (v20+) with TypeScript (`tsx`, `esbuild`)
- **Backend Framework:** Express.js (RESTful API architecture)
- **AI & Grounding:** Google GenAI (`@google/genai`, model `gemini-3.5-flash`) with real-time Google Maps Grounding tool
- **Frontend Framework:** React 19, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Database / Authoritative Store:** Authoritative In-Memory Cluster Store with Firestore cloud sync capabilities
- **Authentication:** Google OAuth ID token server-side verification + Role-Based Access Control (RBAC)

## Backend Architecture
- **Layering Pattern:** Routes → Controllers → Services → Repositories → Authoritative Store / Models
- **Middleware:** Centralized Error Handler, Request Logger, Admin RBAC, Token Verifier, Payload Validator
- **Asynchronous Jobs:** Background Notification Scheduler & Queue Worker (5-second polling interval)
- **Observability:** Immutable Audit Log Stream + Analytics Funnel Tracker

## Current Status & Phase
- **Current Phase:** Phase 6 Complete — Production Backend Fully Implemented & Verified
- **Status:** All 30 tests passing, TypeScript clean, ready for deployment
