import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Tag,
  ShieldCheck,
  HelpCircle,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  CheckCircle2,
  Trash2,
  LogIn,
  Database,
  RefreshCw,
  Wrench,
  Sparkles,
  Sliders,
  ShieldAlert,
  Cpu,
} from 'lucide-react';
import { Address, AppRole, ProviderApplication } from '../types';
import { AVAILABLE_COUPONS, NASHIK_LOCALITIES } from '../data/mockData';
import { FirebaseUser, logoutUser } from '../lib/firebase';
import { apiClient } from '../services/apiClient';
import { ProviderApplicationModal } from './ProviderApplicationModal';

interface ProfileScreenProps {
  currentAddress: Address;
  savedAddresses: Address[];
  onSelectAddress: (addr: Address) => void;
  onAddAddress: (newAddr: Address) => void;
  onDeleteAddress: (id: string) => void;
  currentRole: AppRole;
  onChangeRole: (role: AppRole) => void;
  onOpenPromiseModal: () => void;
  onOpenSupport: () => void;
  currentUser: FirebaseUser | null;
  onOpenAuthModal: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentAddress,
  savedAddresses,
  onSelectAddress,
  onAddAddress,
  onDeleteAddress,
  currentRole,
  onChangeRole,
  onOpenPromiseModal,
  onOpenSupport,
  currentUser,
  onOpenAuthModal,
}) => {
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [showProviderAppModal, setShowProviderAppModal] = useState(false);
  const [appStatus, setAppStatus] = useState<ProviderApplication | null>(null);
  const [checkingApp, setCheckingApp] = useState(false);

  // Address form states
  const [newTitle, setNewTitle] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newLocality, setNewLocality] = useState(NASHIK_LOCALITIES[0]);
  const [newPincode, setNewPincode] = useState('422005');
  const [newLandmark, setNewLandmark] = useState('');
  const [isSubmittingAddr, setIsSubmittingAddr] = useState(false);

  const isAdminUser =
    currentUser?.email === 'someshnagote14@gmail.com' ||
    currentRole === 'admin';

  // Check provider application status for current user
  const checkApplicationStatus = async () => {
    if (!currentUser) return;
    setCheckingApp(true);
    try {
      const res = await apiClient.getProviderApplicationStatus(
        currentUser.uid,
        currentUser.email || undefined
      );
      if (res.success && res.application) {
        setAppStatus(res.application);
      }
    } catch (err) {
      console.error('Failed to check provider application status:', err);
    } finally {
      setCheckingApp(false);
    }
  };

  useEffect(() => {
    checkApplicationStatus();
  }, [currentUser]);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLine1.trim()) return;

    setIsSubmittingAddr(true);
    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      title: newTitle.trim(),
      line1: newLine1.trim(),
      locality: newLocality,
      city: 'Nashik',
      pincode: newPincode.trim() || '422005',
      landmark: newLandmark.trim() || undefined,
      isDefault: false,
    };

    try {
      await onAddAddress(newAddress);
      setNewTitle('');
      setNewLine1('');
      setNewLandmark('');
    } finally {
      setIsSubmittingAddr(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const userDisplayName = currentUser?.displayName || 'Rahul Deshmukh';
  const userEmail = currentUser?.email || 'someshnagote14@gmail.com';
  const userInitials = userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div id="profile-screen" className="max-w-[768px] mx-auto px-4 md:px-8 py-5 pb-28 animate-in fade-in duration-200">
      {/* User Header Card */}
      <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl p-5 shadow-2xs mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={userDisplayName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#003d9b] shadow-md shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#003d9b] to-blue-700 text-white flex items-center justify-center text-xl font-bold border-2 border-white shadow-md shrink-0">
                {userInitials || 'RD'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900">{userDisplayName}</h1>
                <span className="text-[10px] bg-green-100 text-[#006e2f] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Resident
                </span>
                {isAdminUser && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                    <ShieldCheck className="w-3 h-3 text-purple-600" /> Platform Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> {userEmail}
              </p>
              <p className="text-xs text-[#003d9b] font-medium flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5" /> {currentAddress.locality}, Nashik
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="text-xs font-bold text-white bg-[#003d9b] hover:bg-blue-800 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <Database className="w-3 h-3" />
              <span>Firestore Sync Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Options List */}
      <div className="space-y-4">
        {/* PRIVILEGED ADMIN COMMAND CENTER ENTRY (Only for authorized admin) */}
        {isAdminUser && (
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-5 shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <Cpu className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">Central Operations Command</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      Authoritative
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Live Nashik SLA radar, technician verification queue, reassignments &amp; audit trails.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onChangeRole('admin')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <span>Launch Admin Console</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* BECOME A SERVICE PARTNER ONBOARDING CARD */}
        <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-[#003d9b] text-white rounded-2xl shadow-md shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-gray-900">
                    Partner With URBN SERVICES Nashik
                  </h3>
                  {appStatus?.status === 'Approved' ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                      Partner Active
                    </span>
                  ) : appStatus?.status === 'Under Review' || appStatus?.status === 'Application Submitted' ? (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                      Application Under Review
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-blue-100 text-[#003d9b] px-2 py-0.5 rounded-full">
                      Earn ₹35,000+/mo
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Join 100+ verified plumbers, electricians, AC experts, and technicians. Zero joining fee and instant payouts.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {appStatus?.status === 'Approved' ? (
                <button
                  onClick={() => onChangeRole('provider')}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Open Technician Portal</span>
                </button>
              ) : appStatus?.status === 'Under Review' || appStatus?.status === 'Application Submitted' ? (
                <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-center">
                  Verification in progress by Nashik Hub
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!currentUser) {
                      onOpenAuthModal();
                    } else {
                      setShowProviderAppModal(true);
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#003d9b] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Apply as Service Partner</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Manage Addresses (Direct Real-time Firestore Persistence) */}
        <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl overflow-hidden shadow-2xs">
          <button
            onClick={() => setShowAddressManager(!showAddressManager)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#003d9b]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Saved Addresses</h3>
                <p className="text-xs text-gray-500">
                  {savedAddresses.length} locations stored in Firestore database
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showAddressManager ? 'rotate-90' : ''
              }`}
            />
          </button>

          {showAddressManager && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/60 space-y-3">
              <div className="space-y-2">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">{addr.title}</span>
                        {addr.id === currentAddress.id && (
                          <span className="text-[9px] bg-blue-100 text-[#003d9b] font-bold px-2 py-0.5 rounded-md">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 mt-1">{addr.line1}</p>
                      <p className="text-[11px] text-gray-500">
                        {addr.locality}, Nashik - {addr.pincode}
                        {addr.landmark ? ` (Near ${addr.landmark})` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {addr.id !== currentAddress.id && (
                        <button
                          onClick={() => onSelectAddress(addr)}
                          className="text-xs font-bold text-[#003d9b] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                        >
                          Select
                        </button>
                      )}
                      {savedAddresses.length > 1 && (
                        <button
                          onClick={() => onDeleteAddress(addr.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete address from Firestore"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Address Form */}
              <form onSubmit={handleAddNewAddress} className="pt-3 border-t border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">Add New Nashik Address</span>
                  <span className="text-[10px] text-gray-400">Saves to Firestore</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Address Title (e.g. Home, Office, In-Laws)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-xs border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-[#003d9b]"
                  />
                  <select
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    className="text-xs border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-[#003d9b]"
                  >
                    {NASHIK_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Flat / Building / Street"
                    value={newLine1}
                    onChange={(e) => setNewLine1(e.target.value)}
                    className="sm:col-span-2 text-xs border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-[#003d9b]"
                  />
                  <input
                    type="text"
                    placeholder="Pincode (e.g. 422005)"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="text-xs border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nearby Landmark (optional)"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-[#003d9b]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingAddr || !newTitle.trim() || !newLine1.trim()}
                  className="w-full bg-[#003d9b] text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  {isSubmittingAddr && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Address to Database</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Nashik Offers & Coupons */}
        <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl overflow-hidden shadow-2xs">
          <button
            onClick={() => setShowOffersModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Nashik Offers &amp; Promos</h3>
                <p className="text-xs text-gray-500">Save up to ₹100 on household services</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 1-Day Promise Policy */}
        <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl overflow-hidden shadow-2xs">
          <button
            onClick={onOpenPromiseModal}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-[#006e2f]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">The 1-Day Service Promise</h3>
                <p className="text-xs text-gray-500">24-Hour resolution SLA &amp; 30-Day warranty</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Help & Support */}
        <div className="bg-white border border-[#c3c6d6]/80 rounded-2xl overflow-hidden shadow-2xs">
          <button
            onClick={onOpenSupport}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Support &amp; FAQs</h3>
                <p className="text-xs text-gray-500">Nashik central helpline and ticket resolution</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Offers Modal */}
      {showOffersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-base">Active Nashik Offers</h3>
              <button
                onClick={() => setShowOffersModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {AVAILABLE_COUPONS.map((coupon) => (
                <div
                  key={coupon.code}
                  className="p-3.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-[#003d9b]">
                        {coupon.code}
                      </span>
                      <span className="text-[10px] bg-green-100 text-[#006e2f] font-bold px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium mt-0.5">{coupon.title}</p>
                    <p className="text-[11px] text-gray-500">{coupon.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Provider Application Modal */}
      <ProviderApplicationModal
        isOpen={showProviderAppModal}
        onClose={() => setShowProviderAppModal(false)}
        currentUser={currentUser}
        onApplicationSubmitted={(app) => {
          setAppStatus(app);
          setShowProviderAppModal(false);
        }}
      />
    </div>
  );
};
