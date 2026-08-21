import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Star,
  ShieldCheck,
  Plus,
  Minus,
  Check,
  Clock,
  Droplet,
  Zap,
  Wrench,
  Sparkles,
  Info,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { CartItem, CategoryId, ServiceCategory, ServiceItem } from '../types';
import { MOCK_REVIEWS, URBN_LOGO_URL } from '../data/mockData';

interface CategoryScreenProps {
  category: ServiceCategory;
  onBack: () => void;
  cartItems: CartItem[];
  onAddToCart: (service: ServiceItem) => void;
  onRemoveFromCart: (serviceId: string) => void;
  onProceedToBooking: () => void;
  onOpenPromiseModal: () => void;
}

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  category,
  onBack,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onProceedToBooking,
  onOpenPromiseModal,
}) => {
  const [showBillModal, setShowBillModal] = useState(false);

  // Calculate cart total for this category or globally
  const categoryCartItems = cartItems.filter((i) => i.service.categoryId === category.id);
  const rawSubtotal = cartItems.reduce(
    (acc, curr) => acc + curr.service.price * curr.quantity,
    0
  );
  
  // Base fixed visit fee if cart has items
  const visitCharge = cartItems.length > 0 ? 299 : 0;
  const platformDiscount = cartItems.length > 0 ? 50 : 0;
  const taxes = cartItems.length > 0 ? 49 : 0;
  const totalAmount = rawSubtotal > 0 ? rawSubtotal + visitCharge - platformDiscount + taxes : 0;

  const getItemQuantity = (serviceId: string) => {
    const item = cartItems.find((i) => i.service.id === serviceId);
    return item ? item.quantity : 0;
  };

  const reviewsForCategory = MOCK_REVIEWS;

  return (
    <div id="category-screen" className="min-h-screen bg-[#f7f9fb] pb-28 animate-in fade-in duration-200">
      {/* Top App Bar with back button */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#c3c6d6]/60 flex justify-between items-center h-14 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            id="category-back-btn"
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 text-[#191c1e] transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 text-[#003d9b]" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src={URBN_LOGO_URL}
              alt="URBN SERVICES"
              className="h-6 object-contain hidden sm:block"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-bold text-base md:text-lg text-[#003d9b]">
              {category.name}
            </span>
          </div>
        </div>

        <button
          aria-label="Notifications"
          className="p-2 rounded-full hover:bg-gray-100 text-[#434654] transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-[768px] mx-auto px-4 py-4 space-y-6">
        {/* Category Hero Banner (Matching Screenshots) */}
        <div className="relative rounded-2xl overflow-hidden shadow-md bg-gray-900 text-white min-h-[220px] sm:min-h-[260px] flex flex-col justify-end p-5 sm:p-6">
          <img
            src={category.heroImage}
            alt={category.heroTitle}
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient overlay to ensure high contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

          <div className="relative z-10 space-y-2">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenPromiseModal}
                className="bg-[#006e2f] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {category.promiseBadge}
              </button>
              <div className="bg-white/90 backdrop-blur-xs text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {category.rating} ({category.reviewCount}+ Reviews)
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {category.heroTitle}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-xl">
              {category.heroSubtitle}
            </p>
          </div>
        </div>

        {/* Services List Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#191c1e] tracking-tight">Select Services</h2>
            <span className="text-xs text-gray-500 font-medium">Nashik Standardized Pricing</span>
          </div>

          <div className="space-y-3.5">
            {category.services.map((service) => {
              const qty = getItemQuantity(service.id);
              const isSelected = qty > 0;

              return (
                <div
                  key={service.id}
                  id={`service-card-${service.id}`}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
                    isSelected
                      ? 'border-[#003d9b] ring-1 ring-[#003d9b]/30 shadow-xs'
                      : 'border-[#c3c6d6]/80 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3.5">
                      {/* Icon or Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003d9b] flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Wrench className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">{service.title}</h3>
                          {service.bestseller && (
                            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">
                              Bestseller
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#434654] mt-0.5 leading-relaxed max-w-md">
                          {service.shortDesc}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-[#737685]">Starting at</span>
                          <span className="text-sm font-bold text-gray-900">₹{service.price}</span>
                          {service.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{service.originalPrice}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400 ml-1">• {service.durationMin} mins</span>
                        </div>
                      </div>
                    </div>

                    {/* Add / Quantity Counter button */}
                    <div className="shrink-0 pt-1">
                      {qty === 0 ? (
                        <button
                          id={`add-service-${service.id}`}
                          onClick={() => onAddToCart(service)}
                          className="bg-white border border-[#003d9b] text-[#003d9b] hover:bg-blue-50 active:scale-95 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-2xs"
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="flex items-center border border-[#003d9b] bg-blue-50/50 rounded-xl overflow-hidden shadow-2xs">
                          <button
                            id={`minus-service-${service.id}`}
                            onClick={() => onRemoveFromCart(service.id)}
                            className="p-2 text-[#003d9b] hover:bg-blue-100 active:scale-90 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-[#003d9b]">{qty}</span>
                          <button
                            id={`plus-service-${service.id}`}
                            onClick={() => onAddToCart(service)}
                            className="p-2 text-[#003d9b] hover:bg-blue-100 active:scale-90 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Included bullets snippet when expanded */}
                  {isSelected && service.included && (
                    <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 rounded-b-2xl">
                      <span className="text-[11px] font-semibold text-gray-700 block mb-1">
                        What's Included:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-gray-600">
                        {service.included.map((inc, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-[#006e2f] shrink-0" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Nashik Resident Reviews */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#191c1e] tracking-tight">Nashik Resident Reviews</h2>
            <div className="flex items-center text-xs font-bold text-[#006e2f]">
              <Star className="w-3.5 h-3.5 fill-[#006e2f] mr-1" /> {reviewsForCategory.length > 0 ? '4.8 / 5 Rating' : 'Verified Reviews'}
            </div>
          </div>

          <div className="space-y-3">
            {reviewsForCategory.length > 0 ? (
              reviewsForCategory.slice(0, 2).map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-[#c3c6d6]/70 rounded-2xl p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full ${rev.avatarColor} text-white text-xs font-bold flex items-center justify-center`}
                      >
                        {rev.avatarInitials}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{rev.author}</span>
                        <span className="text-[10px] text-gray-400">{rev.locality}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[11px] text-gray-400 ml-1.5">{rev.timeAgo}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#434654] italic leading-relaxed">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <div className="bg-white border border-dashed border-[#c3c6d6] rounded-2xl p-5 text-center">
                <p className="text-xs text-gray-500">No verified reviews submitted yet for this category.</p>
                <p className="text-[11px] text-[#003d9b] font-medium mt-1">Book a service and share your experience with Nashik residents!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar (Total Amount + Book Now) */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#c3c6d6] py-3 px-4 md:px-8 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-[768px] mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-[#737685] uppercase tracking-wider">
              Total Amount
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-[#191c1e]">
                ₹{totalAmount}
              </span>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setShowBillModal(true)}
                  className="text-[11px] font-semibold text-[#003d9b] hover:underline"
                >
                  View detailed bill
                </button>
              )}
            </div>
          </div>

          <button
            id="category-book-now-cta"
            disabled={cartItems.length === 0}
            onClick={onProceedToBooking}
            className={`font-bold text-sm px-6 sm:px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2 ${
              cartItems.length > 0
                ? 'bg-[#003d9b] text-white hover:bg-blue-800 shadow-md cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Book Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Detailed Bill Modal */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Detailed Bill Summary</h3>
              <button
                onClick={() => setShowBillModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 divide-y divide-gray-100 text-xs text-gray-700">
              <div className="space-y-2 pb-2">
                {cartItems.map((item) => (
                  <div key={item.service.id} className="flex justify-between items-center">
                    <span>
                      {item.service.title} (x{item.quantity})
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{item.service.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service Visit Charge</span>
                  <span>₹299</span>
                </div>
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Nashik Platform Promo (NASHIK50)</span>
                  <span>-₹50</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Taxes & GST (18%)</span>
                  <span>₹49</span>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center font-bold text-sm text-gray-900">
                <span>Grand Total</span>
                <span className="text-base text-[#003d9b]">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowBillModal(false);
                onProceedToBooking();
              }}
              className="mt-6 w-full bg-[#003d9b] text-white font-bold py-3 rounded-xl hover:bg-blue-800 text-sm transition-colors"
            >
              Proceed to Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
