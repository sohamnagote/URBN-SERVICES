import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Star,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Download,
} from 'lucide-react';
import { Booking } from '../types';
import { downloadPdfInvoice } from '../lib/pdfInvoiceGenerator';

interface BookingsListScreenProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onNewBookingClick: () => void;
  onOpenSupport: (bookingId: string) => void;
}

export const BookingsListScreen: React.FC<BookingsListScreenProps> = ({
  bookings,
  onSelectBooking,
  onNewBookingClick,
  onOpenSupport,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'active') return b.status !== 'Completed' && b.status !== 'Cancelled';
    if (activeFilter === 'completed') return b.status === 'Completed';
    return true;
  });

  return (
    <div id="bookings-list-screen" className="max-w-[768px] mx-auto px-4 md:px-8 py-5 pb-28 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Bookings</h1>
          <p className="text-xs text-gray-500">Track current jobs and view history in Nashik</p>
        </div>
        <button
          onClick={onNewBookingClick}
          className="bg-[#003d9b] text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-blue-800 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'all', label: 'All Bookings' },
          { id: 'active', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeFilter === tab.id
                ? 'bg-white text-[#003d9b] shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-3.5">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const isOngoing = booking.status === 'On the Way' || booking.status === 'Started' || booking.status === 'Assigned' || booking.status === 'Requested';
            return (
              <div
                key={booking.id}
                id={`booking-card-${booking.id}`}
                onClick={() => onSelectBooking(booking)}
                className="bg-white border border-[#c3c6d6]/80 rounded-2xl p-4 sm:p-5 hover:border-[#003d9b] transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.primaryServiceImage}
                      alt={booking.primaryServiceTitle}
                      className="w-13 h-13 rounded-xl object-cover border border-gray-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#003d9b] transition-colors">
                          {booking.primaryServiceTitle}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">#{booking.id}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      booking.status === 'Completed'
                        ? 'bg-green-100 text-[#006e2f]'
                        : booking.status === 'On the Way'
                        ? 'bg-blue-100 text-[#003d9b] animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {booking.status === 'Completed' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {booking.status}
                  </span>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{booking.date} • {booking.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{booking.address.locality}, Nashik</span>
                  </div>
                </div>

                {/* Footer / Provider Row */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {booking.provider ? (
                      <>
                        <span className="text-xs text-gray-500">Pro:</span>
                        <span className="text-xs font-semibold text-gray-800">{booking.provider.name}</span>
                        <span className="text-[11px] text-[#006e2f] flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-[#006e2f]" /> {booking.provider.rating}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-amber-700">Assigning technician...</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'Completed' && (
                      <button
                        type="button"
                        id={`list-download-invoice-${booking.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPdfInvoice(booking);
                        }}
                        className="text-[11px] font-bold text-[#003d9b] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Download Tax Invoice as PDF"
                      >
                        <Download className="w-3 h-3" />
                        <span>Invoice (PDF)</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1 text-xs font-bold text-[#003d9b]">
                      <span>{isOngoing ? 'Track Live' : 'View Details'}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No Bookings Found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">You have no bookings under this filter in Nashik.</p>
            <button
              onClick={onNewBookingClick}
              className="bg-[#003d9b] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Book a Service
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
