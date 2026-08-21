import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Bell,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Search,
  Wrench,
  Zap,
  Cpu,
  Snowflake,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Address, AppRole, CategoryId, ServiceItem } from '../types';
import { NASHIK_LOCALITIES, SERVICE_CATEGORIES, URBN_LOGO_URL } from '../data/mockData';
import { FirebaseUser } from '../lib/firebase';
import { NotificationCenterModal } from './NotificationCenterModal';

interface HeaderProps {
  currentAddress: Address;
  onSelectAddress: (address: Address) => void;
  savedAddresses: Address[];
  currentRole: AppRole;
  onChangeRole: (role: AppRole) => void;
  onNavigateHome: () => void;
  onSelectCategory?: (categoryId: CategoryId) => void;
  onSelectService?: (service: ServiceItem) => void;
  notificationCount: number;
  currentUser?: FirebaseUser | null;
  onOpenAuthModal?: () => void;
  onOpenProfile?: () => void;
  onOpenLiveMap?: () => void;
  onNavigateDeepLink?: (deepLink: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAddress,
  onSelectAddress,
  savedAddresses,
  currentRole,
  onChangeRole,
  onNavigateHome,
  onSelectCategory,
  onSelectService,
  notificationCount,
  currentUser,
  onOpenAuthModal,
  onOpenProfile,
  onOpenLiveMap,
  onNavigateDeepLink,
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [customLocality, setCustomLocality] = useState('');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd/Ctrl + K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchFocused(true);
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchFocused(true);
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute matched categories & services
  const query = searchQuery.trim().toLowerCase();

  const matchedCategories = query
    ? SERVICE_CATEGORIES.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.id.toLowerCase().includes(query) ||
          cat.description.toLowerCase().includes(query)
      )
    : [];

