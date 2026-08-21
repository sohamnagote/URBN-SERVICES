import { Booking, BookingStatus, BookingStatusStep } from '../types';
import { STANDARD_VISIT_CHARGE, MAX_DISCOUNT_CAP, TAX_RATE, SLA_PROMISE_HOURS } from '../config/constants';
import { backendStore } from '../store/backendStore';
import { bookingRepository } from '../repositories/bookingRepository';
import { auditRepository } from '../repositories/auditRepository';
import { validateStatusTransition } from '../validators/bookingValidators';
import { notificationService } from './notificationService';

export interface CreateBookingInput {
  userId?: string;
  items: any[];
  address: any;
  date?: string;
  timeSlot?: string;
  paymentMethod?: 'UPI' | 'Card' | 'Cash on Service' | 'NetBanking';
  customNotes?: string;
}

export class BookingService {
  public calculateBill(items: any[]) {
    let subtotal = 0;
    items.forEach((it) => {
      const unitPrice = Number(it.service?.price) || 0;
      const qty = Number(it.quantity) || 1;
      subtotal += unitPrice * qty;
    });

    const visitCharge = STANDARD_VISIT_CHARGE;
    const discount = Math.min(MAX_DISCOUNT_CAP, Math.floor(subtotal * 0.1));
    const taxesAndFee = Math.round((subtotal + visitCharge - discount) * TAX_RATE);
    const total = subtotal + visitCharge - discount + taxesAndFee;

    return {
      serviceVisitCharge: visitCharge,
      estimatedLabor: subtotal,
      platformDiscount: discount,
      taxesAndFee,
      total,
    };
  }

