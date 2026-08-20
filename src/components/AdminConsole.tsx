import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Calendar,
  Users,
  UserCheck,
  Clock,
  MapPin,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  ChevronRight,
  Filter,
  Check,
  X,
  TrendingUp,
  DollarSign,
  Truck,
  FileText,
  Settings,
  ArrowUpRight,
  LogOut,
  Sliders,
  ExternalLink,
  Shield,
  Layers,
  Cpu,
  Database,
  Radio,
  Eye,
  Send,
  PlusCircle,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import {
  Booking,
  ProviderApplication,
  AdminNotification,
  AdminNotificationPreferences,
  ProviderRecord,
  PushNotificationJob,
} from '../types';
import { apiClient } from '../services/apiClient';
import { FirebaseUser } from '../lib/firebase';
import { NotificationComposer } from './admin/NotificationComposer';
import { ScheduledNotificationsList } from './admin/ScheduledNotificationsList';
import { NotificationHistoryView } from './admin/NotificationHistoryView';
import { NotificationDetailsModal } from './admin/NotificationDetailsModal';

interface AdminConsoleProps {
  currentUser?: FirebaseUser | null;
  onExitAdmin: () => void;
  onOpenBookingDetails?: (booking: Booking) => void;
}

type AdminTab =
  | 'overview'
  | 'bookings'
  | 'providers'
  | 'applications'
  | 'sla_hubs'
  | 'notifications'
  | 'audit';

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  onExitAdmin,
  onOpenBookingDetails,
}) => {
  const adminEmail = currentUser?.email || 'someshnagote14@gmail.com';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [overviewMetrics, setOverviewMetrics] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<AdminNotificationPreferences>({
    newBookings: true,
    providerArrivals: true,
    cancellations: true,
    newApplications: true,
    slaWarnings: true,
    minimumSeverity: 'low',
    soundEnabled: true,
  });
  const [hubs, setHubs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Custom Push Notification Engine States
  const [notificationJobs, setNotificationJobs] = useState<PushNotificationJob[]>([]);
  const [notificationSubTab, setNotificationSubTab] = useState<'composer' | 'scheduled' | 'history' | 'alerts'>('composer');
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<PushNotificationJob | null>(null);

  // Filter States for Bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Reassignment Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedBookingForReassign, setSelectedBookingForReassign] = useState<Booking | null>(null);
  const [selectedNewProviderId, setSelectedNewProviderId] = useState('');
  const [reassignReason, setReassignReason] = useState('Central Ops dispatch load balancing');
  const [reassigning, setReassigning] = useState(false);

  // Review Application Modal State
  const [selectedAppForReview, setSelectedAppForReview] = useState<ProviderApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [internalNotes, setInternalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Fetch initial data
  const loadAdminData = async () => {
    try {
      setError(null);
      const [
        overviewRes,
        bookingsRes,
        providersRes,
        appsRes,
        notifsRes,
        hubsRes,
        auditRes,
        healthRes,
        pushJobsRes,
      ] = await Promise.all([
        apiClient.getAdminOverview(adminEmail).catch(() => null),
        apiClient.getAdminBookings({}, adminEmail).catch(() => ({ bookings: [] })),
        apiClient.getAdminProviders(adminEmail).catch(() => ({ providers: [] })),
        apiClient.getAdminProviderApplications(adminEmail).catch(() => ({ applications: [] })),
        apiClient.getAdminNotifications(adminEmail).catch(() => ({ notifications: [], preferences: null })),
        apiClient.getAdminServiceAreas(adminEmail).catch(() => ({ hubs: [] })),
        apiClient.getAdminAuditLogs(100, adminEmail).catch(() => ({ logs: [] })),
        apiClient.getAdminSystemHealth(adminEmail).catch(() => null),
        apiClient.getAdminNotificationJobs({}, adminEmail).catch(() => ({ jobs: [] })),
      ]);

      if (overviewRes) setOverviewMetrics(overviewRes.metrics);
      if (bookingsRes?.bookings) setBookings(bookingsRes.bookings);
      if (providersRes?.providers) setProviders(providersRes.providers);
      if (appsRes?.applications) setApplications(appsRes.applications);
      if (notifsRes?.notifications) setNotifications(notifsRes.notifications);
      if (notifsRes?.preferences) setNotificationPreferences(notifsRes.preferences);
      if (hubsRes?.hubs) setHubs(hubsRes.hubs);
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
      if (healthRes) setSystemHealth(healthRes);
      if (pushJobsRes?.jobs) setNotificationJobs(pushJobsRes.jobs);
    } catch (err: any) {
      console.error('Failed to load admin console data:', err);
      setError(err.message || 'Error communicating with Admin backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // Auto-refresh every 12 seconds for real-time operations
    const interval = setInterval(() => {
      loadAdminData();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  // Reassignment Handler
  const handleExecuteReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReassign || !selectedNewProviderId) return;

    setReassigning(true);
    try {
      await apiClient.reassignAdminBooking(
        selectedBookingForReassign.id,
        selectedNewProviderId,
        reassignReason,
        adminEmail
      );
      setReassignModalOpen(false);
      setSelectedBookingForReassign(null);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to reassign provider');
    } finally {
      setReassigning(false);
    }
  };

  // Provider Status Change Handler
  const handleToggleProviderStatus = async (providerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Approved' ? 'Suspended' : 'Approved';
    const reason = prompt(`Reason for changing status to ${nextStatus}:`, 'Operational review');
    if (!reason) return;

    try {
      await apiClient.updateAdminProviderStatus(providerId, nextStatus, reason, adminEmail);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update provider status');
    }
  };

  // Application Review Handler
  const handleExecuteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForReview) return;

    setReviewing(true);
    try {
      await apiClient.reviewAdminProviderApplication(
        selectedAppForReview.id,
        reviewAction,
        internalNotes,
        rejectionReason,
        adminEmail
      );
      setSelectedAppForReview(null);
      setInternalNotes('');
      setRejectionReason('');
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  // Notification Mark Read
  const handleMarkNotifRead = async (notifId: string) => {
    await apiClient.markAdminNotificationRead(notifId, adminEmail);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotifsRead = async () => {
    await apiClient.markAllAdminNotificationsRead(adminEmail);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Filtered Bookings list
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const q = bookingSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.primaryServiceTitle.toLowerCase().includes(q) ||
      b.address?.locality.toLowerCase().includes(q) ||
      b.provider?.name.toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const pendingAppsCount = applications.filter((a) => a.status === 'Under Review' || a.status === 'Application Submitted').length;

  return (
    <div id="admin-operations-command-center" className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">
                URBN Central Command
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Nashik Live
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Authoritative Operations &amp; Partner Verification Portal
            </p>
          </div>
        </div>

        {/* Right Admin Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setActiveTab('notifications');
              setNotificationSubTab('composer');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5 active:scale-95 shrink-0"
            title="Compose and broadcast real push notification"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Notification</span>
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Central Data Stream"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden md:inline">Sync</span>
          </button>

          {/* Unread Alerts indicator */}
          <button
            onClick={() => {
              setActiveTab('notifications');
              setNotificationSubTab('alerts');
            }}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0f172a]">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Admin Identity Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
              SN
            </div>
            <div className="text-left">
              <span className="font-bold text-white block leading-tight">Somesh Nagote</span>
              <span className="text-[10px] text-purple-400 font-medium">Super Administrator</span>
            </div>
          </div>

          {/* Exit to Customer View */}
          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95"
            title="Return to standard customer experience"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Customer View</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-[#1e293b]/70 border-b border-slate-800 px-4 sm:px-8 py-2 sticky top-[57px] z-30 backdrop-blur-md overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'overview' as AdminTab, label: 'Overview Radar', icon: Activity },
            {
              id: 'bookings' as AdminTab,
              label: `Active Bookings (${bookings.length})`,
              icon: Calendar,
            },
            {
              id: 'providers' as AdminTab,
              label: `Technicians (${providers.length})`,
              icon: Users,
            },
            {
              id: 'applications' as AdminTab,
              label: `Partner Applications`,
              icon: UserCheck,
              badge: pendingAppsCount > 0 ? pendingAppsCount : null,
            },
            { id: 'sla_hubs' as AdminTab, label: '1-Day SLA & Hubs', icon: Clock },
            {
              id: 'notifications' as AdminTab,
              label: 'Alert Stream',
              icon: Bell,
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
            },
            { id: 'audit' as AdminTab, label: 'Audit Trail & Health', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-2xl text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* ----------------- TAB 1: OVERVIEW ----------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Metrics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Total Nashik Bookings</span>
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {overviewMetrics?.totalBookings || bookings.length}
                </div>
                <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{overviewMetrics?.activeJobsCount || 2} active in dispatch queue</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Duty Pros Online</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {overviewMetrics?.dutyProsCount || 3}{' '}
                  <span className="text-sm font-normal text-slate-400">/ {providers.length}</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  {pendingAppsCount} applications awaiting review
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">1-Day SLA Adherence</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {overviewMetrics?.slaAdherenceRate || '100%'}
                </div>
                <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Zero breaches in Nashik hubs</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Platform Revenue (15%)</span>
                  <DollarSign className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
                  {overviewMetrics?.platformRevenue || '₹1,420'}
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  GBV: {overviewMetrics?.grossBookingValue || '₹9,467'}
                </div>
              </div>
            </div>

            {/* Live Queue & Action Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Live Nashik Dispatch Queue</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time status of service requests, technician ETA, and OTP verification
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>View All Bookings</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Booking ID</th>
                      <th className="py-3 px-3">Service &amp; Locality</th>
                      <th className="py-3 px-3">Assigned Technician</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Bill Total</th>
                      <th className="py-3 px-3 text-right">Operations Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bookings.slice(0, 6).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-indigo-300">{b.id}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{b.primaryServiceTitle}</span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {b.address.locality}, Nashik
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {b.provider ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={b.provider.avatar}
                                alt={b.provider.name}
                                className="w-6 h-6 rounded-full object-cover border border-slate-700"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="font-semibold text-slate-200 block">
                                  {b.provider.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {b.provider.vehicleNumber}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              b.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : b.status === 'On the Way' || b.status === 'Arrived'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : b.status === 'Cancelled'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-200">
                          ₹{b.bill?.total || 499}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedBookingForReassign(b);
                                setSelectedNewProviderId(providers[0]?.id || '');
                                setReassignModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-bold border border-slate-700 transition-colors"
                            >
                              Reassign
                            </button>
                            {onOpenBookingDetails && (
                              <button
                                onClick={() => onOpenBookingDetails(b)}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Applications Review & Recent Audits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Partner Applications Queue */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>Pending Partner Applications ({pendingAppsCount})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 bg-slate-800/50 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{app.applicantName}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-indigo-950 text-indigo-300 rounded">
                            {app.primaryCategory}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {app.experienceYears}y exp · {app.phone} · {app.serviceAreas.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAppForReview(app);
                          setReviewAction('approve');
                          setActiveTab('applications');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      No pending applications at this time.
                    </p>
                  )}
                </div>
              </div>

              {/* Real-time Audit Trail Feed */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Real-time Operational Audits</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Full Logs
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-purple-300 font-bold">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-slate-500">by {log.actorRole}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">{log.reason}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: BOOKINGS ----------------- */}
        {activeTab === 'bookings' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search by ID, customer, locality, pro..."
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                {['all', 'Requested', 'Assigned', 'On the Way', 'Arrived', 'Started', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      bookingStatusFilter === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Full Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">ID &amp; Date</th>
                    <th className="py-3 px-3">Service</th>
                    <th className="py-3 px-3">Customer Locality</th>
                    <th className="py-3 px-3">Assigned Tech</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 font-mono">
                        <span className="font-bold text-indigo-300 block">{b.id}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(b.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white">{b.primaryServiceTitle}</td>
                      <td className="py-3.5 px-3 text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{b.address.locality}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                          {b.address.line1}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {b.provider ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={b.provider.avatar}
                              alt={b.provider.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-semibold text-slate-200 block">
                                {b.provider.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {b.provider.phone}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            b.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : b.status === 'On the Way' || b.status === 'Arrived'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : b.status === 'Cancelled'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white">
                        ₹{b.bill?.total || 499}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedBookingForReassign(b);
                            setSelectedNewProviderId(providers[0]?.id || '');
                            setReassignModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                        >
                          Reassign Pro
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- TAB 3: PROVIDERS DIRECTORY ----------------- */}
        {activeTab === 'providers' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">Registered Service Professionals</h2>
                <p className="text-xs text-slate-400">
                  Manage active technician pool, duty statuses, earnings settlements, and suspension controls.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((prov) => (
                <div
                  key={prov.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={prov.avatar}
                        alt={prov.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/40"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-white text-sm">{prov.name}</h3>
                          {prov.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-xs text-indigo-300 font-medium">{prov.profession}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Truck className="w-3 h-3 text-slate-500" />
                          {prov.vehicleNumber}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        prov.verificationStatus === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {prov.verificationStatus}
                    </span>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-800/60 p-3 rounded-2xl text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Rating</span>
                      <span className="text-xs font-bold text-amber-400">⭐ {prov.rating}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Jobs Done</span>
                      <span className="text-xs font-bold text-white">{prov.totalJobsCompleted}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Net Payout</span>
                      <span className="text-xs font-bold text-emerald-400">
                        ₹{prov.netEarnings.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Coverage hubs */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Service Localities</span>
                    <div className="flex flex-wrap gap-1">
                      {prov.serviceAreas.map((sa) => (
                        <span
                          key={sa}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {sa}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Duty Status:{' '}
                      <strong className={prov.isOnline ? 'text-emerald-400' : 'text-slate-500'}>
                        {prov.isOnline ? 'ONLINE' : 'OFFLINE'}
                      </strong>
                    </span>
                    <button
                      onClick={() => handleToggleProviderStatus(prov.id, prov.verificationStatus)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        prov.verificationStatus === 'Approved'
                          ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {prov.verificationStatus === 'Approved' ? 'Suspend Pro' : 'Approve Partner'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- TAB 4: PARTNER APPLICATIONS ----------------- */}
        {activeTab === 'applications' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-white">Partner Onboarding Applications Pipeline</h2>
              <p className="text-xs text-slate-400">
                Review submitted technician credentials, verify government KYC and assign Nashik coverage hubs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{app.applicantName}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            app.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : app.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                        Primary Trade: {app.primaryCategory.toUpperCase()} Specialist ({app.experienceYears}y experience)
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Phone: <strong className="text-white">{app.phone}</strong> · Email: {app.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* KYC & Vehicle Info */}
                  <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Government ID:</span>
                      <span className="font-semibold text-white">
                        {app.governmentIdType} ({app.governmentIdNumber})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vehicle:</span>
                      <span className="font-semibold text-white">
                        {app.vehicleType} ({app.vehicleNumber})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Applied On:</span>
                      <span className="text-slate-300">
                        {new Date(app.appliedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Coverage Areas */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Requested Service Areas:</span>
                    <div className="flex flex-wrap gap-1">
                      {app.serviceAreas.map((sa) => (
                        <span
                          key={sa}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {sa}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Review Actions */}
                  {app.status === 'Under Review' || app.status === 'Application Submitted' ? (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedAppForReview(app);
                          setReviewAction('reject');
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-900/80 text-rose-300 text-xs font-bold border border-rose-800 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppForReview(app);
                          setReviewAction('approve');
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        Approve &amp; Activate Partner
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                      Reviewed by {app.reviewedBy || 'Admin'} ({app.internalNotes || app.rejectionReason || 'Completed'})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- TAB 5: 1-DAY SLA & HUBS ----------------- */}
        {activeTab === 'sla_hubs' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-white">Nashik Hubs &amp; 1-Day Promise SLA</h2>
              <p className="text-xs text-slate-400">
                Configure geographic serviceability, active technician clusters, and 24-hour guarantee eligibility.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hubs.map((hub) => (
                <div
                  key={hub.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-bold text-white text-sm">{hub.name}</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active Hub
                    </span>
                  </div>

                  <div className="bg-slate-800/50 p-3 rounded-xl space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Duty Pros:</span>
                      <span className="font-bold text-white">{hub.activeProvidersCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Arrival ETA:</span>
                      <span className="font-bold text-emerald-400">{hub.avgEtaMinutes} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">1-Day Guarantee:</span>
                      <span className="font-bold text-indigo-300">
                        {hub.promiseEligible ? 'Enabled (100% SLA)' : 'Standard'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Covered Pincodes: <strong>{hub.pincodes.join(', ')}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- TAB 6: NOTIFICATIONS & PUSH ENGINE ----------------- */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Sub-Nav Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <span>Push Notifications &amp; Scheduling Engine</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compose real mobile notifications, schedule automated alerts, and inspect delivery telemetry.
                </p>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto overflow-x-auto">
                <button
                  onClick={() => setNotificationSubTab('composer')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    notificationSubTab === 'composer'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Composer</span>
                </button>

                <button
                  onClick={() => setNotificationSubTab('scheduled')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    notificationSubTab === 'scheduled'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Scheduled ({notificationJobs.filter((j) => j.status === 'Scheduled').length})</span>
                </button>

                <button
                  onClick={() => setNotificationSubTab('history')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    notificationSubTab === 'history'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Broadcast History</span>
                </button>

                <button
                  onClick={() => setNotificationSubTab('alerts')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    notificationSubTab === 'alerts'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Alerts ({unreadNotifsCount})</span>
                </button>
              </div>
            </div>

            {/* Sub-view 1: Composer */}
            {notificationSubTab === 'composer' && (
              <NotificationComposer
                adminEmail={adminEmail}
                onSuccess={(newJob) => {
                  setNotificationJobs((prev) => [newJob, ...prev]);
                  setNotificationSubTab(newJob.deliveryType === 'scheduled' ? 'scheduled' : 'history');
                }}
              />
            )}

            {/* Sub-view 2: Scheduled Queue */}
            {notificationSubTab === 'scheduled' && (
              <ScheduledNotificationsList
                jobs={notificationJobs}
                adminEmail={adminEmail}
                onRefresh={loadAdminData}
                onSelectJobDetails={(job) => setSelectedJobForDetails(job)}
                onDuplicateJob={(job) => {
                  setNotificationSubTab('composer');
                }}
              />
            )}

            {/* Sub-view 3: Broadcast History & Analytics */}
            {notificationSubTab === 'history' && (
              <NotificationHistoryView
                adminEmail={adminEmail}
                onSelectJobDetails={(job) => setSelectedJobForDetails(job)}
                onOpenComposer={() => setNotificationSubTab('composer')}
              />
            )}

            {/* Sub-view 4: Operations Alert Bus */}
            {notificationSubTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Operations Alert Bus</h3>
                    <p className="text-xs text-slate-400">
                      System stream of customer bookings, technician arrivals, cancellations, and partner applications.
                    </p>
                  </div>
                  <button
                    onClick={handleMarkAllNotifsRead}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700"
                  >
                    Mark All Read
                  </button>
                </div>

                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        notif.read
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                          : 'bg-slate-800/90 border-indigo-500/40 text-slate-200 shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            notif.category === 'New Booking'
                              ? 'bg-blue-500/20 text-blue-400'
                              : notif.category === 'New Provider Application'
                              ? 'bg-purple-500/20 text-purple-400'
                              : notif.category === 'Provider Arrived'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs sm:text-sm">{notif.title}</h4>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded">
                              {notif.category}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1.5 block">
                            {new Date(notif.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {!notif.read && (
                        <button
                          onClick={() => handleMarkNotifRead(notif.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white shrink-0"
                        >
                          Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 7: AUDIT & SYSTEM HEALTH ----------------- */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* System Health Section */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  <span>Platform Diagnostics &amp; System Health</span>
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SYSTEM OPTIMAL
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">API Server &amp; Latency</span>
                  <span className="font-bold text-emerald-400 text-sm mt-0.5 block">ONLINE (4ms)</span>
                </div>
                <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Gemini 3.5 AI &amp; Maps</span>
                  <span className="font-bold text-indigo-400 text-sm mt-0.5 block">CONNECTED</span>
                </div>
                <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Firestore Cloud DB</span>
                  <span className="font-bold text-purple-400 text-sm mt-0.5 block">SYNCED &amp; ACTIVE</span>
                </div>
                <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Dispatch Event Queue</span>
                  <span className="font-bold text-amber-400 text-sm mt-0.5 block">0 BACKLOG</span>
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl overflow-x-auto">
              <h3 className="font-bold text-white text-base mb-3">Immutable System Audit Logs</h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Actor Role</th>
                    <th className="py-2.5 px-3">Resource</th>
                    <th className="py-2.5 px-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-300">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 uppercase font-semibold text-[10px]">
                        {log.actorRole}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {log.resource}:{log.resourceId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ----------------- MODAL: REASSIGN TECHNICIAN ----------------- */}
      {reassignModalOpen && selectedBookingForReassign && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Reassign Service Professional</h3>
              <button
                onClick={() => setReassignModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Reassign booking <strong className="text-indigo-300">{selectedBookingForReassign.id}</strong> (
              {selectedBookingForReassign.primaryServiceTitle} in {selectedBookingForReassign.address.locality}).
            </p>

            <form onSubmit={handleExecuteReassign} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Verified Technician
                </label>
                <select
                  value={selectedNewProviderId}
                  onChange={(e) => setSelectedNewProviderId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {providers
                    .filter((p) => p.verificationStatus === 'Approved')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.profession} - {p.isOnline ? 'Online' : 'Offline'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Audit Reason for Reassignment
                </label>
                <input
                  type="text"
                  required
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Technician delayed in traffic, optimizing route"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {reassigning ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: REVIEW APPLICATION ----------------- */}
      {selectedAppForReview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">
                {reviewAction === 'approve' ? 'Approve Partner' : 'Reject Partner'} Application
              </h3>
              <button
                onClick={() => setSelectedAppForReview(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-800/60 rounded-2xl text-xs space-y-1">
              <p>
                Applicant: <strong className="text-white">{selectedAppForReview.applicantName}</strong>
              </p>
              <p>
                Trade: <strong className="text-indigo-400">{selectedAppForReview.primaryCategory}</strong> (
                {selectedAppForReview.experienceYears}y experience)
              </p>
              <p>Phone: {selectedAppForReview.phone}</p>
              <p>Gov ID: {selectedAppForReview.governmentIdType} ({selectedAppForReview.governmentIdNumber})</p>
            </div>

            <form onSubmit={handleExecuteReview} className="space-y-3">
              {reviewAction === 'approve' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Internal Verification Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="e.g. Identity verified via Aadhaar & background check cleared"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rejection Reason (Required)
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Incomplete ID proof, outside current Nashik coverage"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md ${
                    reviewAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {reviewing
                    ? 'Submitting...'
                    : reviewAction === 'approve'
                    ? 'Activate & Approve Partner'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Details & Logs Modal */}
      {selectedJobForDetails && (
        <NotificationDetailsModal
          job={selectedJobForDetails}
          onClose={() => setSelectedJobForDetails(null)}
        />
      )}
    </div>
  );
};
