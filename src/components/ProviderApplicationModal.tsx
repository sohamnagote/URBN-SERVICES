import React, { useState } from 'react';
import { X, Wrench, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, MapPin, Truck } from 'lucide-react';
import { CategoryId, ProviderApplication } from '../types';
import { NASHIK_LOCALITIES, SERVICE_CATEGORIES } from '../data/mockData';
import { apiClient } from '../services/apiClient';
import { FirebaseUser } from '../lib/firebase';

interface ProviderApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: FirebaseUser | null;
  onApplicationSubmitted: (app: ProviderApplication) => void;
}

export const ProviderApplicationModal: React.FC<ProviderApplicationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onApplicationSubmitted,
}) => {
  const [applicantName, setApplicantName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('9822019482');
  const [experienceYears, setExperienceYears] = useState('4');
  const [primaryCategory, setPrimaryCategory] = useState<CategoryId>('plumbing');
  const [offeredCategories, setOfferedCategories] = useState<CategoryId[]>(['plumbing']);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Gangapur Road', 'College Road', 'Indira Nagar']);
  const [vehicleType, setVehicleType] = useState('Two Wheeler (Motorcycle / Scooter)');
  const [vehicleNumber, setVehicleNumber] = useState('MH 15 EZ 4821');
  const [governmentIdType, setGovernmentIdType] = useState('Aadhaar Card');
  const [governmentIdNumber, setGovernmentIdNumber] = useState('XXXX-XXXX-8921');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleCategory = (catId: CategoryId) => {
    if (offeredCategories.includes(catId)) {
      if (offeredCategories.length === 1) return; // Keep at least one
      setOfferedCategories(offeredCategories.filter((c) => c !== catId));
    } else {
      setOfferedCategories([...offeredCategories, catId]);
    }
  };

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      if (selectedAreas.length === 1) return;
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !phone.trim()) {
      setError('Please fill in your full name and valid mobile number.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.applyToBecomeProvider({
        userId: currentUser?.uid || `user-${Date.now()}`,
        applicantName: applicantName.trim(),
        email: email.trim() || currentUser?.email || '',
        phone: phone.trim(),
        experienceYears: Number(experienceYears) || 1,
        primaryCategory,
        offeredCategories,
        serviceAreas: selectedAreas,
        vehicleType,
        vehicleNumber: vehicleNumber.trim(),
        governmentIdType,
        governmentIdNumber: governmentIdNumber.trim(),
      });

      if (res.success && res.application) {
        setSuccess(true);
        setTimeout(() => {
          onApplicationSubmitted(res.application);
          onClose();
          setSuccess(false);
        }, 1200);
      } else {
        throw new Error(res.message || 'Submission failed');
      }
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      setError(err.message || 'Failed to submit application. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#003d9b] via-blue-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Join URBN SERVICES Partner Network
                </h2>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                  Nashik City
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Zero onboarding fee · Guaranteed weekly payouts · 1-Day Promise dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-blue-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <span className="font-bold block text-sm">Application Submitted to Operations Hub!</span>
                <span>Our Nashik team will verify your credentials within 2-4 hours.</span>
              </div>
            </div>
          )}

          <form id="provider-application-form" onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Basic Personal Info */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5 flex items-center gap-1.5">
                <span>1. Personal & Contact Information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Ramesh Jadhav"
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number (For Job SMS & OTP) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Trade & Experience */}
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                2. Primary Trade & Skills
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Primary Trade / Specialty <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={primaryCategory}
                    onChange={(e) => {
                      const cat = e.target.value as CategoryId;
                      setPrimaryCategory(cat);
                      if (!offeredCategories.includes(cat)) {
                        setOfferedCategories([...offeredCategories, cat]);
                      }
                    }}
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-[#003d9b]"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} Specialist
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Years of Professional Experience <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-[#003d9b]"
                  >
                    <option value="1">1 - 2 Years</option>
                    <option value="3">3 - 5 Years (Standard)</option>
                    <option value="6">6 - 9 Years (Experienced)</option>
                    <option value="10">10+ Years (Master Craftsman)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  All Services You Can Service (Select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const isSelected = offeredCategories.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-50 border-[#003d9b] text-[#003d9b] font-bold shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#003d9b]" />}
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Service Localities in Nashik */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#003d9b]" />
                  <span>3. Preferred Nashik Service Hubs</span>
                </h3>
                <span className="text-[10px] text-gray-400">{selectedAreas.length} selected</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-gray-50/70 rounded-2xl border border-gray-200">
                {NASHIK_LOCALITIES.map((loc) => {
                  const isSelected = selectedAreas.includes(loc);
                  return (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => toggleArea(loc)}
                      className={`text-left text-xs px-2.5 py-1.5 rounded-xl border transition-all truncate flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#003d9b] text-white border-[#003d9b] font-semibold'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate">{loc}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Mobility & Government ID */}
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-gray-600" />
                <span>4. Transportation & KYC Verification</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Available</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-[#003d9b]"
                  >
                    <option value="Two Wheeler (Motorcycle / Scooter)">Two Wheeler (Bike / Scooter)</option>
                    <option value="Commercial Three Wheeler / Cargo Auto">Commercial Auto / Cargo</option>
                    <option value="Four Wheeler (Van / Utility Vehicle)">Four Wheeler (Van / Car)</option>
                    <option value="Bicycle / Public Transit">Bicycle / Transit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Plate Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. MH 15 AB 1234"
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Government ID Type</label>
                  <select
                    value={governmentIdType}
                    onChange={(e) => setGovernmentIdType(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-[#003d9b]"
                  >
                    <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                    <option value="PAN Card">Permanent Account Number (PAN)</option>
                    <option value="Driving License">Maharashtra Driving License</option>
                    <option value="Voter ID">Voter ID Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ID Number / Reference</label>
                  <input
                    type="text"
                    value={governmentIdNumber}
                    onChange={(e) => setGovernmentIdNumber(e.target.value)}
                    placeholder="ID card number for background check"
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
              </div>
            </div>

            {/* Compliance note */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#003d9b] shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 leading-relaxed">
                By submitting, you agree to URBN SERVICES' Nashik Partner Code of Conduct, background checks, and the 1-Day Service Resolution SLA standard.
              </p>
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="px-6 py-2.5 rounded-xl bg-[#003d9b] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>Submit Partner Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
