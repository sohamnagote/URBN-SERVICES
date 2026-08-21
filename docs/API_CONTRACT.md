# API Contract Specification

This document details the complete REST API contract between the frontend client and the backend server.

---

## 1. System & Health APIs

### `GET /api/health`
- **Auth:** Public
- **Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-08-21T11:21:40.000Z"
}
```

---

## 2. Authentication & Identity

### `POST /api/auth/google`
- **Auth:** Public (Verifies Google ID Token)
- **Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Google identity securely verified.",
  "user": {
    "uid": "1140928374921",
    "email": "customer@gmail.com",
    "displayName": "Rohit Deshmukh",
    "photoURL": "https://...",
    "role": "customer",
    "emailVerified": true,
    "authProvider": "google.com",
    "lastLoginAt": "2026-08-21T11:21:40.000Z"
  }
}
```
- **Errors:** `400 Bad Request` (missing idToken), `401 Unauthorized` (expired or invalid token).

---

## 3. Serviceability & 1-Day Promise SLA

### `GET /api/serviceability/areas`
- **Auth:** Public
- **Response (200 OK):**
```json
{
  "city": "Nashik",
  "state": "Maharashtra",
  "country": "India",
  "areas": [
    {
      "id": "nashik-gangapur",
      "locality": "Gangapur Road",
      "pincode": "422013",
      "hubName": "Gangapur Central Hub",
      "isServiceable": true,
      "promiseEligible": true,
      "avgEtaMinutes": 12,
      "activeProsCount": 14,
      "coords": { "lat": 20.015, "lng": 73.762 }
    }
  ],
  "activePromiseGuarantee": true,
  "maxSlaHours": 24
}
```

### `POST /api/serviceability/check`
- **Auth:** Public
- **Request Body:**
```json
{
  "locality": "Gangapur Road",
  "pincode": "422013",
  "categoryId": "plumbing"
}
```
- **Response (200 OK):**
```json
{
  "serviceable": true,
  "area": { "locality": "Gangapur Road", "pincode": "422013" },
  "promiseEligible": true,
  "slaHours": 24,
  "promiseDeadlineTimestamp": "2026-08-22T11:21:40.000Z",
  "promiseMessage": "Guaranteed on-site completion or full service recovery credit within 24 hours under the URBN 1-Day Promise.",
  "estimatedEtaMinutes": 12,
  "availableProsCount": 14
}
```

---

## 4. Bookings Lifecycle

### `GET /api/bookings`
- **Auth:** Public / Filter by query params (`userId`, `providerId`, `status`)
- **Query Params:** `userId` (optional), `providerId` (optional), `status` (optional)
- **Response (200 OK):**
```json
{
  "count": 1,
  "bookings": [ { "id": "UB-48291", "status": "On the Way", ... } ]
}
```

### `GET /api/bookings/:id`
- **Auth:** Public
- **Response (200 OK):** Single Booking Object. `404 Not Found` if missing.

### `POST /api/bookings`
- **Auth:** Public / Customer Session
- **Request Body:**
```json
{
  "userId": "user-123",
  "items": [
    {
      "service": { "id": "srv-1", "title": "Tap Leakage Repair", "price": 199, "categoryId": "plumbing" },
      "quantity": 1
    }
  ],
  "address": {
    "line1": "Flat 402, Green Acre",
    "locality": "Gangapur Road",
    "city": "Nashik",
    "pincode": "422013"
  },
  "date": "Today, Express Slot",
  "timeSlot": "Instant 1-Day Dispatch",
  "paymentMethod": "Cash on Service",
  "customNotes": "Bell is broken"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created and professional dispatched successfully.",
  "booking": {
    "id": "UB-91823",
    "status": "On the Way",
    "otp": "4829",
    "bill": { "serviceVisitCharge": 49, "estimatedLabor": 199, "platformDiscount": 19, "taxesAndFee": 11, "total": 240 },
    "promiseDeadline": "Guaranteed resolution by 22 Aug, 11:21 AM (1-Day Promise)"
  }
}
```

### `PATCH /api/bookings/:id/status`
- **Auth:** Authenticated Actor (Provider, Ops, Admin)
- **Request Body:**
```json
{
  "status": "Completed",
  "actorId": "prov-123",
  "actorRole": "provider",
  "reason": "Completed pipe replacement"
}
```
- **Response (200 OK):** `{ "success": true, "message": "Booking status updated to Completed", "booking": { ... } }`

### `POST /api/bookings/:id/verify-otp`
- **Auth:** Provider on site
- **Request Body:** `{ "otp": "4829", "providerId": "prov-123" }`
- **Response (200 OK):** `{ "success": true, "message": "OTP verified. Service started.", "booking": { ... } }`

