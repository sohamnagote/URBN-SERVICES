# Business Rules Specification

This document enumerates the core domain business invariants enforced by the URBN Services backend.

---

### BR-001: 1-Day Promise SLA Guarantee
- Every booking in a serviceable Nashik locality must receive a fixed 24-hour completion guarantee (`promiseDeadline`).
- If an order is not completed within 24 hours, it triggers high-priority operational notifications for manual escalation.

### BR-002: Service Pricing & Fee Structure
- Standard Visit Charge: Flat ₹49 for all household service bookings.
- Platform Discount: Automatically computed as 10% of estimated labor, capped at a maximum of ₹100.
- Taxes & Fees: Flat 5% applied to `(Subtotal + Visit Charge - Platform Discount)`.
- Client-submitted prices or totals are strictly ignored in favor of server calculation.

### BR-003: Platform Commission Rate
- The platform retains a fixed 15% commission on all completed job values (`grossEarnings * 0.15`).
- The remaining 85% is credited to the technician's `netEarnings` and is eligible for instant UPI payout.

### BR-004: Booking State Transition Constraints
- State transitions must strictly adhere to the following directed acyclic graph:
  - `Requested` → `Confirmed`, `Assigned`, `Cancelled`
  - `Confirmed` → `Assigned`, `Cancelled`
  - `Assigned` → `On the Way`, `Cancelled`, `Disputed`
  - `On the Way` → `Arrived`, `Started`, `Cancelled`, `Disputed`
  - `Arrived` → `Started`, `Cancelled`, `Disputed`
  - `Started` → `Completed`, `Disputed`
  - `Completed` → `Disputed`
  - `Cancelled` → No further transitions allowed
  - `Disputed` → `Completed`, `Cancelled`

### BR-005: On-Site Doorstep OTP Verification
- A technician cannot transition a job to `Started` without verifying the customer's 4-digit OTP.
- Universal test fallback code `4829` is permitted in development environments.

### BR-006: Provider Assignment & Locality Preference
- Only providers with `verificationStatus === 'Approved'` and `isOnline === true` qualified in the booking's category are eligible for automated dispatch.
- When multiple pros qualify, the engine prioritizes the provider whose `serviceAreas` matches the customer's locality.

### BR-007: Cancellation & Automatic Refund Handling
- Customers and Operations can cancel bookings that have not reached `Completed`.
- If payment was already made (`Paid`), status automatically transitions to `Refunded`.
- Completed services cannot be cancelled; a `Disputed` support ticket must be filed instead.

### BR-008: Super Administrator Privileges
- Email `someshnagote14@gmail.com` possesses authoritative super administrator status.
- Only administrators can access `/api/admin/*`, approve/reject partner applications, override technician assignments, and broadcast push notifications.

### BR-009: Scheduled Notification Validity
- A notification job configured as `scheduled` must have a valid `scheduledFor` timestamp strictly in the future.
- Scheduled notifications can only be cancelled while in `Scheduled` status before execution.

### BR-010: Notification Opt-Out Enforcement
- If a customer has opted out of promotional notifications (`promotionsAndOffers: false`), the audience resolution engine automatically excludes their devices from `Promotion` category broadcasts.
