import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Send,
  XCircle,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  Copy,
  Trash2,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { PushNotificationJob } from '../../types';
import { apiClient } from '../../services/apiClient';

interface ScheduledNotificationsListProps {
  jobs: PushNotificationJob[];
  adminEmail?: string;
  onRefresh: () => void;
  onSelectJobDetails: (job: PushNotificationJob) => void;
  onDuplicateJob?: (job: PushNotificationJob) => void;
}

export const ScheduledNotificationsList: React.FC<ScheduledNotificationsListProps> = ({
  jobs,
  adminEmail = 'someshnagote14@gmail.com',
  onRefresh,
  onSelectJobDetails,
  onDuplicateJob,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const scheduledJobs = jobs.filter((j) => {
    if (filterStatus === 'all') return true;
    return j.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleCancelSchedule = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled notification?')) return;
    setProcessingId(jobId);
    try {
      await apiClient.cancelAdminScheduledNotification(jobId, adminEmail);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel schedule');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendImmediately = async (jobId: string) => {
    if (!confirm('Send this notification immediately now to all target devices?')) return;
    setProcessingId(jobId);
    try {
      await apiClient.sendAdminNotificationImmediately(jobId, adminEmail);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to trigger immediate send');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Delete this notification record permanently?')) return;
    setProcessingId(jobId);
    try {
      await apiClient.deleteAdminNotificationJob(jobId, adminEmail);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Scheduled</span>
          </span>
        );
      case 'Processing':
      case 'Sending':
        return (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Processing Dispatch</span>
          </span>
        );
      case 'Sent':
        return (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Sent</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600">
            Cancelled
          </span>
        );
      case 'Failed':
        return (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'scheduled', label: 'Scheduled Queue' },
            { id: 'sent', label: 'Completed Broadcasts' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors self-end sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Jobs Table / Cards */}
      {scheduledJobs.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-400">No scheduled notifications in queue</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the Notification Composer to schedule automated promotional broadcasts or service reminders.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledJobs.map((job) => (
            <div
              key={job.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-white text-sm sm:text-base">{job.title}</h3>
                    {getStatusBadge(job.status)}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {job.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{job.message}</p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => onSelectJobDetails(job)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="View Full Delivery Details & Logs"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden md:inline">Logs</span>
                  </button>

                  {job.status === 'Scheduled' && (
                    <>
                      <button
                        onClick={() => handleSendImmediately(job.id)}
                        disabled={processingId === job.id}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95 disabled:opacity-50"
                        title="Override schedule and send right now"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Now</span>
                      </button>

                      <button
                        onClick={() => handleCancelSchedule(job.id)}
                        disabled={processingId === job.id}
                        className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold transition-colors disabled:opacity-50"
                        title="Cancel this scheduled notification"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {onDuplicateJob && (
                    <button
                      onClick={() => onDuplicateJob(job)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Duplicate as new draft in composer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/60 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Audience:</span>
                  <span className="font-semibold text-white">
                    {job.audience.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">
                    {job.status === 'Sent' ? 'Sent At:' : 'Scheduled For:'}
                  </span>
                  <span className="font-semibold text-indigo-300">
                    {job.scheduledFor
                      ? `${new Date(job.scheduledFor).toLocaleString('en-IN')} (${job.timezone})`
                      : job.sentAt
                      ? new Date(job.sentAt).toLocaleString('en-IN')
                      : 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Delivery Metrics:</span>
                  <span className="font-semibold text-emerald-400">
                    {job.stats.deliveredCount} Delivered ({job.stats.failedCount} Failed)
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Created By:</span>
                  <span className="font-semibold text-slate-200 truncate block">{job.createdBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