### `POST /api/bookings/:id/cancel`
- **Auth:** Customer / Ops
- **Request Body:** `{ "actorId": "user-123", "actorRole": "customer", "reason": "Change of plans" }`
- **Response (200 OK):** `{ "success": true, "message": "Booking cancelled successfully.", "booking": { ... } }`

---

## 5. Providers & Partner Operations

### `GET /api/providers`
- **Query Params:** `category`, `locality`, `onlineOnly`
- **Response (200 OK):** `{ "count": 10, "providers": [ ... ] }`

### `GET /api/providers/:id`
- **Response (200 OK):** `{ "provider": { ... }, "metrics": { "grossEarnings": 4200, "platformCommission": 630, "netEarnings": 3570, "payoutStatus": "Processed" }, "activeJobs": [ ... ] }`

### `PATCH /api/providers/:id/duty`
- **Request Body:** `{ "isOnline": true }`
- **Response (200 OK):** `{ "success": true, "message": "Duty status updated to Online", "provider": { ... } }`

### `POST /api/providers/:id/payout`
- **Response (200 OK):** `{ "success": true, "payoutAmount": 3570, "payoutStatus": "Processed" }`

### `POST /api/providers/apply`
- **Request Body:**
```json
{
  "userId": "user-456",
  "applicantName": "Kailas Patil",
  "email": "kailas@gmail.com",
  "phone": "+91 98220 12345",
  "experienceYears": 6,
  "primaryCategory": "plumbing",
  "offeredCategories": ["plumbing", "maintenance"],
  "serviceAreas": ["Gangapur Road", "College Road"],
  "vehicleType": "Two Wheeler",
  "vehicleNumber": "MH 15 AB 1234"
}
```
- **Response (201 Created):** `{ "success": true, "application": { "id": "app-123", "status": "Under Review" } }`

---

## 6. Admin Command Center APIs

### `GET /api/admin/overview`
- **Headers:** `x-admin-email: someshnagote14@gmail.com`
- **Response (200 OK):**
```json
{
  "metrics": {
    "totalBookings": 42,
    "activeJobsCount": 3,
    "completedJobsCount": 38,
    "grossBookingValue": "₹19,450",
    "platformRevenue": "₹2,917",
    "slaAdherenceRate": "98.5%",
    "activeNashikHubs": 7
  },
  "liveDispatchQueue": [ ... ],
  "recentAuditLogs": [ ... ]
}
```

### `PATCH /api/admin/bookings/:id/reassign`
- **Headers:** `x-admin-email: someshnagote14@gmail.com`
- **Request Body:** `{ "newProviderId": "prov-456", "reason": "Pro closer to Indira Nagar" }`
- **Response (200 OK):** `{ "success": true, "message": "Booking reassigned to Rahul More", "booking": { ... } }`

---

## 7. Push Notifications & Jobs

### `POST /api/notifications/devices/register`
- **Request Body:** `{ "userId": "user-123", "userRole": "customer", "pushToken": "fcm_token_...", "platform": "web" }`
- **Response (200 OK):** `{ "success": true, "device": { ... } }`

### `GET /api/notifications/user`
- **Headers/Query:** `userId` or `x-user-id`
- **Response (200 OK):** `{ "success": true, "notifications": [ ... ], "unreadCount": 2 }`

### `POST /api/notifications/admin/jobs`
- **Headers:** `x-admin-email: someshnagote14@gmail.com`
- **Request Body:**
```json
{
  "title": "Monsoon Plumbing Check",
  "message": "Get 20% off all drainage inspections this week.",
  "category": "Promotion",
  "deliveryType": "send_now",
  "audience": { "type": "customers" }
}
```
- **Response (200 OK):** `{ "success": true, "job": { "id": "job-123", "status": "Sent", "stats": { "deliveredCount": 15 } } }`

---

## 8. AI Grounding & Route Assistance

### `POST /api/maps/grounding`
- **Request Body:** `{ "prompt": "Where can I buy heavy-duty CPVC pipe fittings near Gangapur Road?", "locality": "Gangapur Road" }`
- **Response (200 OK):** `{ "text": "...", "groundingMetadata": { ... }, "locality": "Gangapur Road" }`

### `POST /api/maps/route-advisor`
- **Request Body:** `{ "originLocality": "Gangapur Road Hub", "destinationLocality": "Indira Nagar", "serviceType": "Plumbing" }`
- **Response (200 OK):** `{ "routeSummary": "...", "groundingMetadata": { ... } }`
