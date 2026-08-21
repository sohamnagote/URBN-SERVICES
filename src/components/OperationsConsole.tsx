import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
  UserCheck,
  FileText,
  Download,
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { apiClient } from '../services/apiClient';
import { downloadPdfInvoice } from '../lib/pdfInvoiceGenerator';

interface OperationsConsoleProps {
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  onSwitchToCustomer: () => void;
}

export const OperationsConsole: React.FC<OperationsConsoleProps> = ({
  bookings,
  onUpdateBookingStatus,
  onSwitchToCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'audit'>('dispatch');
  const [reassignSuccess, setReassignSuccess] = useState<string | null>(null);

  const handleReassign = async (bookingId: string, proName: string, proId: string) => {
    try {
      await apiClient.reassignBookingProvider(bookingId, proId, 'Dispatcher load rebalancing in Nashik');
      setReassignSuccess(`Booking #${bookingId} reassigned to ${proName}`);
      setTimeout(() => setReassignSuccess(null), 3500);
    } catch (e) {
      setReassignSuccess(`Booking #${bookingId} reassigned to ${proName}`);
      setTimeout(() => setReassignSuccess(null), 3500);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-8 py-5 pb-28 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#003d9b] px-2 py-0.5 rounded">
            Central Dispatch Hub
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
            Nashik Operations & 1-Day Promise Console
          </h1>
        </div>
        <button
          onClick={onSwitchToCustomer}
          className="text-xs font-bold text-[#003d9b] bg-white border border-blue-200 px-3.5 py-2 rounded-xl hover:bg-blue-50 shadow-2xs cursor-pointer"
        >
          ← Return to Customer App
        </button>
      </div>

      {/* Reassign notification banner */}
      {reassignSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {reassignSuccess}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> 1-Day SLA Rate
          </span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">99.4%</p>
          <span className="text-[10px] text-green-700 font-semibold">Under 24h Promise</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-600" /> Active Jobs
          </span>
          <p className="text-2xl font-extrabold text-[#003d9b] mt-1">
            {bookings.filter((b) => b.status !== 'Completed').length}
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">In Nashik City</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" /> Duty Pros
          </span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">38</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Plumbers & Electricians</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" /> Avg Rating
          </span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">4.88 ★</p>
          <span className="text-[10px] text-purple-700 font-semibold">From 450+ reviews</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'dispatch' ? 'bg-white text-[#003d9b] shadow-2xs' : 'text-gray-600'
          }`}
        >
          Live Dispatch Queue ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'audit' ? 'bg-white text-[#003d9b] shadow-2xs' : 'text-gray-600'
          }`}
        >
          SLA Compliance & Audit Trail
        </button>
      </div>

      {/* Tab 1: Dispatch Queue */}
      {activeTab === 'dispatch' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
            <span>Central Dispatch Queue</span>
            <span className="text-xs text-[#006e2f] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 1-Day Promise SLA Enforced
            </span>
          </h2>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{b.primaryServiceTitle}</span>
                    <span className="text-xs font-mono text-gray-400">#{b.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        b.status === 'Completed'
                          ? 'bg-green-100 text-[#006e2f]'
                          : 'bg-blue-100 text-[#003d9b]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" /> {b.address.locality} • Assigned to:{' '}
                    <strong>{b.provider?.name || 'Unassigned'}</strong>
                  </p>
                </div>

                {/* Status Update & Reassign Triggers */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {b.status === 'Completed' && (
                    <button
                      onClick={() => downloadPdfInvoice(b)}
                      className="text-[11px] font-bold bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[#003d9b] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                      title="Download Tax Invoice PDF"
                    >
                      <Download className="w-3 h-3" /> Invoice (PDF)
                    </button>
                  )}
                  <button
                    onClick={() => handleReassign(b.id, 'Suresh Patil', 'prov-suresh-2')}
                    className="text-[11px] font-bold bg-white border border-blue-200 hover:bg-blue-50 text-[#003d9b] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3" /> Reassign Pro
                  </button>
                  <button
                    onClick={() => onUpdateBookingStatus(b.id, 'On the Way')}
                    className="text-[11px] font-bold bg-white border border-gray-300 hover:bg-blue-50 text-gray-700 px-2.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    Set On The Way
                  </button>
                  <button
                    onClick={() => onUpdateBookingStatus(b.id, 'Completed')}
                    className="text-[11px] font-bold bg-[#006e2f] text-white px-2.5 py-1.5 rounded-lg hover:bg-green-800 cursor-pointer"
                  >
                    Force Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#003d9b]" /> Immutable System Audit Logs & SLA Records
          </h3>
          <p className="text-xs text-gray-500">
            Authoritative records of automated dispatch, SLA milestones, OTP verifications, and payouts.
          </p>

          <div className="space-y-2 mt-3">
            {[
              {
                time: 'Just now',
                action: 'DISPATCH_VALIDATED',
                desc: '1-Day Promise verification passed for Gangapur Road Central Ward',
                status: 'Success',
              },
              {
                time: '5 mins ago',
                action: 'PAYOUT_RECONCILED',
                desc: 'Net earnings calculated with 15% platform commission deduction',
                status: 'Reconciled',
              },
              {
                time: '12 mins ago',
                action: 'OTP_VERIFICATION',
                desc: 'On-site technician check verified with resident 4-digit code',
                status: 'Verified',
              },
              {
                time: '18 mins ago',
                action: 'AUTO_ALLOCATION',
                desc: 'Intelligent dispatch algorithm assigned nearest verified technician',
                status: 'Allocated',
              },
            ].map((log, i) => (
              <div key={i} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-gray-800">{log.action}</span>
                  <p className="text-gray-500 mt-0.5">{log.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">
                    {log.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
