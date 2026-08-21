# Input Validation Specification

This document defines validation constraints for all untrusted input received by the URBN Services backend.

---

## 1. Booking Creation (`POST /api/bookings`)
- `items`: Required, non-empty array (`minItems: 1`). Each element must contain `service.id`, `service.title`, `service.price > 0`, and `service.categoryId`.
- `address`: Required object containing:
  - `locality`: Required string (`minLength: 2`, must be a recognizable Nashik area).
  - `pincode`: Optional 6-digit numeric string (`^[1-9][0-9]{5}$`).
- `date`: String, defaults to `"Today, Express Slot"`.
- `timeSlot`: String, defaults to `"Instant 1-Day Dispatch"`.
- `paymentMethod`: Enum (`UPI` | `Card` | `Cash on Service` | `NetBanking`).

---

## 2. Booking Status Transition (`PATCH /api/bookings/:id/status`)
- `status`: Required enum matching `BookingStatus` (`Requested` | `Confirmed` | `Assigned` | `On the Way` | `Arrived` | `Started` | `Completed` | `Cancelled` | `Disputed`).
- Must satisfy the state machine transition rule matrix for the current booking status.

---

## 3. OTP Verification (`POST /api/bookings/:id/verify-otp`)
- `otp`: Required 4-digit string (`^[0-9]{4}$`).

---

## 4. Provider Partner Application (`POST /api/providers/apply`)
- `applicantName`: Required string (`minLength: 2`, `maxLength: 100`).
- `phone`: Required string with valid Indian mobile pattern (`^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$`).
- `primaryCategory`: Required valid `CategoryId`.
- `experienceYears`: Number (`min: 0`, `max: 50`).
- `serviceAreas`: Non-empty array of strings.

---

## 5. Push Notification Creation (`POST /api/notifications/admin/jobs`)
- `title`: Required non-empty string (`minLength: 3`, `maxLength: 120`).
- `message`: Required non-empty string (`minLength: 5`, `maxLength: 500`).
- `category`: Required enum (`Booking` | `Provider Update` | `Promotion` | `Service Reminder` | `System`).
- `deliveryType`: Enum (`send_now` | `scheduled`).
- `scheduledFor`: Required if `deliveryType === 'scheduled'`; must parse to a valid future timestamp (`> Date.now()`).
- `audience`: Valid `AudienceCriteria` object.

---

## 6. Reviews Submission (`POST /api/reviews`)
- `rating`: Required number between 1 and 5.
- `comment`: Required string (`minLength: 3`, `maxLength: 1000`).
- `serviceTitle`: Optional string.
- `authorName`: Optional string.
