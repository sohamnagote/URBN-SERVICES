import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../../app';

describe('Integration Test: Bookings Lifecycle API', () => {
  let server: http.Server;
  let baseUrl: string;
  let createdBookingId: string;
  let bookingOtp: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('POST /api/bookings creates booking with server-calculated bill and OTP', async () => {
    const res = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'integration-user-1',
        items: [
          { service: { id: 's-pipe', title: 'Tap Leakage', price: 299, categoryId: 'plumbing' }, quantity: 1 },
        ],
        address: {
          line1: 'B-201, Shanti Enclave',
          locality: 'Gangapur Road',
          city: 'Nashik',
          pincode: '422013',
        },
        paymentMethod: 'Cash on Service',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.booking);
    assert.ok(data.booking.id);
    assert.equal(data.booking.status, 'On the Way');
    assert.ok(data.booking.otp);
    assert.equal(data.booking.bill.serviceVisitCharge, 49);

    createdBookingId = data.booking.id;
    bookingOtp = data.booking.otp;
  });

  it('GET /api/bookings lists the created booking', async () => {
    const res = await fetch(`${baseUrl}/api/bookings?userId=integration-user-1`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.ok(data.count >= 1);
    assert.ok(data.bookings.some((b: any) => b.id === createdBookingId));
  });

  it('GET /api/bookings/:id retrieves single booking', async () => {
    const res = await fetch(`${baseUrl}/api/bookings/${createdBookingId}`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.id, createdBookingId);
  });

  it('POST /api/bookings/:id/verify-otp verifies OTP and transitions to Started', async () => {
    // Incorrect OTP
    const badRes = await fetch(`${baseUrl}/api/bookings/${createdBookingId}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: '0000' }),
    });
    assert.equal(badRes.status, 500);

    // Correct OTP
    const goodRes = await fetch(`${baseUrl}/api/bookings/${createdBookingId}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: bookingOtp }),
    });
    assert.equal(goodRes.status, 200);

    const data = await goodRes.json();
    assert.equal(data.success, true);
    assert.equal(data.booking.status, 'Started');
  });

  it('PATCH /api/bookings/:id/status updates status to Completed', async () => {
    const res = await fetch(`${baseUrl}/api/bookings/${createdBookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Completed',
        actorId: 'ops-admin',
        actorRole: 'operations',
        reason: 'Service successfully finished',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.booking.status, 'Completed');
    assert.equal(data.booking.paymentStatus, 'Paid');
  });
});
