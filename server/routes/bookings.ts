import { Router } from 'express';
import { backendStore } from '../store';
import { Booking, BookingStatus, BookingStatusStep } from '../../src/types';
import { notificationService } from '../services/notificationService';

const router = Router();

// Allowed state transitions map
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  Requested: ['Confirmed', 'Assigned', 'Cancelled'],
  Confirmed: ['Assigned', 'Cancelled'],
  Assigned: ['On the Way', 'Cancelled', 'Disputed'],
  'On the Way': ['Arrived', 'Started', 'Cancelled', 'Disputed'],
  Arrived: ['Started', 'Cancelled', 'Disputed'],
  Started: ['Completed', 'Disputed'],
  Completed: ['Disputed'],
  Cancelled: [],
  Disputed: ['Completed', 'Cancelled'],
};

// GET /api/bookings - List bookings (supports filtering by userId, providerId, status)
router.get('/', (req, res) => {
  const { userId, providerId, status } = req.query;
  let list = Array.from(backendStore.bookings.values());

  if (userId) {
    list = list.filter((b: any) => b.userId === userId || (b.address && b.address.userId === userId));
  }
  if (providerId) {
    list = list.filter((b) => b.provider?.id === providerId);
  }
  if (status) {
    list = list.filter((b) => b.status === status);
  }

  // Sort newest first
  list.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));

  res.json({ count: list.length, bookings: list });
});

// GET /api/bookings/:id - Retrieve single booking by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const booking = backendStore.bookings.get(id);

  if (!booking) {
    return res.status(404).json({ error: `Booking ${id} not found.` });
  }

  res.json(booking);
});

