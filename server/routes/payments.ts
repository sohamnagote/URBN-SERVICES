import { Router } from 'express';
import { backendStore } from '../store';

const router = Router();

// POST /api/payments/initiate - Initiate payment order
router.post('/initiate', (req, res) => {
  const { bookingId, amount, paymentMethod, userId } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ error: 'bookingId and amount are required.' });
  }

  const booking = backendStore.bookings.get(bookingId);
  if (!booking) {
    return res.status(404).json({ error: `Booking ${bookingId} not found.` });
  }

  const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  backendStore.recordAudit({
    actorId: userId || 'customer',
    actorRole: 'customer',
    action: 'PAYMENT_INITIATED',
    resource: 'payment',
    resourceId: transactionId,
    newState: { bookingId, amount, paymentMethod, status: 'Processing' },
    reason: `Initiated ₹${amount} payment via ${paymentMethod}`,
  });

  backendStore.trackAnalytics('payment_started', {
    bookingId,
    amount,
    paymentMethod,
    transactionId,
  }, userId);

  res.json({
    success: true,
    transactionId,
    amount,
    currency: 'INR',
    status: 'Authorized',
    paymentMethod,
    merchantName: 'URBN SERVICES Nashik',
  });
});

// POST /api/payments/confirm - Verify and confirm payment state
router.post('/confirm', (req, res) => {
  const { bookingId, transactionId, paymentMethod, userId } = req.body;

  const booking = backendStore.bookings.get(bookingId);
  if (!booking) {
    return res.status(404).json({ error: `Booking ${bookingId} not found.` });
  }

  booking.paymentStatus = 'Paid';
  booking.paymentMethod = paymentMethod || booking.paymentMethod;
  backendStore.bookings.set(bookingId, booking);

  backendStore.recordAudit({
    actorId: userId || 'system',
    actorRole: 'system',
    action: 'PAYMENT_CONFIRMED',
    resource: 'payment',
    resourceId: transactionId || `txn_${Date.now()}`,
    newState: { bookingId, paymentStatus: 'Paid' },
    reason: `Payment verified & reconciled for booking ${bookingId}`,
  });

  backendStore.trackAnalytics('payment_success', {
    bookingId,
    transactionId,
  }, userId);

  res.json({
    success: true,
    message: 'Payment confirmed & digitized invoice generated.',
    booking,
  });
});

export default router;
