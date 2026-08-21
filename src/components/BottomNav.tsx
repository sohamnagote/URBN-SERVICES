import React from 'react';
import { Home, Calendar, Headphones, User, MapPin } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeBookingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  activeBookingCount,
}) => {
  return (
    <nav
      id="urbn-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-2 bg-[#f7f9fb]/95 backdrop-blur-md border-t border-[#c3c6d6]/60 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-40 transition-all"
    >
      {/* Home Tab */}
      <button
        id="nav-home-btn"
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 active:scale-90 ${
          activeTab === 'home'
            ? 'bg-[#6bff8f] text-[#007432] font-bold shadow-xs'
            : 'text-[#434654] hover:text-[#003d9b]'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Home</span>
      </button>

      {/* Real-Time Live Map Tab */}
      <button
        id="nav-maps-btn"
        onClick={() => onTabChange('maps')}
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 active:scale-90 ${
          activeTab === 'maps'
            ? 'bg-[#6bff8f] text-[#007432] font-bold shadow-xs'
            : 'text-[#434654] hover:text-[#003d9b]'
        }`}
      >
        <MapPin className={`w-5 h-5 ${activeTab === 'maps' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Live Map</span>
        <span className="absolute top-0.5 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
      </button>

      {/* Bookings Tab */}
      <button
        id="nav-bookings-btn"
        onClick={() => onTabChange('bookings')}
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 active:scale-90 ${
          activeTab === 'bookings'
            ? 'bg-[#6bff8f] text-[#007432] font-bold shadow-xs'
            : 'text-[#434654] hover:text-[#003d9b]'
        }`}
      >
        <Calendar className={`w-5 h-5 ${activeTab === 'bookings' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Bookings</span>
        {activeBookingCount > 0 && activeTab !== 'bookings' && (
          <span className="absolute top-0 right-2 w-2 h-2 bg-[#003d9b] rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Support Tab */}
      <button
        id="nav-support-btn"
        onClick={() => onTabChange('support')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 active:scale-90 ${
          activeTab === 'support'
            ? 'bg-[#6bff8f] text-[#007432] font-bold shadow-xs'
            : 'text-[#434654] hover:text-[#003d9b]'
        }`}
      >
        <Headphones className={`w-5 h-5 ${activeTab === 'support' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Support</span>
      </button>

      {/* Profile Tab */}
      <button
        id="nav-profile-btn"
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 active:scale-90 ${
          activeTab === 'profile'
            ? 'bg-[#6bff8f] text-[#007432] font-bold shadow-xs'
            : 'text-[#434654] hover:text-[#003d9b]'
        }`}
      >
        <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Profile</span>
      </button>
    </nav>
  );
};