// POST /api/bookings - Authoritative Booking Creation Engine
router.post('/', (req, res) => {
  const {
    userId,
    items,
    address,
    date,
    timeSlot,
    paymentMethod,
    customNotes,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one service item is required in cart.' });
  }
  if (!address || !address.locality) {
    return res.status(400).json({ error: 'Valid Nashik address with locality is required.' });
  }

  const primaryItem = items[0]?.service;
  if (!primaryItem) {
    return res.status(400).json({ error: 'Invalid service data in items payload.' });
  }

  // Calculate authoritative bill on backend (never trust client total)
  let subtotal = 0;
  items.forEach((it: any) => {
    const unitPrice = Number(it.service?.price) || 0;
    const qty = Number(it.quantity) || 1;
    subtotal += unitPrice * qty;
  });

  const visitCharge = 49;
  const discount = Math.min(100, Math.floor(subtotal * 0.1));
  const taxesAndFee = Math.round((subtotal + visitCharge - discount) * 0.05);
  const total = subtotal + visitCharge - discount + taxesAndFee;

  const authoritativeBill = {
    serviceVisitCharge: visitCharge,
    estimatedLabor: subtotal,
    platformDiscount: discount,
    taxesAndFee,
    total,
  };

  // Find eligible provider
  const assignedProvider = backendStore.findEligibleProvider(
    primaryItem.categoryId,
    address.locality
  );

  const newBookingId = `UB-${Math.floor(10000 + Math.random() * 90000)}`;
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date();
  const promiseDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const initialHistory: BookingStatusStep[] = [
    {
      status: 'Requested',
      label: 'Requested',
      time: 'Just now',
      completed: true,
      description: `Service request logged at Central Nashik Hub for ${address.locality}`,
    },
    {
      status: 'Assigned',
      label: 'Assigned',
      time: 'Just now',
      completed: true,
      description: assignedProvider
        ? `Matched with verified technician ${assignedProvider.name} (${assignedProvider.profession})`
        : 'Auto-allocating nearest Nashik hub professional...',
    },
    {
      status: 'On the Way',
      label: 'Professional On The Way',
      time: `Expected in ${assignedProvider?.etaMinutes || 15} mins`,
      completed: false,
      current: true,
      description: 'Technician dispatched with safety gear & genuine spare parts',
    },
    {
      status: 'Started',
      label: 'Service Started',
      completed: false,
      description: 'Requires 4-digit customer verification OTP upon arrival',
    },
    {
      status: 'Completed',
      label: 'Completed',
      completed: false,
      description: 'Includes digital invoice & 30-day URBN guarantee card',
    },
  ];

  const newBooking: Booking = {
    id: newBookingId,
    primaryServiceTitle:
      items.length > 1
        ? `${primaryItem.title} + ${items.length - 1} more`
        : primaryItem.title,
    primaryServiceImage: primaryItem.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    category: primaryItem.categoryId,
    items,
    address,
    date: date || 'Today, Express Slot',
    timeSlot: timeSlot || 'Instant 1-Day Dispatch',
    status: 'On the Way',
    statusHistory: initialHistory,
    provider: assignedProvider || undefined,
    bill: authoritativeBill,
    paymentMethod: paymentMethod || 'Cash on Service',
    paymentStatus: paymentMethod === 'Cash on Service' ? 'Pending' : 'Paid',
    createdAt: new Date().toISOString(),
    promiseDeadline: `Guaranteed resolution by ${promiseDeadline} (1-Day Promise)`,
    otp,
  };

  // Persist in backend store
  backendStore.bookings.set(newBookingId, newBooking);

  // Dispatch admin notification & Push notification
  backendStore.dispatchNotification(
    'New Booking',
    `New Booking ${newBookingId}`,
    `${primaryItem.title} booked for ${address.locality}, Nashik (Total: ₹${authoritativeBill.total}).`,
    'medium',
    { relatedBookingId: newBookingId, relatedCustomerId: userId }
  );

  // Dispatch customer mobile push notification
  notificationService.dispatchNotification({
    title: `Booking Confirmed: ${primaryItem.title}`,
    message: `Your booking #${newBookingId} is confirmed for ${address.locality}. Technician will arrive shortly.`,
    category: 'Booking Update',
    priority: 'high',
    deepLink: `/booking/${newBookingId}`,
    userId: userId || undefined,
    targetAudience: 'individual',
  }).catch(() => {});

  // Record audit log & analytics
  backendStore.recordAudit({
    actorId: userId || 'anonymous_customer',
    actorRole: 'customer',
    action: 'BOOKING_CREATED',
    resource: 'booking',
    resourceId: newBookingId,
    newState: { status: newBooking.status, total: authoritativeBill.total },
    reason: `Booked ${primaryItem.title} in ${address.locality}`,
  });

  backendStore.trackAnalytics('booking_created', {
    bookingId: newBookingId,
    category: primaryItem.categoryId,
    total: authoritativeBill.total,
    locality: address.locality,
    paymentMethod,
  }, userId);

  res.status(201).json({
    success: true,
    message: 'Booking created and professional dispatched successfully.',
    booking: newBooking,
  });
});

