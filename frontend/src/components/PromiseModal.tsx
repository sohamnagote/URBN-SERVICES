import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, RotateCcw, Award, X } from 'lucide-react';

interface PromiseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromiseModal: React.FC<PromiseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#003d9b] text-[#6bff8f] flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-[#006e2f] px-2 py-0.5 rounded">
              Nashik Exclusive Guarantee
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              The 1-Day Service Promise
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
          URBN SERVICES is built with a single mission for Nashik residents: prompt, honest, and reliable home repairs without endless follow-ups.
        </p>

        {/* Three Core Pillars */}
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-start gap-3.5">
            <div className="p-2 bg-[#003d9b] text-white rounded-xl shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">24-Hour Resolution Guarantee</h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                From the moment you book, our certified technician will resolve your issue within 24 hours. If we fail to meet this timeline, your service fee is waived.
              </p>
            </div>
          </div>

          <div className="p-4 bg-green-50/70 rounded-2xl border border-green-100 flex items-start gap-3.5">
            <div className="p-2 bg-[#006e2f] text-white rounded-xl shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">100% Background Verified Pros</h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Every plumber, electrician, and cleaner is locally vetted with Nashik police clearance, KYC, and technical trade tests.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 flex items-start gap-3.5">
            <div className="p-2 bg-amber-600 text-white rounded-xl shrink-0 mt-0.5">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">30-Day Free Re-work Warranty</h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                If the repaired tap leaks or electrical fitting falters within 30 days, we revisit and fix it completely free of charge.
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Note */}
        <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-500 mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#006e2f] shrink-0" />
          <span>Active in all major Nashik pin codes: 422001 to 422013.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#003d9b] text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition-colors text-sm shadow-md"
        >
          Got it, Close
        </button>
      </div>
    </div>
  );
};
