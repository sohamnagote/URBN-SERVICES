import React from 'react';
import {
  X,
  Send,
  Calendar,
  Clock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Users,
  ExternalLink,
  Shield,
  Tag,
  Copy,
} from 'lucide-react';
import { PushNotificationJob } from '../../types';

interface NotificationDetailsModalProps {
  job: PushNotificationJob | null;
  onClose: () => void;
}

export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  job,
  onClose,
}) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{job.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {job.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Job ID: {job.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Notification Message Preview */}
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Message Body &amp; Payload
            </span>
            <p className="text-sm text-slate-100 leading-relaxed">{job.message}</p>

            {job.deepLink && (
              <div className="pt-2 border-t border-slate-700 flex items-center gap-2 text-xs text-indigo-400">
                <ExternalLink className="w-4 h-4" />
                <span>
                  Deep Link: <strong>{job.deepLink.type}</strong> ({job.deepLink.label})
                  {job.deepLink.targetId && ` -> target: ${job.deepLink.targetId}`}
                </span>
              </div>
            )}
          </div>

          {/* Delivery Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Target Users</span>
              <span className="text-lg font-bold text-white">{job.stats.targetUserCount}</span>
            </div>
            <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Active Devices</span>
              <span className="text-lg font-bold text-indigo-300">{job.stats.activeDeviceCount}</span>
            </div>
            <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Delivered</span>
              <span className="text-lg font-bold text-emerald-400">{job.stats.deliveredCount}</span>
            </div>
            <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Failed / Invalid</span>
              <span className="text-lg font-bold text-rose-400">
                {job.stats.failedCount + (job.stats.invalidTokensCount || 0)}
              </span>
            </div>
          </div>

          {/* Job Configuration Details */}
          <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/40 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="font-semibold text-white">{job.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Audience Segmentation:</span>
              <span className="font-semibold text-indigo-300">
                {job.audience.type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Scheduled Time / Sent:</span>
              <span className="font-semibold text-white">
                {job.scheduledFor
                  ? `${new Date(job.scheduledFor).toLocaleString()} (${job.timezone})`
                  : job.sentAt
                  ? new Date(job.sentAt).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dispatched By:</span>
              <span className="font-semibold text-white">{job.createdBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Created Timestamp:</span>
              <span className="font-semibold text-slate-400">{new Date(job.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Device Delivery Logs Stream */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Real-time Push Gateway Delivery Logs ({job.deliveryLogs.length})
            </h4>

            {job.deliveryLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-800/30 rounded-xl">
                No delivery logs recorded yet. Logs populate as push endpoints acknowledge receipts.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {job.deliveryLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {log.status === 'Delivered' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-white block">{log.userId}</span>
                        <span className="text-[10px] text-slate-400">
                          {log.deviceId} · {log.platform.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.status === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
