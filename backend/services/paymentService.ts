import { bookingRepository } from '../repositories/bookingRepository';
import { auditRepository } from '../repositories/auditRepository';

export class PaymentService {
  public initiate(bookingId: string, amount: number, paymentMethod: string, userId?: string) {
    const booking = bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found.`);
    }

    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    auditRepository.record({
      actorId: userId || 'customer',
      actorRole: 'customer',
      action: 'PAYMENT_INITIATED',
      resource: 'payment',
      resourceId: transactionId,
      newState: { bookingId, amount, paymentMethod, status: 'Processing' },
      reason: `Initiated ₹${amount} payment via ${paymentMethod}`,
    });

    auditRepository.trackAnalytics('payment_started', {
      bookingId,
      amount,
      paymentMethod,
      transactionId,
    }, userId);

    return {
      success: true,
      transactionId,
      amount,
      currency: 'INR',
      status: 'Authorized',
      paymentMethod,
      merchantName: 'URBN SERVICES Nashik',
    };
  }

  public confirm(bookingId: string, transactionId?: string, paymentMethod?: string, userId?: string) {
    const booking = bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found.`);
    }

    booking.paymentStatus = 'Paid';
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod as any;
    }
    bookingRepository.save(booking);

    auditRepository.record({
      actorId: userId || 'system',
      actorRole: 'system',
      action: 'PAYMENT_CONFIRMED',
      resource: 'payment',
      resourceId: transactionId || `txn_${Date.now()}`,
      newState: { bookingId, paymentStatus: 'Paid' },
      reason: `Payment verified & reconciled for booking ${bookingId}`,
    });

    auditRepository.trackAnalytics('payment_success', {
      bookingId,
      transactionId,
    }, userId);

    return booking;
  }
}

export const paymentService = new PaymentService();
