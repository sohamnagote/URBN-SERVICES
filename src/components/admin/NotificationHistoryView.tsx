import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Smartphone,
  Eye,
  RefreshCw,
  Send,
  Users,
  BarChart3,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { PushNotificationJob } from '../../types';
import { apiClient } from '../../services/apiClient';

interface NotificationHistoryViewProps {
  adminEmail?: string;
  onSelectJobDetails: (job: PushNotificationJob) => void;
  onOpenComposer: () => void;
}

export const NotificationHistoryView: React.FC<NotificationHistoryViewProps> = ({
  adminEmail = 'someshnagote14@gmail.com',
  onSelectJobDetails,
  onOpenComposer,
}) => {
  const [jobs, setJobs] = useState<PushNotificationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analytics, setAnalytics] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAdminNotificationJobs(
        {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
        },
        adminEmail
      );
      if (res.success && res.jobs) {
        setJobs(res.jobs);
      }

      const analyticsRes = await apiClient.getAdminNotificationAnalytics(adminEmail);
      if (analyticsRes.success && analyticsRes.analytics) {
        setAnalytics(analyticsRes.analytics);
      }
    } catch (err) {
      console.warn('Failed to load notification history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, adminEmail]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Analytics Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Broadcasts</span>
            <Send className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-white">{analytics?.totalJobs ?? jobs.length}</p>
          <p className="text-[10px] text-slate-500">
            {analytics?.totalSent ?? 0} sent · {analytics?.totalScheduled ?? 0} scheduled
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Delivered Pushes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">
            {analytics?.totalDeliveredMessages ?? 0}
          </p>
          <p className="text-[10px] text-slate-500">
            {analytics?.totalFailedMessages ?? 0} push delivery retries
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Delivery Success Rate</span>
            <Percent className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-400">
            {analytics?.deliverySuccessRate ?? 100}%
          </p>
          <p className="text-[10px] text-slate-500">Real push gateway acknowledgment</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Push Devices</span>
            <Smartphone className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-purple-400">
            {analytics?.totalActiveRegisteredDevices ?? 5}
          </p>
          <p className="text-[10px] text-slate-500">Android, iOS Safari &amp; Web Push</p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, message, ID..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'Promotion', label: 'Promotions' },
            { id: 'Booking', label: 'Bookings' },
            { id: 'Service Reminder', label: 'Reminders' },
            { id: 'System', label: 'System' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Campaign Delivery History</h3>
          <span className="text-xs text-slate-400">{jobs.length} total records</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading broadcast history...</div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No matching notification campaigns found.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJobDetails(job)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 p-3 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-white text-sm">{job.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        job.status === 'Sent'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : job.status === 'Scheduled'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {job.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{job.message}</p>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">
                      {job.stats.deliveredCount} / {job.stats.activeDeviceCount || job.stats.targetUserCount}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {job.sentAt
                        ? new Date(job.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectJobDetails(job);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
