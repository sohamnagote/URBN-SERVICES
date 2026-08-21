import { Request } from 'express';
import { BookingStatus } from '../types';

export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
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

export function validateCreateBooking(req: Request) {
  const errors: string[] = [];
  const { items, address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('At least one service item is required in cart.');
  } else {
    items.forEach((it, idx) => {
      if (!it.service || typeof it.service !== 'object') {
        errors.push(`Item at index ${idx} has invalid service details.`);
      } else if (!it.service.title || !it.service.price) {
        errors.push(`Service at index ${idx} must have title and price.`);
      }
    });
  }

  if (!address || typeof address !== 'object') {
    errors.push('Valid address object is required.');
  } else if (!address.locality || !address.locality.trim()) {
    errors.push('Valid Nashik address with locality is required.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateVerifyOtp(req: Request) {
  const errors: string[] = [];
  const { otp } = req.body;

  if (!otp || typeof otp !== 'string' || otp.trim().length !== 4) {
    errors.push('4-digit numeric OTP is required to start service.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus) {
  if (currentStatus === newStatus) {
    return { valid: true };
  }
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowed.join(', ')}`,
    };
  }
  return { valid: true };
}
