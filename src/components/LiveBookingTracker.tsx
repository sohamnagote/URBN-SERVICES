import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Car,
  Bike,
  KeyRound,
  Download,
  Send,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { downloadPdfInvoice } from '../lib/pdfInvoiceGenerator';

import { InteractiveMap } from './InteractiveMap';
import { GeminiMapsAssistant } from './GeminiMapsAssistant';

interface LiveBookingTrackerProps {
  booking: Booking;
  onBack: () => void;
  onUpdateBookingStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onOpenSupport: (bookingId?: string) => void;
  onSubmitReview: (bookingId: string, rating: number, comment: string) => void;
}

export const LiveBookingTracker: React.FC<LiveBookingTrackerProps> = ({
  booking,
  onBack,
  onUpdateBookingStatus,
  onOpenSupport,
  onSubmitReview,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(booking.userRating ? true : false);
  const [showMapRadar, setShowMapRadar] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadInvoice = () => {
    try {
      setIsDownloadingPdf(true);
      setDownloadSuccess(false);
      downloadPdfInvoice(booking);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF invoice:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Chat message state
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([]);
  const [inputMsg, setInputMsg] = useState('');

  const isOngoing = booking.status === 'On the Way' || booking.status === 'Started';
  const isCompleted = booking.status === 'Completed';

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    const newMsg = { sender: 'user', text: inputMsg.trim(), time: 'Just now' };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  const handleVerifyOtp = () => {
    if (booking.otp && otpInput === booking.otp) {
      onUpdateBookingStatus(booking.id, 'Started');
      setShowOtpModal(false);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP. Please enter the exact 4-digit code shown for this service.');
    }
  };

  return (
    <div id="live-booking-tracker" className="min-h-screen bg-[#f7f9fb] pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#c3c6d6]/60 flex items-center justify-between h-14 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            id="tracker-back-btn"
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 text-[#003d9b] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base md:text-lg text-gray-900 leading-tight">
              Tracking Booking #{booking.id}
            </h1>
            <span className="text-[11px] text-[#006e2f] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 1-Day Promise Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMapRadar(!showMapRadar)}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
              showMapRadar
                ? 'bg-[#003d9b] text-white border-[#003d9b]'
                : 'text-[#003d9b] bg-blue-50 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Parts & Map Radar</span>
          </button>

          <button
            onClick={() => onOpenSupport(booking.id)}
            className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
          >
            Support
          </button>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-4 py-4 space-y-4">
        {/* Real-time Interactive Map with Live GPS */}
        <div className="bg-white rounded-2xl border border-[#c3c6d6]/80 overflow-hidden shadow-2xs">
          <InteractiveMap
            customerAddress={booking.address}
            provider={booking.provider}
            bookingStatus={booking.status}
            height="260px"
            showAllHubs={false}
            showTrafficOverlay={true}
            isSimulatingDefault={booking.status === 'On the Way'}
          />
        </div>

        {/* Optional Expandable Gemini Maps Radar */}
        {showMapRadar && (
          <GeminiMapsAssistant currentLocality={booking.address.locality} />
        )}


        {/* Assigned Professional Card (Matching Screenshot) */}
        {booking.provider && (
          <div className="bg-white rounded-2xl border border-[#c3c6d6]/80 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={booking.provider.avatar}
                    alt={booking.provider.name}
                    className="w-13 h-13 rounded-full object-cover border-2 border-white ring-2 ring-[#003d9b]/20"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#006e2f] text-white rounded-full p-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">{booking.provider.name}</h3>
                    <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.2 rounded">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{booking.provider.profession}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                      {booking.provider.rating}
                    </div>
                    <span className="text-[11px] text-gray-400">
                      ({booking.provider.reviewsCount}+ jobs done in Nashik)
                    </span>
                  </div>
                </div>
              </div>

              {/* Call & Chat Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="chat-pro-btn"
                  onClick={() => setChatOpen(true)}
                  className="w-10 h-10 rounded-full bg-blue-50 text-[#003d9b] flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-all border border-blue-200"
                  title="Chat with Ramesh"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  id="call-pro-btn"
                  onClick={() => setCallModalOpen(true)}
                  className="w-10 h-10 rounded-full bg-green-50 text-[#006e2f] flex items-center justify-center hover:bg-green-100 active:scale-95 transition-all border border-green-200"
                  title="Call Ramesh"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Vehicle & Verification info */}
            <div className="mt-3.5 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-gray-400" /> {booking.provider.vehicleNumber} (
                {booking.provider.vehicleType})
              </span>
              <span className="text-emerald-700 font-medium">Police & KYC Verified Pro</span>
            </div>
          </div>
        )}

        {/* OTP Verification Banner (For starting service) */}
        {booking.status === 'On the Way' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  Share Start OTP with Ramesh
                </span>
                <span className="text-xs text-amber-700">
                  Share this 4-digit code upon technician arrival to begin repair.
                </span>
              </div>
            </div>
            <div className="text-xl font-mono font-extrabold tracking-widest text-[#003d9b] bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
              {booking.otp || '4829'}
            </div>
          </div>
        )}

        {/* BOOKING STATUS Stepper (Matching Screenshot Image 19 / 2) */}
        <div className="bg-white rounded-2xl border border-[#c3c6d6]/80 p-5 shadow-2xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#737685] mb-4">
            Booking Status
          </h3>

          <div className="space-y-6 relative pl-2">
            {/* Continuous Vertical Line */}
            <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-200" />

            {booking.statusHistory?.map((step, idx) => {
              const isCompletedStep = step.completed;
              const isCurrentStep = step.current || booking.status === step.status;

              return (
                <div key={idx} className="relative flex items-start gap-4 z-10">
                  {/* Step Dot/Icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      isCompletedStep
                        ? 'bg-[#006e2f] text-white ring-4 ring-green-100'
                        : isCurrentStep
                        ? 'bg-[#003d9b] text-white ring-4 ring-blue-100 animate-pulse'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompletedStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h4
                        className={`text-sm font-bold ${
                          isCurrentStep
                            ? 'text-[#003d9b]'
                            : isCompletedStep
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {step.time && (
                        <span className="text-[11px] text-gray-400 font-medium">{step.time}</span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bill Summary & 30-Day Warranty Card */}
        <div className="bg-white rounded-2xl border border-[#c3c6d6]/80 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-gray-900">Total Payable</span>
            <span className="text-base font-extrabold text-[#003d9b]">₹{booking.bill.total}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Payment Method: {booking.paymentMethod}</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                booking.paymentStatus === 'Paid'
                  ? 'bg-green-100 text-[#006e2f]'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {booking.paymentStatus}
            </span>
          </div>

          {isCompleted && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <button
                id={`download-invoice-btn-${booking.id}`}
                onClick={handleDownloadInvoice}
                disabled={isDownloadingPdf}
                className="w-full bg-[#003d9b] hover:bg-blue-800 active:scale-[0.99] text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Download className={`w-4 h-4 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
                <span>{isDownloadingPdf ? 'Generating PDF Invoice...' : 'Download Digital Tax Invoice (PDF)'}</span>
              </button>

              {downloadSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Invoice #INV-{booking.id}.pdf downloaded successfully</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">30-Day Guarantee</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating & Review Section if Completed */}
        {isCompleted && (
          <div className="bg-white rounded-2xl border border-[#c3c6d6]/80 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Rate Ramesh's Service</h3>
            {reviewSubmitted ? (
              <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-xs text-[#006e2f] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! Your verified review has been published for Nashik locals.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingVal(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingVal ? 'fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">
                    {ratingVal === 5 ? 'Excellent!' : `${ratingVal} Stars`}
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the punctuality and cleanliness of work?"
                  className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-[#003d9b]"
                />
                <button
                  onClick={() => {
                    onSubmitReview(booking.id, ratingVal, reviewComment || 'Great service in Nashik!');
                    setReviewSubmitted(true);
                  }}
                  className="bg-[#003d9b] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors"
                >
                  Submit Review
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live Simulation Controls for Evaluators */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Lifecycle Controls
            </span>
            <span className="text-[10px] bg-slate-800 text-gray-300 px-2 py-0.5 rounded">
              Demonstration Mode
            </span>
          </div>
          <p className="text-xs text-gray-300">
            Simulate technician progress milestones to test the real-time Nashik tracking state machine:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onUpdateBookingStatus(booking.id, 'On the Way')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                booking.status === 'On the Way'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
              }`}
            >
              1. En Route
            </button>
            <button
              onClick={() => setShowOtpModal(true)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                booking.status === 'Started'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
              }`}
            >
              2. Start with OTP
            </button>
            <button
              onClick={() => onUpdateBookingStatus(booking.id, 'Completed')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                booking.status === 'Completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
              }`}
            >
              3. Complete Job
            </button>
          </div>
        </div>
      </main>

      {/* In-App Messaging Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md h-[460px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#003d9b] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={booking.provider?.avatar}
                  alt={booking.provider?.name}
                  className="w-8 h-8 rounded-full object-cover border border-white"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold">{booking.provider?.name}</h4>
                  <span className="text-[10px] text-blue-200">Plumber • En route to Ashoka Marg</span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/80 hover:text-white text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-gray-50 text-xs">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-2.5 rounded-2xl max-w-[80%] ${
                      m.sender === 'user'
                        ? 'bg-[#003d9b] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-2.5 border-t border-gray-200 bg-white flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type instructions or landmark..."
                className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#003d9b]"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#003d9b] text-white p-2 rounded-xl hover:bg-blue-800 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Phone Dialer Modal */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-green-100 text-[#006e2f] flex items-center justify-center mx-auto mb-3">
              <Phone className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{booking.provider?.name}</h3>
            <p className="text-xs text-gray-500">{booking.provider?.phone}</p>
            <p className="text-[11px] text-gray-400 mt-2 bg-gray-50 p-2 rounded-lg">
              URBN Secure Masked Calling (Nashik Gateway)
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setCallModalOpen(false)}
                className="flex-1 bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-rose-700"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Service OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#003d9b] flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Enter 4-Digit Start OTP</h3>
            <p className="text-xs text-gray-500 mt-1">
              Customer OTP is: <span className="font-mono font-bold text-[#003d9b]">{booking.otp || '4829'}</span>
            </p>

            <input
              type="text"
              maxLength={4}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="4829"
              className="text-center font-mono text-2xl font-bold tracking-widest border border-gray-300 rounded-xl p-3 my-4 w-36 mx-auto block focus:outline-none focus:border-[#003d9b]"
            />

            {otpError && <p className="text-xs text-rose-600 mb-3">{otpError}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                className="flex-1 bg-[#003d9b] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-800"
              >
                Verify & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
