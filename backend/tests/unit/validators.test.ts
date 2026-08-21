import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateCreateBooking, validateVerifyOtp } from '../../validators/bookingValidators';
import { validateCreateNotificationJob, validateRegisterDevice } from '../../validators/notificationValidators';
import { validateProviderApply } from '../../validators/providerValidators';
import { validateReviewSubmit } from '../../validators/reviewValidators';

describe('Payload Validators Unit Tests', () => {
  it('validates booking creation payloads', () => {
    // Empty payload
    const emptyRes = validateCreateBooking({ body: {} } as any);
    assert.equal(emptyRes.valid, false);
    assert.ok(emptyRes.errors!.some((e) => e.includes('cart')));

    // Valid payload
    const validRes = validateCreateBooking({
      body: {
        items: [{ service: { id: 's1', title: 'Drain Clean', price: 299, categoryId: 'plumbing' }, quantity: 1 }],
        address: { locality: 'Gangapur Road' },
      },
    } as any);
    assert.equal(validRes.valid, true);
  });

  it('validates 4-digit OTP format', () => {
    assert.equal(validateVerifyOtp({ body: { otp: '123' } } as any).valid, false);
    assert.equal(validateVerifyOtp({ body: { otp: '12345' } } as any).valid, false);
    assert.equal(validateVerifyOtp({ body: { otp: '4829' } } as any).valid, true);
  });

  it('validates notification job payload', () => {
    assert.equal(validateCreateNotificationJob({ body: {} } as any).valid, false);

    // Scheduled in past
    assert.equal(
      validateCreateNotificationJob({
        body: {
          title: 'Monsoon Offer',
          message: 'Get 20% off',
          category: 'Promotion',
          deliveryType: 'scheduled',
          scheduledFor: new Date(Date.now() - 100000).toISOString(),
        },
      } as any).valid,
      false
    );

    // Valid immediate job
    assert.equal(
      validateCreateNotificationJob({
        body: {
          title: 'Monsoon Offer',
          message: 'Get 20% off all cleaning services',
          category: 'Promotion',
          deliveryType: 'send_now',
        },
      } as any).valid,
      true
    );
  });

  it('validates provider application payload', () => {
    assert.equal(validateProviderApply({ body: {} } as any).valid, false);
    assert.equal(
      validateProviderApply({
        body: {
          applicantName: 'Vikram Joshi',
          phone: '+91 98230 11223',
          primaryCategory: 'electrical',
        },
      } as any).valid,
      true
    );
  });

  it('validates review submission ratings', () => {
    assert.equal(validateReviewSubmit({ body: { rating: 0, comment: 'Bad' } } as any).valid, false);
    assert.equal(validateReviewSubmit({ body: { rating: 6, comment: 'Great' } } as any).valid, false);
    assert.equal(validateReviewSubmit({ body: { rating: 5, comment: 'Excellent work in Nashik!' } } as any).valid, true);
  });
});
