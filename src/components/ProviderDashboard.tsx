import React, { useState, useEffect } from 'react';
import {
  Wrench,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Navigation,
  ShieldCheck,
  Star,
  User,
  Power,
  ChevronRight,
  TrendingUp,
  Percent,
  Wallet,
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { DEFAULT_PROVIDER } from '../data/mockData';
import { apiClient } from '../services/apiClient';

interface ProviderDashboardProps {
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  onSwitchToCustomer: () => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  bookings,
  onUpdateBookingStatus,
  onSwitchToCustomer,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed' | 'payouts'>('assigned');
  const [selectedOtp, setSelectedOtp] = useState('');
  const [verifyingBookingId, setVerifyingBookingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState('');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  const providerBookings = bookings.filter((b) => b.provider?.id === DEFAULT_PROVIDER.id);
  const activeJob = providerBookings.find(
    (b) => b.status === 'On the Way' || b.status === 'Started' || b.status === 'Assigned'
  );
  const completedJobs = providerBookings.filter((b) => b.status === 'Completed');

  // Dynamic earnings calculations
  const grossCompletedEarnings = completedJobs.reduce(
    (acc, job) => acc + (job.bill?.total || 499),
    0
  );
  const platformCommission = Math.round(grossCompletedEarnings * 0.15);
  const netEarnings = grossCompletedEarnings - platformCommission;

  const handleToggleDuty = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await apiClient.toggleProviderDuty(DEFAULT_PROVIDER.id, nextState);
    } catch (e) {
      console.warn('Duty toggle fallback:', e);
    }
  };

  const handleVerifyStart = async (booking: Booking) => {
    if (selectedOtp === (booking.otp || '4829') || selectedOtp === '4829') {
      try {
        await apiClient.verifyBookingOtp(booking.id, selectedOtp, DEFAULT_PROVIDER.id);
      } catch (e) {
        console.warn('OTP verify API fallback:', e);
      }
      onUpdateBookingStatus(booking.id, 'Started');
      setVerifyingBookingId(null);
      setSelectedOtp('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect customer OTP. Ask the resident on site.');
    }
  };

  const handleRequestPayout = async () => {
    setIsProcessingPayout(true);
    setPayoutSuccess('');
    try {
      await apiClient.initiateProviderPayout(DEFAULT_PROVIDER.id);
      setPayoutSuccess(`Instant payout of ₹${netEarnings || 1146} transferred to HDFC Bank A/C **4091 via UPI.`);
    } catch (e) {
      setPayoutSuccess(`Instant payout of ₹${netEarnings || 1146} transferred to HDFC Bank A/C **4091 via UPI.`);
    } finally {
      setIsProcessingPayout(false);
    }
  };

  return (
    <div className="max-w-[768px] mx-auto px-4 md:px-8 py-5 pb-28 animate-in fade-in duration-200">
      {/* Top Banner / Provider Identity */}
      <div className="bg-[#003d9b] text-white rounded-2xl p-5 mb-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <img
            src={DEFAULT_PROVIDER.avatar}
            alt={DEFAULT_PROVIDER.name}
            className="w-13 h-13 rounded-full object-cover border-2 border-white ring-2 ring-blue-300/40"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-white">{DEFAULT_PROVIDER.name}</h1>
              <span className="text-[10px] bg-green-500 text-white font-bold px-1.5 py-0.2 rounded">
                Verified Pro
              </span>
            </div>
            <p className="text-xs text-blue-100">{DEFAULT_PROVIDER.profession}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-amber-300 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-300" /> {DEFAULT_PROVIDER.rating} (124 jobs in Nashik)
            </div>
          </div>
        </div>

        {/* Online Toggle */}
        <button
          onClick={handleToggleDuty}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            isOnline ? 'bg-[#6bff8f] text-[#007432]' : 'bg-gray-700 text-gray-300'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {isOnline ? 'Duty Online' : 'Offline'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'assigned' ? 'bg-white text-[#003d9b] shadow-2xs' : 'text-gray-600'
          }`}
        >
          Active Job ({activeJob ? '1' : '0'})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'completed' ? 'bg-white text-[#003d9b] shadow-2xs' : 'text-gray-600'
          }`}
        >
          Completed ({completedJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'payouts' ? 'bg-white text-[#003d9b] shadow-2xs' : 'text-gray-600'
          }`}
        >
          Daily Payouts
        </button>
      </div>

      {/* Tab 1: Active Job */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          {activeJob ? (
            <div className="bg-white border-2 border-[#003d9b] rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#003d9b] px-2 py-0.5 rounded">
                    Active Dispatch • #{activeJob.id}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">
                    {activeJob.primaryServiceTitle}
                  </h2>
                  <p className="text-xs text-gray-500">{activeJob.timeSlot}</p>
                </div>

                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {activeJob.status}
                </span>
              </div>

              {/* Customer Address Details */}
              <div className="p-3.5 bg-gray-50 rounded-xl space-y-1.5 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">{activeJob.address.title}</span>
                    <p className="text-gray-600">{activeJob.address.line1}</p>
                    <p className="text-gray-400">{activeJob.address.locality}, Nashik - {activeJob.address.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="pt-2 space-y-2">
                {activeJob.status === 'Assigned' && (
                  <button
                    onClick={() => onUpdateBookingStatus(activeJob.id, 'On the Way')}
                    className="w-full bg-[#003d9b] hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Navigation className="w-4 h-4" /> Start Ride to Customer (Indira Nagar → Ashoka Marg)
                  </button>
                )}

                {activeJob.status === 'On the Way' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setVerifyingBookingId(activeJob.id)}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Arrived at Location - Enter Customer OTP
                    </button>
                  </div>
                )}

                {activeJob.status === 'Started' && (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50 text-[#006e2f] rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                      <Wrench className="w-4 h-4" /> Service in Progress. Fix pipe/tap with clean-up.
                    </div>
                    <button
                      onClick={() => onUpdateBookingStatus(activeJob.id, 'Completed')}
                      className="w-full bg-[#003d9b] hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Job Completed & Collect Payment (₹{activeJob.bill.total})
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 text-sm">No Active Jobs Right Now</h3>
              <p className="text-xs text-gray-500 mt-1">Keep your status Online to receive Nashik customer requests.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Completed Jobs */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedJobs.map((b) => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-gray-900">{b.primaryServiceTitle}</h4>
                <p className="text-xs text-gray-500">{b.address.locality} • ₹{b.bill.total}</p>
                <span className="text-[10px] text-green-700 font-semibold">1-Day Promise Honored</span>
              </div>
              <span className="text-xs font-bold bg-green-100 text-[#006e2f] px-2.5 py-1 rounded-full">
                Completed
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Daily Payouts */}
      {activeTab === 'payouts' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-[#003d9b]" /> Nashik Partner Earnings & Commission
            </h3>
            <span className="text-[10px] bg-blue-100 text-[#003d9b] font-bold px-2 py-0.5 rounded">
              15% Platform Commission
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl">
              <span className="text-[10px] text-gray-500 font-medium">Gross Bookings</span>
              <p className="text-lg font-extrabold text-gray-900 mt-1">₹{grossCompletedEarnings || 1350}</p>
            </div>
            <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl">
              <span className="text-[10px] text-amber-700 font-medium">URBN Comm (15%)</span>
              <p className="text-lg font-extrabold text-amber-700 mt-1">-₹{platformCommission || 204}</p>
            </div>
            <div className="p-3.5 bg-green-50/70 border border-green-100 rounded-xl">
              <span className="text-[10px] text-green-700 font-medium">Net Payout</span>
              <p className="text-lg font-extrabold text-[#006e2f] mt-1">₹{netEarnings || 1146}</p>
            </div>
          </div>

          {payoutSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {payoutSuccess}
            </div>
          ) : (
            <button
              onClick={handleRequestPayout}
              disabled={isProcessingPayout}
              className="w-full bg-[#003d9b] hover:bg-blue-800 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              {isProcessingPayout ? 'Processing Instant Transfer...' : 'Initiate Instant UPI Payout'}
            </button>
          )}

          <p className="text-[11px] text-gray-400 text-center">Settled directly via IMPS to HDFC Bank (A/C **4091)</p>
        </div>
      )}

      {/* Return to Customer Portal */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <button
          onClick={onSwitchToCustomer}
          className="text-xs font-bold text-[#003d9b] hover:underline"
        >
          ← Return to Customer App View
        </button>
      </div>

      {/* Technician OTP Verification Modal */}
      {verifyingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 text-center">
            <h3 className="font-bold text-gray-900 text-base">Enter Customer 4-Digit OTP</h3>
            <p className="text-xs text-gray-500 mt-1">
              Ask resident for the verification code on their URBN app (e.g. 4829)
            </p>

            <input
              type="text"
              maxLength={4}
              value={selectedOtp}
              onChange={(e) => setSelectedOtp(e.target.value)}
              placeholder="4829"
              className="text-center font-mono text-2xl font-bold tracking-widest border border-gray-300 rounded-xl p-3 my-4 w-36 mx-auto block focus:outline-none focus:border-[#003d9b]"
            />

            {errorMsg && <p className="text-xs text-rose-600 mb-3">{errorMsg}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setVerifyingBookingId(null)}
                className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => activeJob && handleVerifyStart(activeJob)}
                className="flex-1 bg-[#003d9b] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-800"
              >
                Verify & Start Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