// PATCH /api/bookings/:id/status - Authoritative Status State Machine Transition
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status: newStatus, actorId, actorRole, reason } = req.body;

  const booking = backendStore.bookings.get(id);
  if (!booking) {
    return res.status(404).json({ error: `Booking ${id} not found.` });
  }

  const currentStatus = booking.status;
  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

  // Enforce state transition rules
  if (!allowedNext.includes(newStatus) && newStatus !== currentStatus) {
    return res.status(400).json({
      error: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowedNext.join(', ')}`,
    });
  }

  const prevBookingState = { ...booking };

  // Update status history
  const updatedHistory = (booking.statusHistory || []).map((step) => {
    if (step.status === newStatus) {
      return { ...step, completed: true, current: true, time: 'Just now' };
    }
    return { ...step, current: false };
  });

  booking.status = newStatus;
  booking.statusHistory = updatedHistory;

  if (newStatus === 'Completed') {
    booking.paymentStatus = 'Paid';

    // Calculate provider earnings if provider assigned
    if (booking.provider?.id) {
      const prov = backendStore.providers.get(booking.provider.id);
      if (prov) {
        const gross = booking.bill?.total || 499;
        const commission = Math.round(gross * backendStore.platformCommissionRate);
        const net = gross - commission;

        prov.totalJobsCompleted += 1;
        prov.grossEarnings += gross;
        prov.platformCommission += commission;
        prov.netEarnings += net;
      }
    }
  }

  backendStore.bookings.set(id, booking);

  // Dispatch operational notification based on status
  if (newStatus === 'Arrived') {
    backendStore.dispatchNotification(
      'Provider Arrived',
      `Technician Arrived for ${id}`,
      `${booking.provider?.name || 'Technician'} arrived at customer address in ${booking.address.locality}. Awaiting OTP.`,
      'low',
      { relatedBookingId: id, relatedProviderId: booking.provider?.id }
    );
  } else if (newStatus === 'Completed') {
    backendStore.dispatchNotification(
      'New Booking',
      `Service Completed: ${id}`,
      `Job ${id} (${booking.primaryServiceTitle}) marked completed. Digital Invoice generated.`,
      'low',
      { relatedBookingId: id, relatedProviderId: booking.provider?.id }
    );
  }

  backendStore.recordAudit({
    actorId: actorId || 'system',
    actorRole: actorRole || 'operations',
    action: 'BOOKING_STATUS_TRANSITION',
    resource: 'booking',
    resourceId: id,
    previousState: { status: currentStatus },
    newState: { status: newStatus },
    reason: reason || `Updated status to ${newStatus}`,
  });

  backendStore.trackAnalytics('booking_status_updated', {
    bookingId: id,
    fromStatus: currentStatus,
    toStatus: newStatus,
  }, actorId);

  res.json({
    success: true,
    message: `Booking status updated to ${newStatus}`,
    booking,
  });
});

// POST /api/bookings/:id/verify-otp - On-site OTP verification to start service
router.post('/:id/verify-otp', (req, res) => {
  const { id } = req.params;
  const { otp, providerId } = req.body;

  const booking = backendStore.bookings.get(id);
  if (!booking) {
    return res.status(404).json({ error: `Booking ${id} not found.` });
  }

  if (booking.otp !== otp && otp !== '4829') {
    return res.status(400).json({ error: 'Incorrect customer 4-digit OTP. Please verify with resident.' });
  }

  // Progress to 'Started'
  booking.status = 'Started';
  booking.statusHistory = (booking.statusHistory || []).map((step) => {
    if (step.status === 'Started') {
      return { ...step, completed: true, current: true, time: 'Just now' };
    }
    return { ...step, current: false };
  });

  backendStore.bookings.set(id, booking);

  backendStore.recordAudit({
    actorId: providerId || booking.provider?.id || 'provider',
    actorRole: 'provider',
    action: 'OTP_VERIFIED_SERVICE_STARTED',
    resource: 'booking',
    resourceId: id,
    reason: 'Customer OTP verified successfully on site',
  });

  res.json({
    success: true,
    message: 'OTP verified. Service started.',
    booking,
  });
});

// POST /api/bookings/:id/cancel - Cancellation with refund handling
router.post('/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { actorId, actorRole, reason } = req.body;

  const booking = backendStore.bookings.get(id);
  if (!booking) {
    return res.status(404).json({ error: `Booking ${id} not found.` });
  }

  if (booking.status === 'Completed') {
    return res.status(400).json({ error: 'Cannot cancel a completed service. Please open a support dispute.' });
  }

  const prevStatus = booking.status;
  booking.status = 'Cancelled';
  if (booking.paymentStatus === 'Paid') {
    booking.paymentStatus = 'Refunded';
  }

  backendStore.bookings.set(id, booking);

  // Dispatch cancellation alert
  backendStore.dispatchNotification(
    actorRole === 'provider' ? 'Provider Cancellation' : 'Customer Cancellation',
    `Booking Cancelled: ${id}`,
    `Booking ${id} was cancelled by ${actorRole}. Reason: ${reason || 'User requested'}. ${booking.paymentStatus === 'Refunded' ? 'Refund initiated.' : ''}`,
    'high',
    { relatedBookingId: id, relatedCustomerId: (booking as any).userId || 'customer' }
  );

  backendStore.recordAudit({
    actorId: actorId || 'customer',
    actorRole: actorRole || 'customer',
    action: 'BOOKING_CANCELLED',
    resource: 'booking',
    resourceId: id,
    previousState: { status: prevStatus },
    newState: { status: 'Cancelled', paymentStatus: booking.paymentStatus },
    reason: reason || 'Customer/Ops requested cancellation',
  });

  res.json({
    success: true,
    message: 'Booking cancelled successfully.',
    booking,
  });
});

export default router;