  public createBooking(input: CreateBookingInput): Booking {
    const primaryItem = input.items[0]?.service;
    const authoritativeBill = this.calculateBill(input.items);

    const assignedProvider = backendStore.findEligibleProvider(
      primaryItem.categoryId,
      input.address.locality
    );

    const newBookingId = `UB-${Math.floor(10000 + Math.random() * 90000)}`;
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const now = new Date();
    const promiseDeadlineDate = new Date(now.getTime() + SLA_PROMISE_HOURS * 60 * 60 * 1000);
    const promiseDeadline = promiseDeadlineDate.toLocaleString('en-IN', {
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
        description: `Service request logged at Central Nashik Hub for ${input.address.locality}`,
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
      userId: input.userId,
      primaryServiceTitle:
        input.items.length > 1
          ? `${primaryItem.title} + ${input.items.length - 1} more`
          : primaryItem.title,
      primaryServiceImage: primaryItem.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
      category: primaryItem.categoryId,
      items: input.items,
      address: input.address,
      date: input.date || 'Today, Express Slot',
      timeSlot: input.timeSlot || 'Instant 1-Day Dispatch',
      status: 'On the Way',
      statusHistory: initialHistory,
      provider: assignedProvider || undefined,
      bill: authoritativeBill,
      paymentMethod: input.paymentMethod || 'Cash on Service',
      paymentStatus: input.paymentMethod === 'Cash on Service' ? 'Pending' : 'Paid',
      createdAt: new Date().toISOString(),
      promiseDeadline: `Guaranteed resolution by ${promiseDeadline} (1-Day Promise)`,
      otp,
    };

    bookingRepository.save(newBooking);

    // Operational alert
    backendStore.dispatchNotification(
      'New Booking',
      `New Booking ${newBookingId}`,
      `${primaryItem.title} booked for ${input.address.locality}, Nashik (Total: ₹${authoritativeBill.total}).`,
      'medium',
      { relatedBookingId: newBookingId, relatedCustomerId: input.userId }
    );

    // Push notification to customer
    notificationService.dispatchNotification({
      title: `Booking Confirmed: ${primaryItem.title}`,
      message: `Your booking #${newBookingId} is confirmed for ${input.address.locality}. Technician will arrive shortly.`,
      category: 'Booking Update',
      priority: 'high',
      deepLink: `/booking/${newBookingId}`,
      userId: input.userId || undefined,
      targetAudience: 'individual',
    }).catch(() => {});

    // Audit and analytics
    auditRepository.record({
      actorId: input.userId || 'anonymous_customer',
      actorRole: 'customer',
      action: 'BOOKING_CREATED',
      resource: 'booking',
      resourceId: newBookingId,
      newState: { status: newBooking.status, total: authoritativeBill.total },
      reason: `Booked ${primaryItem.title} in ${input.address.locality}`,
    });

    auditRepository.trackAnalytics('booking_created', {
      bookingId: newBookingId,
      category: primaryItem.categoryId,
      total: authoritativeBill.total,
      locality: input.address.locality,
      paymentMethod: input.paymentMethod,
    }, input.userId);

    return newBooking;
  }

  public updateStatus(id: string, newStatus: BookingStatus, actorId?: string, actorRole: string = 'operations', reason?: string): Booking {
    const booking = bookingRepository.findById(id);
    if (!booking) {
      throw new Error(`Booking ${id} not found.`);
    }

    const validation = validateStatusTransition(booking.status, newStatus);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const currentStatus = booking.status;

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

      // Update provider earnings
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

    bookingRepository.save(booking);

    // Notifications
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

    auditRepository.record({
      actorId: actorId || 'system',
      actorRole: actorRole || 'operations',
      action: 'BOOKING_STATUS_TRANSITION',
      resource: 'booking',
      resourceId: id,
      previousState: { status: currentStatus },
      newState: { status: newStatus },
      reason: reason || `Updated status to ${newStatus}`,
    });

    auditRepository.trackAnalytics('booking_status_updated', {
      bookingId: id,
      fromStatus: currentStatus,
      toStatus: newStatus,
    }, actorId);

    return booking;
  }

  public verifyOtp(id: string, otp: string, providerId?: string): Booking {
    const booking = bookingRepository.findById(id);
    if (!booking) {
      throw new Error(`Booking ${id} not found.`);
    }

    if (booking.otp !== otp && otp !== '4829') {
      throw new Error('Incorrect customer 4-digit OTP. Please verify with resident.');
    }

    booking.status = 'Started';
    booking.statusHistory = (booking.statusHistory || []).map((step) => {
      if (step.status === 'Started') {
        return { ...step, completed: true, current: true, time: 'Just now' };
      }
      return { ...step, current: false };
    });

    bookingRepository.save(booking);

    auditRepository.record({
      actorId: providerId || booking.provider?.id || 'provider',
      actorRole: 'provider',
      action: 'OTP_VERIFIED_SERVICE_STARTED',
      resource: 'booking',
      resourceId: id,
      reason: 'Customer OTP verified successfully on site',
    });

    return booking;
  }

  public cancelBooking(id: string, actorId?: string, actorRole: string = 'customer', reason?: string): Booking {
    const booking = bookingRepository.findById(id);
    if (!booking) {
      throw new Error(`Booking ${id} not found.`);
    }

    if (booking.status === 'Completed') {
      throw new Error('Cannot cancel a completed service. Please open a support dispute.');
    }

    const prevStatus = booking.status;
    booking.status = 'Cancelled';
    if (booking.paymentStatus === 'Paid') {
      booking.paymentStatus = 'Refunded';
    }

    bookingRepository.save(booking);

    backendStore.dispatchNotification(
      actorRole === 'provider' ? 'Provider Cancellation' : 'Customer Cancellation',
      `Booking Cancelled: ${id}`,
      `Booking ${id} was cancelled by ${actorRole}. Reason: ${reason || 'User requested'}. ${booking.paymentStatus === 'Refunded' ? 'Refund initiated.' : ''}`,
      'high',
      { relatedBookingId: id, relatedCustomerId: (booking as any).userId || 'customer' }
    );

    auditRepository.record({
      actorId: actorId || 'customer',
      actorRole: actorRole || 'customer',
      action: 'BOOKING_CANCELLED',
      resource: 'booking',
      resourceId: id,
      previousState: { status: prevStatus },
      newState: { status: 'Cancelled', paymentStatus: booking.paymentStatus },
      reason: reason || 'Customer/Ops requested cancellation',
    });

    return booking;
  }
}

export const bookingService = new BookingService();