  const allServices = SERVICE_CATEGORIES.flatMap((c) => c.services);
  const matchedServices = query
    ? allServices.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.shortDesc.toLowerCase().includes(query) ||
          s.categoryId.toLowerCase().includes(query) ||
          (s.included && s.included.some((inc) => inc.toLowerCase().includes(query)))
      )
    : [];

  const popularSearches = [
    { label: 'AC Deep Service', catId: 'ac' as CategoryId },
    { label: 'Tap Leakage Repair', catId: 'plumbing' as CategoryId },
    { label: 'Fan Installation', catId: 'electrical' as CategoryId },
    { label: 'Bathroom Deep Clean', catId: 'cleaning' as CategoryId },
    { label: 'Washing Machine Check', catId: 'appliance' as CategoryId },
  ];

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'plumbing':
        return <Wrench className="w-4 h-4" />;
      case 'electrical':
        return <Zap className="w-4 h-4" />;
      case 'cleaning':
        return <Sparkles className="w-4 h-4" />;
      case 'appliance':
        return <Cpu className="w-4 h-4" />;
      case 'ac':
        return <Snowflake className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const handleSelectCategoryClick = (catId: CategoryId) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  const handleSelectServiceClick = (service: ServiceItem) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    if (onSelectService) {
      onSelectService(service);
    } else if (onSelectCategory) {
      onSelectCategory(service.categoryId);
    }
  };

  return (
    <>
      <header
        id="urbn-top-appbar"
        className="fixed top-0 left-0 w-full z-40 bg-[#f7f9fb] border-b border-[#c3c6d6]/60 flex items-center justify-between h-16 px-3 md:px-6 lg:px-8 transition-colors backdrop-blur-md bg-opacity-95"
      >
        {/* Left Section: Logo & Location */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Logo & Home click */}
          <button
            id="urbn-logo-btn"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 active:scale-95 transition-transform"
            title="URBN SERVICES Home"
          >
            <img
              src={URBN_LOGO_URL}
              alt="URBN SERVICES"
              className="h-7 md:h-9 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-bold text-base md:text-lg tracking-tight text-[#003d9b] hidden xs:flex items-center gap-1">
              URBN <span className="text-[#006e2f] text-[10px] md:text-xs font-semibold px-1.5 py-0.5 bg-green-100 rounded-md">SERVICES</span>
            </span>
          </button>

          {/* Location Selector */}
          <button
            id="location-selector-btn"
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 p-1 md:p-1.5 rounded-xl hover:bg-[#eceef0] active:scale-95 transition-all text-left group border border-transparent hover:border-gray-200"
            title="Change service location in Nashik"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#003d9b] group-hover:bg-[#003d9b] group-hover:text-white transition-colors shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] font-medium text-[#434654] uppercase tracking-wider flex items-center gap-0.5">
                Nashik <ChevronDown className="w-2.5 h-2.5 text-[#737685]" />
              </span>
              <span className="text-xs font-bold text-[#003d9b] truncate max-w-[90px] sm:max-w-[130px] md:max-w-[160px]">
                {currentAddress.locality}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar (Desktop & Tablet) */}
        <div
          ref={searchContainerRef}
          className="relative hidden md:block flex-1 max-w-md lg:max-w-lg mx-4"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737685]">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              id="header-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search services or categories (e.g. AC, plumbing, cleaning)..."
              className="w-full bg-white border border-[#c3c6d6] text-[#191c1e] placeholder:text-[#737685] text-xs lg:text-sm rounded-full py-2 pl-9.5 pr-14 focus:outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/15 shadow-2xs transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="hidden lg:inline-block text-[10px] font-mono text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Search Dropdown (Desktop) */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* If Query is empty: show popular suggestions and categories */}
              {!query ? (
                <div className="p-3.5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                      Popular Searches in Nashik
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {popularSearches.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleSelectCategoryClick(item.catId)}
                          className="text-xs font-medium bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-[#003d9b] border border-gray-200 hover:border-blue-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Search className="w-3 h-3 text-gray-400" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                      Browse All Categories
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SERVICE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategoryClick(cat.id)}
                          className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 text-left transition-all group"
                        >
                          <div className="p-1.5 rounded-lg bg-blue-50 text-[#003d9b] group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
                            {getCategoryIcon(cat.id)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 group-hover:text-[#003d9b]">
                              {cat.name}
                            </span>
                            <p className="text-[10px] text-gray-500">{cat.services.length} services</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Filtered Results */
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                  {/* Category Matches */}
                  {matchedCategories.length > 0 && (
                    <div className="p-3 bg-blue-50/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d9b] block mb-2">
                        Categories ({matchedCategories.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {matchedCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleSelectCategoryClick(cat.id)}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-blue-200/70 hover:border-[#003d9b] text-left transition-all group shadow-2xs"
                          >
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-blue-100 text-[#003d9b]">
                                {getCategoryIcon(cat.id)}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-gray-900 group-hover:text-[#003d9b]">
                                  {cat.name}
                                </span>
                                <span className="text-[10px] text-gray-500 block">
                                  {cat.services.length} Nashik Services
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#003d9b] group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Matches */}
                  {matchedServices.length > 0 ? (
                    <div>
                      <div className="p-2.5 bg-gray-50 flex justify-between items-center text-[11px] font-semibold text-gray-600">
                        <span>Services Matching "{searchQuery}" ({matchedServices.length})</span>
                        <span className="text-[#006e2f] text-[10px]">1-Day Promise SLA</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {matchedServices.map((service) => (
                          <div
                            key={service.id}
                            onClick={() => handleSelectServiceClick(service)}
                            className="p-3 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={service.image}
                                alt={service.title}
                                className="w-11 h-11 rounded-xl object-cover shrink-0 border border-gray-100"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#003d9b]">
                                    {service.title}
                                  </h4>
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                                    {service.categoryId}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                  {service.shortDesc}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-bold text-gray-900">₹{service.price}</span>
                                  <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {service.rating}
                                  </span>
                                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" /> {service.durationMin} min
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectServiceClick(service);
                              }}
                              className="text-xs font-bold text-white bg-[#003d9b] group-hover:bg-blue-800 px-3 py-1.5 rounded-lg shrink-0 shadow-2xs transition-colors"
                            >
                              Book
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    matchedCategories.length === 0 && (
                      <div className="p-6 text-center text-gray-500">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-gray-700">No services found for "{searchQuery}"</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Try searching for 'plumbing', 'AC', 'cleaning', 'switch', or 'pipe'.
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Mobile Search Toggle, Role Badge, Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {/* Mobile Search Button */}
          <button
            id="mobile-search-toggle-btn"
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => mobileInputRef.current?.focus(), 100);
            }}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Search services"
            title="Search services"
          >
            <Search className="w-5 h-5 text-[#003d9b]" />
          </button>

          {/* Live Map Button */}
          {onOpenLiveMap && (
            <button
              id="header-live-map-btn"
              onClick={onOpenLiveMap}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all shadow-2xs"
              title="View Nashik Live Service Grid & Map Radar"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Live Map</span>
            </button>
          )}

          {/* Admin / Provider Mode Indicator for Privileged Sessions */}
          {currentRole === 'admin' && (
            <div
              id="admin-session-badge"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-300 bg-purple-50 text-purple-900"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin Console</span>
            </div>
          )}
          {currentRole === 'provider' && (
            <div
              id="provider-session-badge"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-900"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Partner Mode</span>
            </div>
          )}

          {/* Notifications Button */}
          <button
            id="notifications-btn"
            aria-label="Notifications"
            onClick={() => setShowNotificationModal(true)}
            className="relative p-2 rounded-full hover:bg-[#eceef0] text-[#434654] active:scale-95 transition-all"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#f7f9fb]" />
            )}
          </button>

          {/* User Account / Sign In */}
          {currentUser ? (
            <button
              id="header-user-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition-all border border-blue-200"
              title={`Logged in as ${currentUser.displayName || currentUser.email}`}
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-[#003d9b]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#003d9b] text-white flex items-center justify-center text-[10px] font-bold">
                  {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          ) : (
            <button
              id="header-signin-btn"
              onClick={onOpenAuthModal}
              className="hidden xs:inline-flex items-center gap-1 text-xs font-bold text-[#003d9b] bg-white border border-[#003d9b]/40 hover:bg-blue-50 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95"
            >
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Search Overlay Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#f7f9fb] flex flex-col md:hidden animate-in fade-in duration-150">
          {/* Mobile Search Header */}
          <div className="p-3 bg-white border-b border-gray-200 flex items-center gap-2 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services or categories in Nashik..."
                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl py-2 pl-9 pr-8 focus:outline-none focus:border-[#003d9b] focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-xs font-bold text-[#003d9b] px-2 py-1.5 rounded-lg hover:bg-blue-50"
            >
              Cancel
            </button>
          </div>

          {/* Mobile Search Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!query ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Popular in Nashik
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {popularSearches.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleSelectCategoryClick(item.catId)}
                        className="text-xs font-medium bg-white hover:bg-blue-50 text-gray-700 hover:text-[#003d9b] border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5"
                      >
                        <Search className="w-3 h-3 text-gray-400" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    All Categories
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategoryClick(cat.id)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-200 text-left shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-50 text-[#003d9b]">
                            {getCategoryIcon(cat.id)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-900">{cat.name}</span>
                            <p className="text-xs text-gray-500">{cat.services.length} Services</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Matched Categories */}
                {matchedCategories.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d9b] block mb-2">
                      Matching Categories
                    </span>
                    <div className="space-y-2">
                      {matchedCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategoryClick(cat.id)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-blue-200 text-left shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-blue-100 text-[#003d9b]">
                              {getCategoryIcon(cat.id)}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-gray-900">{cat.name}</span>
                              <span className="text-xs text-gray-500 block">
                                {cat.services.length} services
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#003d9b]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Services */}
                {matchedServices.length > 0 ? (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                      Services ({matchedServices.length})
                    </span>
                    <div className="space-y-2">
                      {matchedServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => handleSelectServiceClick(service)}
                          className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-gray-900 truncate">
                                {service.title}
                              </h4>
                              <p className="text-[11px] text-gray-500 truncate">{service.shortDesc}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-gray-900">₹{service.price}</span>
                                <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {service.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectServiceClick(service);
                            }}
                            className="text-xs font-bold text-white bg-[#003d9b] px-3 py-1.5 rounded-xl shrink-0"
                          >
                            Book
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  matchedCategories.length === 0 && (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
                      <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-800">No results found for "{searchQuery}"</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try searching for 'AC', 'plumbing', 'cleaning', 'fan', or 'electrician'.
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#003d9b] rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Select Service Location</h3>
                  <p className="text-xs text-gray-500">Nashik City Hubs & 1-Day Promise Coverage</p>
                </div>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Saved Addresses */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Saved Nashik Addresses
              </span>
              <div className="space-y-2">
                {savedAddresses.map((addr) => {
                  const isSelected = addr.id === currentAddress.id;
                  return (
                    <button
                      key={addr.id}
                      onClick={() => {
                        onSelectAddress(addr);
                        setShowLocationModal(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-start justify-between transition-all ${
                        isSelected
                          ? 'border-[#003d9b] bg-blue-50/50 ring-1 ring-[#003d9b]'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{addr.title}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-[#006e2f] text-white px-1.5 py-0.2 rounded font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{addr.line1}</p>
                        <p className="text-[11px] text-gray-400">{addr.locality}, Nashik - {addr.pincode}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#003d9b] shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Localities Grid */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Popular Nashik Localities
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {NASHIK_LOCALITIES.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      const updated: Address = {
                        ...currentAddress,
                        locality: loc,
                        line1: `${loc} main road`,
                      };
                      onSelectAddress(updated);
                      setShowLocationModal(false);
                    }}
                    className={`text-xs text-left px-2.5 py-1.5 rounded-lg border transition-colors truncate ${
                      currentAddress.locality === loc
                        ? 'bg-blue-600 text-white border-blue-600 font-medium'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Location Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or type custom street / locality..."
                value={customLocality}
                onChange={(e) => setCustomLocality(e.target.value)}
                className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#003d9b]"
              />
              <button
                disabled={!customLocality.trim()}
                onClick={() => {
                  if (customLocality.trim()) {
                    onSelectAddress({
                      ...currentAddress,
                      locality: customLocality.trim(),
                      line1: `${customLocality.trim()}, Nashik`,
                    });
                    setShowLocationModal(false);
                    setCustomLocality('');
                  }
                }}
                className="bg-[#003d9b] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Push Notification & Inbox Drawer/Modal */}
      <NotificationCenterModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        userId={currentUser?.uid}
        userRole={currentRole}
        onDeepLink={(link) => {
          if (onNavigateDeepLink) {
            onNavigateDeepLink(link);
          }
        }}
      />
    </>
  );
};
