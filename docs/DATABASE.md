# Database Schema & Authoritative Store Specification

## 1. Overview
URBN Services uses an authoritative server-side In-Memory Indexed Store coupled with cloud-synced document models matching `firebase-blueprint.json` and `firestore.rules`.

## 2. Core Entities

### UserProfile (`users/{userId}`)
- `uid` (string, PK): Firebase Auth UID.
- `email` (string, Indexed): Unique user email.
- `displayName` (string): User full name.
- `photoURL` (string, optional): Profile avatar image URL.
- `phone` (string, optional): Contact mobile in Nashik (+91...).
- `role` (enum: `customer` | `provider` | `operations` | `admin`): System access role.
- `createdAt` (ISO date-time): Account registration timestamp.
- `lastLoginAt` (ISO date-time): Most recent authenticated session.

### Address (`addresses/{addressId}`)
- `id` (string, PK): Address UUID (`addr-...`).
- `userId` (string, FK -> UserProfile.uid, Indexed): Owner customer ID.
- `title` (string): Label (e.g., "Home", "Office", "Parents").
- `line1` (string): House/flat number and building name.
- `locality` (string, Indexed): Nashik ward/locality (e.g., "Gangapur Road").
- `city` (string, default: "Nashik"): City name.
- `pincode` (string, Indexed): 6-digit postal code (e.g., "422013").
- `landmark` (string, optional): Nearby reference point.
- `isDefault` (boolean): Default selected address flag.
- `coords` (object, optional: `{ lat: number, lng: number }`): Lat/Long coordinates.

### Booking (`bookings/{bookingId}`)
- `id` (string, PK): Unique human-readable code (`UB-XXXXX`).
- `userId` (string, FK -> UserProfile.uid, Indexed): Customer UID.
- `primaryServiceTitle` (string): Main booked service item.
- `category` (enum, Indexed: `plumbing`, `electrical`, `cleaning`, `appliance`, `ac`, `carpenter`, `painting`, `pest_control`, `maintenance`).
- `items` (array): List of `{ service: ServiceItem, quantity: number }`.
- `address` (object): Snapshot of selected customer Address.
- `date` (string): Scheduled service date / slot.
- `timeSlot` (string): Selected window (e.g., "Instant 1-Day Dispatch").
- `status` (enum, Indexed: `Requested`, `Confirmed`, `Assigned`, `On the Way`, `Arrived`, `Started`, `Completed`, `Cancelled`, `Disputed`).
- `statusHistory` (array): Sequential audit steps with timestamp & descriptions.
- `provider` (object, optional): Assigned Provider profile snapshot.
- `bill` (object): Authoritative bill breakdown `{ serviceVisitCharge, estimatedLabor, platformDiscount, taxesAndFee, total }`.
- `paymentMethod` (enum: `UPI`, `Card`, `Cash on Service`, `NetBanking`).
- `paymentStatus` (enum: `Pending`, `Paid`, `Refunded`).
- `createdAt` (ISO date-time, Indexed): Order placement timestamp.
- `promiseDeadline` (string): Dynamic 24-hour SLA promise target timestamp.
- `otp` (string): 4-digit numeric verification code for on-site start.
- `userRating` (number, optional): Rating score (1-5).
- `userReview` (string, optional): Feedback comments.

### ProviderRecord (`providers/{providerId}`)
- `id` (string, PK): Provider ID (`prov-...`).
- `userId` (string, FK -> UserProfile.uid, Indexed): Linked user auth UID.
- `email` (string, Indexed): Provider contact email.
- `name` (string): Pro full name.
- `profession` (string): Trade title (e.g., "Master Plumbing Specialist").
- `rating` (number): Aggregate star rating.
- `reviewsCount` (number): Number of verified customer reviews.
- `phone` (string): Direct mobile contact.
- `verified` (boolean): KYC & background check flag.
- `verificationStatus` (enum, Indexed: `Pending`, `Under Review`, `Approved`, `Rejected`, `Suspended`).
- `isOnline` (boolean, Indexed): Real-time on-duty status toggle.
- `categories` (array of CategoryId): Qualified trade trades.
- `serviceAreas` (array of string): Nashik localities covered.
- `totalJobsCompleted` (number): Lifetime completed orders count.
- `grossEarnings` (number): Cumulative gross revenue in INR.
- `platformCommission` (number): 15% platform retention in INR.
- `netEarnings` (number): Payable provider balance in INR.
- `payoutStatus` (enum: `Pending`, `Processed`).

### PushNotificationJob (`notificationJobs/{jobId}`)
- `id` (string, PK): Job ID (`job-...`).
- `title` (string): Broadcast headline.
- `message` (string): Notification message body.
- `category` (enum: `Booking`, `Provider Update`, `Promotion`, `Service Reminder`, `System`).
- `audience` (object): Targeting rule `{ type: 'all_users' | 'customers' | 'providers' | 'service_areas' | 'active_bookings' }`.
- `deliveryType` (enum: `send_now` | `scheduled`).
- `scheduledFor` (ISO date-time, optional, Indexed): Future dispatch timestamp.
- `status` (enum, Indexed: `Draft`, `Scheduled`, `Processing`, `Sending`, `Sent`, `Partially Sent`, `Failed`, `Cancelled`).
- `stats` (object): Delivery telemetry `{ targetUserCount, activeDeviceCount, deliveredCount, failedCount, invalidTokensCount }`.
- `createdAt` (ISO date-time): Job creation time.

### AuditLogRecord (`auditLogs/{auditId}`)
- `id` (string, PK): Audit ID (`audit-...`).
- `actorId` (string, Indexed): Identity making the change.
- `actorRole` (enum: `customer`, `provider`, `operations`, `admin`, `system`).
- `action` (string, Indexed): E.g., `BOOKING_CREATED`, `ADMIN_BOOKING_REASSIGNMENT`, `PROVIDER_DUTY_TOGGLE`.
- `resource` (string, Indexed): `booking`, `provider`, `payment`, `push_notification_job`.
- `resourceId` (string, Indexed): Target entity primary key.
- `previousState` (object, optional): Pre-mutation state snapshot.
- `newState` (object, optional): Post-mutation state snapshot.
- `reason` (string, optional): Human or operational justification.
- `timestamp` (ISO date-time, Indexed): Immutable event time.

## 3. Indexing & Access Patterns
- `bookings`: Filter by `userId + createdAt DESC`, filter by `provider.id + status`, filter by `status + category`.
- `providers`: Filter by `verificationStatus = 'Approved' + isOnline = true + categories`.
- `notificationJobs`: Query `status = 'Scheduled' + scheduledFor <= now()`.
- `auditLogs`: Sorted descending by `timestamp` for live operational timeline.
