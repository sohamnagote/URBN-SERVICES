import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  Star,
  CheckCircle2,
  ChevronRight,
  Tag,
  Clock,
  Sparkles,
  Info,
  Building,
} from 'lucide-react';
import { Address, BillBreakdown, CartItem, ServiceItem } from '../types';
import { AVAILABLE_COUPONS, AVAILABLE_SLOTS, DEFAULT_ADDRESSES } from '../data/mockData';

interface ConfirmBookingScreenProps {
  cartItems: CartItem[];
  currentAddress: Address;
  onSelectAddress: (addr: Address) => void;
  savedAddresses: Address[];
  onBack: () => void;
  onConfirmBooking: (bookingDetails: {
    selectedSlot: { dateLabel: string; time: string };
    paymentMethod: 'UPI' | 'Card' | 'Cash on Service';
    bill: BillBreakdown;
  }) => void;
}

export const ConfirmBookingScreen: React.FC<ConfirmBookingScreenProps> = ({
  cartItems,
  currentAddress,
  onSelectAddress,
  savedAddresses,
  onBack,
  onConfirmBooking,
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(1); // Tomorrow 10:00 AM - 11:30 AM default
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('NASHIK50');
  const [customCoupon, setCustomCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('Coupon NASHIK50 applied (₹50 off)');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash on Service'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSlot = AVAILABLE_SLOTS[selectedSlotIndex];

  // Calculate bill breakdown matching screenshot
  const rawLabor = cartItems.reduce(
    (acc, curr) => acc + curr.service.price * curr.quantity,
    0
  );
  const serviceVisitCharge = 299;
  const estimatedLabor = rawLabor > 0 ? rawLabor : 300;
  const discountAmount = appliedCoupon === 'NASHIK50' ? 50 : appliedCoupon === 'FIRSTURBN' ? 100 : 0;
  const taxesAndFee = 49;
  const grandTotal = Math.max(0, serviceVisitCharge + estimatedLabor - discountAmount + taxesAndFee);

  const billBreakdown: BillBreakdown = {
    serviceVisitCharge,
    estimatedLabor,
    platformDiscount: discountAmount,
    taxesAndFee,
    total: grandTotal,
    couponApplied: appliedCoupon,
  };

  const primaryItem = cartItems[0]?.service || {
    title: 'Bathroom Tap Repair',
    shortDesc: 'Expert plumbing service',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  };

  const handleApplyCoupon = (code: string) => {
    const found = AVAILABLE_COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (found) {
      setAppliedCoupon(found.code);
      setCouponMsg(`Applied ${found.code}: ${found.title}`);
    } else {
      setCouponMsg('Invalid coupon code for Nashik region');
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmBooking({
        selectedSlot: {
          dateLabel: selectedSlot.dateLabel,
          time: selectedSlot.time,
        },
        paymentMethod,
        bill: billBreakdown,
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div id="confirm-booking-screen" className="min-h-screen bg-[#f7f9fb] pb-32 animate-in fade-in duration-200">
      {/* Top App Bar with back button */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#c3c6d6]/60 flex items-center h-14 px-4 md:px-8">
        <button
          id="confirm-booking-back-btn"
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 text-[#003d9b] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg md:text-xl text-[#003d9b] ml-3">
          Confirm Booking
        </h1>
      </header>

      <main className="max-w-[640px] mx-auto px-4 py-5 space-y-4">
        {/* Service Summary Card (Matching screenshot image 2) */}
        <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="rounded-xl overflow-hidden mb-3.5 h-44 sm:h-52 bg-gray-100 relative">
            <img
              src={primaryItem.image}
              alt={primaryItem.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {cartItems.length > 1
                  ? `${primaryItem.title} + ${cartItems.length - 1} more`
                  : primaryItem.title}
              </h2>
              <p className="text-xs text-[#434654] mt-0.5">{primaryItem.shortDesc}</p>
            </div>
            <div className="bg-[#6bff8f]/30 border border-[#006e2f]/30 text-[#006e2f] px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#006e2f]" />
              {primaryItem.rating || 4.8}
            </div>
          </div>
        </div>

        {/* Service Address Card (Matching Screenshot) */}
        <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[#003d9b]">
              <MapPin className="w-4 h-4" />
              <span className="font-bold text-sm text-gray-900">Service Address</span>
            </div>
            <button
              id="change-address-btn"
              onClick={() => setShowAddressModal(true)}
              className="text-xs font-bold text-[#003d9b] hover:underline"
            >
              Change
            </button>
          </div>
          <div className="pl-6">
            <p className="text-sm font-bold text-gray-900">{currentAddress.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">{currentAddress.line1}</p>
            <p className="text-xs text-gray-400">{currentAddress.locality}, Nashik, {currentAddress.pincode}</p>
            <span className="inline-block mt-2 text-[10px] bg-blue-50 text-[#003d9b] font-semibold px-2 py-0.5 rounded-md border border-blue-200">
              ✓ Verified Nashik Service Area (1-Day Promise Guaranteed)
            </span>
          </div>
        </div>

        {/* Date & Time Slot Card (Matching Screenshot) */}
        <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[#003d9b]">
              <Calendar className="w-4 h-4" />
              <span className="font-bold text-sm text-gray-900">Date & Time</span>
            </div>
            <button
              id="change-slot-btn"
              onClick={() => setShowSlotModal(true)}
              className="text-xs font-bold text-[#003d9b] hover:underline"
            >
              Change Slot
            </button>
          </div>
          <div className="pl-6">
            <p className="text-sm font-bold text-gray-900">
              {selectedSlot.dateLabel}
            </p>
            <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {selectedSlot.time}
            </p>
          </div>
        </div>

        {/* Payment Summary Card (Matching Screenshot) */}
        <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 text-[#003d9b]">
            <CreditCard className="w-4 h-4" />
            <span className="font-bold text-sm text-gray-900">Payment Summary</span>
          </div>

          <div className="space-y-2 text-xs text-gray-600 border-b border-gray-100 pb-3">
            <div className="flex justify-between items-center">
              <span>Service Visit Charge</span>
              <span className="font-medium text-gray-900">₹{serviceVisitCharge}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Estimated Labor (1 hr)</span>
              <span className="font-medium text-gray-900">₹{estimatedLabor}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-[#006e2f] font-semibold">
                <span>Platform Discount ({appliedCoupon})</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Taxes & Fee</span>
              <span className="font-medium text-gray-900">₹{taxesAndFee}</span>
            </div>
          </div>

          {/* Coupon input */}
          <div className="mt-3 pt-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Promo Code"
                  value={customCoupon}
                  onChange={(e) => setCustomCoupon(e.target.value.toUpperCase())}
                  className="w-full text-xs uppercase pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#003d9b]"
                />
              </div>
              <button
                type="button"
                onClick={() => handleApplyCoupon(customCoupon || 'NASHIK50')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-2 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className="text-[11px] text-[#006e2f] font-medium mt-1 pl-1">{couponMsg}</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-end">
            <div>
              <span className="font-extrabold text-lg text-gray-900 block">Total</span>
              <span className="text-[11px] text-gray-400">Parts cost extra, if applicable</span>
            </div>
            <span className="text-2xl font-extrabold text-[#003d9b]">₹{grandTotal}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <span className="font-bold text-sm text-gray-900 block mb-2.5">Select Payment Mode</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'UPI' as const, label: 'UPI / GPay' },
              { id: 'Card' as const, label: 'Credit/Debit' },
              { id: 'Cash on Service' as const, label: 'Pay After Job' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  paymentMethod === method.id
                    ? 'border-[#003d9b] bg-blue-50/70 text-[#003d9b] ring-1 ring-[#003d9b]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* URBN Trust Guarantee Card (Matching Screenshot) */}
        <div className="bg-[#f2f4f6] rounded-2xl p-4 sm:p-5 text-center border border-gray-200">
          <div className="inline-flex p-2 bg-white rounded-full text-[#006e2f] mb-1.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-gray-900">URBN Trust Guarantee</h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Background verified professionals • 30-day service warranty • 1-Day Promise
          </p>
        </div>
      </main>

      {/* Sticky Bottom CTA Button (Matching Screenshot) */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40 shadow-lg">
        <div className="max-w-[640px] mx-auto">
          <button
            id="confirm-booking-final-btn"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full bg-[#003d9b] hover:bg-blue-800 text-white font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Assigning Nashik Professional...
              </span>
            ) : (
              <>
                <span>Confirm Booking</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </footer>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-base">Select Address</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => {
                    onSelectAddress(addr);
                    setShowAddressModal(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between ${
                    addr.id === currentAddress.id
                      ? 'border-[#003d9b] bg-blue-50/50 ring-1 ring-[#003d9b]'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">{addr.title}</span>
                    <span className="text-xs text-gray-600">{addr.line1}</span>
                  </div>
                  {addr.id === currentAddress.id && <CheckCircle2 className="w-4 h-4 text-[#003d9b]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slot Selection Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-base">Select Date & Time Slot</h3>
              <button
                onClick={() => setShowSlotModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {AVAILABLE_SLOTS.map((slot, index) => (
                <button
                  key={slot.id}
                  onClick={() => {
                    setSelectedSlotIndex(index);
                    setShowSlotModal(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between ${
                    selectedSlotIndex === index
                      ? 'border-[#003d9b] bg-blue-50/50 ring-1 ring-[#003d9b]'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">{slot.dateLabel}</span>
                      <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-1.5 py-0.2 rounded">
                        {slot.badge}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 mt-0.5 block">{slot.time}</span>
                  </div>
                  {selectedSlotIndex === index && <CheckCircle2 className="w-4 h-4 text-[#003d9b]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
