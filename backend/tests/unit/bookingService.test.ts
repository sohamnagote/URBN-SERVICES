import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bookingService } from '../../services/bookingService';
import { backendStore } from '../../store/backendStore';

describe('BookingService Unit Tests', () => {
  it('correctly calculates authoritative bill with discount cap and taxes', () => {
    const items = [
      { service: { id: 's1', title: 'Tap Repair', price: 500, categoryId: 'plumbing' }, quantity: 2 }, // 1000
    ];

    const bill = bookingService.calculateBill(items);
    // Subtotal = 1000
    // Visit = 49
    // Discount = min(100, 1000 * 0.1) = 100
    // Taxable = 1000 + 49 - 100 = 949
    // Taxes (5%) = round(949 * 0.05) = 47
    // Total = 949 + 47 = 996
    assert.equal(bill.estimatedLabor, 1000);
    assert.equal(bill.serviceVisitCharge, 49);
    assert.equal(bill.platformDiscount, 100);
    assert.equal(bill.taxesAndFee, 47);
    assert.equal(bill.total, 996);
  });

  it('creates booking with 1-Day Promise deadline, 4-digit OTP and initial dispatch history', () => {
    const newBooking = bookingService.createBooking({
      userId: 'test-user-1',
      items: [{ service: { id: 's1', title: 'AC Repair', price: 499, categoryId: 'ac' }, quantity: 1 }],
      address: { line1: '101, Residency', locality: 'Gangapur Road', city: 'Nashik', pincode: '422013', isDefault: true, id: 'a1', title: 'Home' },
      date: 'Today',
      timeSlot: 'Express Slot',
    });

    assert.ok(newBooking.id.startsWith('UB-'));
    assert.equal(newBooking.status, 'On the Way');
    assert.equal(newBooking.otp.length, 4);
    assert.ok(newBooking.promiseDeadline.includes('1-Day Promise'));
    assert.equal(newBooking.statusHistory.length, 5);
    assert.equal(newBooking.bill.serviceVisitCharge, 49);
  });

  it('verifies doorstep OTP and starts service', () => {
    const booking = bookingService.createBooking({
      userId: 'test-user-2',
      items: [{ service: { id: 's2', title: 'Fan Repair', price: 299, categoryId: 'electrical' }, quantity: 1 }],
      address: { line1: '202, Heights', locality: 'College Road', city: 'Nashik', pincode: '422005', isDefault: true, id: 'a2', title: 'Home' },
    });

    // Attempt invalid OTP
    assert.throws(() => {
      bookingService.verifyOtp(booking.id, '0000');
    }, /Incorrect customer 4-digit OTP/);

    // Verify with correct OTP
    const startedBooking = bookingService.verifyOtp(booking.id, booking.otp);
    assert.equal(startedBooking.status, 'Started');
  });

  it('completes service, updates payment to Paid, and calculates provider earnings', () => {
    // Seed a provider
    const provId = `prov-test-${Date.now()}`;
    backendStore.providers.set(provId, {
      id: provId,
      userId: 'prov-user-1',
      email: 'pro@test.com',
      name: 'Ramesh Plumber',
      profession: 'Master Plumber',
      rating: 4.9,
      reviewsCount: 10,
      phone: '9876543210',
      avatar: '',
      verified: true,
      etaMinutes: 15,
      vehicleType: 'Bike',
      currentLocationName: 'Gangapur Road',
      coords: { lat: 20.0, lng: 73.7 },
      verificationStatus: 'Approved',
      isOnline: true,
      categories: ['plumbing'],
      serviceAreas: ['Gangapur Road'],
      totalJobsCompleted: 0,
      grossEarnings: 0,
      platformCommission: 0,
      netEarnings: 0,
      payoutStatus: 'Processed',
    });

    const booking = bookingService.createBooking({
      userId: 'test-user-3',
      items: [{ service: { id: 's3', title: 'Pipe Fix', price: 400, categoryId: 'plumbing' }, quantity: 1 }],
      address: { line1: '303, Wing B', locality: 'Gangapur Road', city: 'Nashik', pincode: '422013', isDefault: true, id: 'a3', title: 'Home' },
    });

    // Manually assign test provider
    booking.provider = backendStore.providers.get(provId);
    backendStore.bookings.set(booking.id, booking);

    // Progress to Started
    bookingService.verifyOtp(booking.id, booking.otp);

    // Complete booking
    const completedBooking = bookingService.updateStatus(booking.id, 'Completed');
    assert.equal(completedBooking.status, 'Completed');
    assert.equal(completedBooking.paymentStatus, 'Paid');

    // Check provider earnings
    const updatedProv = backendStore.providers.get(provId)!;
    assert.equal(updatedProv.totalJobsCompleted, 1);
    assert.ok(updatedProv.grossEarnings > 0);
    assert.ok(updatedProv.platformCommission > 0);
    assert.equal(updatedProv.netEarnings, updatedProv.grossEarnings - updatedProv.platformCommission);
  });

  it('cancels booking and sets refund status if paid', () => {
    const booking = bookingService.createBooking({
      userId: 'test-user-4',
      items: [{ service: { id: 's4', title: 'Switch Repair', price: 150, categoryId: 'electrical' }, quantity: 1 }],
      address: { line1: '404, Villa', locality: 'Indira Nagar', city: 'Nashik', pincode: '422009', isDefault: true, id: 'a4', title: 'Home' },
      paymentMethod: 'UPI',
    });

    assert.equal(booking.paymentStatus, 'Paid');
    const cancelled = bookingService.cancelBooking(booking.id, 'test-user-4', 'customer', 'Plan changed');
    assert.equal(cancelled.status, 'Cancelled');
    assert.equal(cancelled.paymentStatus, 'Refunded');
  });
});
