import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Calendar,
  Clock,
  Smartphone,
  Sparkles,
  Shield,
  Truck,
  Wrench,
  Tag,
  Users,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BookmarkPlus,
  RefreshCw,
  X,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  AudienceCriteria,
  DeepLinkDestination,
  DeepLinkType,
  DeliveryType,
  NotificationCategory,
  NotificationTemplate,
  PushNotificationJob,
  TargetAudienceType,
} from '../../types';
import { apiClient } from '../../services/apiClient';

interface NotificationComposerProps {
  adminEmail?: string;
  onSuccess: (job: PushNotificationJob) => void;
  onCancel?: () => void;
}

const NASHIK_AREAS = [
  'Gangapur Road',
  'College Road',
  'Indira Nagar',
  'Nashik Road',
  'Panchavati',
  'Mumbai Naka',
  'Mahatma Nagar',
  'Govind Nagar',
  'Satpur',
  'Ambad',
];

const CATEGORIES: NotificationCategory[] = [
  'Booking',
  'Provider Update',
  'Service Reminder',
  'Payment',
  'Support',
  'Promotion',
  'System',
  'Custom Admin Notification',
];

const ICONS = [
  { id: 'bell', label: 'Alert Bell', icon: Bell },
  { id: 'sparkles', label: 'Promo Sparkles', icon: Sparkles },
  { id: 'shield', label: '1-Day Promise Shield', icon: Shield },
  { id: 'truck', label: 'Transit Truck', icon: Truck },
  { id: 'wrench', label: 'Service Tool', icon: Wrench },
  { id: 'tag', label: 'Discount Tag', icon: Tag },
  { id: 'clock', label: 'Reminder Clock', icon: Clock },
];

export const NotificationComposer: React.FC<NotificationComposerProps> = ({
  adminEmail = 'someshnagote14@gmail.com',
  onSuccess,
  onCancel,
}) => {
  // Form States
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('Promotion');
  const [iconType, setIconType] = useState<string>('sparkles');
  const [audienceType, setAudienceType] = useState<TargetAudienceType>('all_users');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Gangapur Road', 'College Road']);
  const [customUserId, setCustomUserId] = useState('');

  // Deep Link States
  const [deepLinkType, setDeepLinkType] = useState<DeepLinkType>('home');
  const [deepLinkTargetId, setDeepLinkTargetId] = useState('');
  const [deepLinkLabel, setDeepLinkLabel] = useState('Open App');

  // Delivery States
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('send_now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // Templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateDescription, setTemplateDescription] = useState('');

  // Estimation & Testing States
  const [audienceEstimate, setAudienceEstimate] = useState<{ userCount: number; deviceCount: number }>({
    userCount: 0,
    deviceCount: 0,
  });
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);

  // Submitting States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set default schedule date & time to 2 hours in future
  useEffect(() => {
    const d = new Date(Date.now() + 2 * 3600 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    setScheduleDate(dateStr);
    setScheduleTime(`${hours}:${mins}`);
  }, []);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await apiClient.getAdminNotificationTemplates(adminEmail);
        if (res.success && res.templates) {
          setTemplates(res.templates);
        }
      } catch (err) {
        console.warn('Failed to load templates:', err);
      }
    };
    fetchTemplates();
  }, [adminEmail]);

  // Recalculate audience estimation whenever audience filters change
  useEffect(() => {
    const calculateEstimate = async () => {
      setIsEstimating(true);
      try {
        const audiencePayload: AudienceCriteria = {
          type: audienceType,
          serviceAreas: audienceType === 'service_areas' ? selectedAreas : undefined,
          selectedUserIds: audienceType === 'selected_users' && customUserId ? [customUserId] : undefined,
        };
        const res = await apiClient.estimateAudience(audiencePayload, adminEmail);
        if (res.success) {
          setAudienceEstimate({
            userCount: res.estimatedUserCount || 0,
            deviceCount: res.estimatedDeviceCount || 0,
          });
        }
      } catch (err) {
        console.warn('Estimation failed:', err);
      } finally {
        setIsEstimating(false);
      }
    };

    const timer = setTimeout(calculateEstimate, 250);
    return () => clearTimeout(timer);
  }, [audienceType, selectedAreas, customUserId, adminEmail]);

  const handleApplyTemplate = (tmpl: NotificationTemplate) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setCategory(tmpl.category);
    if (tmpl.iconType) setIconType(tmpl.iconType);
    if (tmpl.deepLink) {
      setDeepLinkType(tmpl.deepLink.type);
      setDeepLinkTargetId(tmpl.deepLink.targetId || '');
      setDeepLinkLabel(tmpl.deepLink.label || 'View');
    }
    if (tmpl.audienceSuggestion) {
      setAudienceType(tmpl.audienceSuggestion);
    }
  };

  const handleSendTestNotification = async () => {
    if (!title.trim() || !message.trim()) {
      setErrorMessage('Please fill in Title and Message before sending a test notification.');
      return;
    }
    setIsSendingTest(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.sendAdminTestNotification(
        {
          title: title.trim(),
          message: message.trim(),
          category,
          iconType,
          deepLink: {
            type: deepLinkType,
            targetId: deepLinkTargetId || undefined,
            label: deepLinkLabel,
          },
        },
        adminEmail
      );
      if (res.success) {
        setTestNotificationStatus(res.message);
        setTimeout(() => setTestNotificationStatus(null), 5000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send test push notification');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!title.trim() || !message.trim()) return;
    try {
      const res = await apiClient.saveAdminNotificationTemplate(
        {
          title: title.trim(),
          message: message.trim(),
          category,
          iconType,
          deepLink: {
            type: deepLinkType,
            targetId: deepLinkTargetId || undefined,
            label: deepLinkLabel,
          },
          audienceSuggestion: audienceType,
          description: templateDescription || 'Custom saved admin template',
        },
        adminEmail
      );
      if (res.success && res.template) {
        setTemplates((prev) => [...prev, res.template]);
        setShowSaveTemplateModal(false);
        setTemplateDescription('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save template');
    }
  };

  const handleFinalSubmit = async () => {
    setErrorMessage(null);
    if (!title.trim() || !message.trim()) {
      setErrorMessage('Title and Message body are required.');
      return;
    }

    let scheduledForIso: string | undefined = undefined;
    if (deliveryType === 'scheduled') {
      if (!scheduleDate || !scheduleTime) {
        setErrorMessage('Please specify both Date and Time for scheduled delivery.');
        return;
      }
      const combined = new Date(`${scheduleDate}T${scheduleTime}:00`);
      if (isNaN(combined.getTime()) || combined.getTime() <= Date.now()) {
        setErrorMessage('Schedule time must be strictly in the future.');
        return;
      }
      scheduledForIso = combined.toISOString();
    }

    setIsSubmitting(true);
    try {
      const audience: AudienceCriteria = {
        type: audienceType,
        serviceAreas: audienceType === 'service_areas' ? selectedAreas : undefined,
        selectedUserIds: audienceType === 'selected_users' && customUserId ? [customUserId] : undefined,
      };

      const deepLink: DeepLinkDestination = {
        type: deepLinkType,
        targetId: deepLinkTargetId || undefined,
        label: deepLinkLabel || 'Open App',
      };

      const payload = {
        title: title.trim(),
        message: message.trim(),
        category,
        iconType,
        audience,
        deepLink,
        deliveryType,
        scheduledFor: scheduledForIso,
        timezone,
        adminEmail,
      };

      const res = await apiClient.createAdminNotificationJob(payload, adminEmail);
      if (res.success && res.job) {
        setShowConfirmModal(false);
        onSuccess(res.job);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Template Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-400" />
            <span>Create &amp; Dispatch Push Notification</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compose instant or scheduled real mobile push notifications for Nashik customers &amp; providers.
          </p>
        </div>

        {/* Template Quick Pick */}
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              const tmpl = templates.find((t) => t.id === e.target.value);
              if (tmpl) handleApplyTemplate(tmpl);
            }}
            defaultValue=""
            className="bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="" disabled>
              ⚡ Load Quick Template...
            </option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.category})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowSaveTemplateModal(true)}
            disabled={!title.trim() || !message.trim()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Save current inputs as reusable template"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Save Template</span>
          </button>
        </div>
      </div>

      {/* Error & Test Banners */}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-4 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {testNotificationStatus && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 p-4 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{testNotificationStatus}</span>
        </div>
      )}

      {/* Main 2-Column Composer: Left = Inputs, Right = Live Phone Preview & Estimation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Content */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              1. Notification Content &amp; Category
            </h3>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Notification Title *</label>
                <span className="text-[10px] text-slate-400">{title.length}/60 chars</span>
              </div>
              <input
                type="text"
                maxLength={60}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monsoon Home Care: 20% Off Drainage & AC"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Message Body *</label>
                <span className="text-[10px] text-slate-400">{message.length}/180 chars</span>
              </div>
              <textarea
                rows={3}
                maxLength={180}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Prepare your home for Nashik rains with express waterproofing and deep cleaning. Guaranteed 24-hr completion."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
              />
            </div>

            {/* Category & Icon Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Display Icon</label>
                <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                  {ICONS.map((item) => {
                    const IconCmp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIconType(item.id)}
                        className={`p-2 rounded-lg transition-all ${
                          iconType === item.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                        }`}
                        title={item.label}
                      >
                        <IconCmp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Target Audience */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                2. Target Audience &amp; Segmentation
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {isEstimating ? 'Estimating...' : `${audienceEstimate.userCount} users (${audienceEstimate.deviceCount} devices)`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'all_users', label: 'All Users (Customers + Pros)', desc: 'Full platform broadcast' },
                { id: 'customers', label: 'All Customers Only', desc: 'Registered household clients' },
                { id: 'providers', label: 'Verified Providers Only', desc: 'Onboarded Nashik technicians' },
                { id: 'service_areas', label: 'Specific Nashik Localities', desc: 'Corridor-targeted announcement' },
                { id: 'active_bookings', label: 'Users with Active Bookings', desc: 'In-flight service holders' },
                { id: 'completed_bookings', label: 'Past Completed Customers', desc: 'Retention & service reminders' },
                { id: 'inactive_users', label: 'Inactive Users (14+ Days)', desc: 'Re-engagement promotion' },
                { id: 'selected_users', label: 'Specific User ID', desc: 'Direct 1-on-1 dispatch' },
              ].map((aud) => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => setAudienceType(aud.id as TargetAudienceType)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    audienceType === aud.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-xs leading-snug">{aud.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{aud.desc}</p>
                </button>
              ))}
            </div>

            {/* Sub-selectors for Service Areas */}
            {audienceType === 'service_areas' && (
              <div className="pt-2 space-y-2 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Target Nashik Service Corridors:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {NASHIK_AREAS.map((area) => {
                    const isSelected = selectedAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedAreas.length > 1) {
                              setSelectedAreas(selectedAreas.filter((a) => a !== area));
                            }
                          } else {
                            setSelectedAreas([...selectedAreas, area]);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-xl font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-selector for Selected User ID */}
            {audienceType === 'selected_users' && (
              <div className="pt-2 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Target User ID or Email:
                </label>
                <input
                  type="text"
                  value={customUserId}
                  onChange={(e) => setCustomUserId(e.target.value)}
                  placeholder="e.g. customer-rohit-nashik or user@gmail.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Section 3: Deep Link Navigation */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              3. Deep Link Action (On Tap)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination</label>
                <select
                  value={deepLinkType}
                  onChange={(e) => setDeepLinkType(e.target.value as DeepLinkType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="home">Home Screen</option>
                  <option value="booking_details">Booking Details</option>
                  <option value="active_booking">Live Tracking</option>
                  <option value="service_page">Service Category Page</option>
                  <option value="support_ticket">Support Center</option>
                  <option value="notification_center">Notification Center</option>
                  <option value="promotion">Special Offers Modal</option>
                </select>
              </div>

              {deepLinkType === 'service_page' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category ID</label>
                  <select
                    value={deepLinkTargetId}
                    onChange={(e) => setDeepLinkTargetId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="cleaning">Cleaning &amp; Pest Control</option>
                    <option value="plumbing">Plumbing &amp; Leakage</option>
                    <option value="electrical">Electrical &amp; Wiring</option>
                    <option value="appliance">AC &amp; Appliance Care</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={deepLinkTargetId}
                    onChange={(e) => setDeepLinkTargetId(e.target.value)}
                    placeholder="e.g. UB-89421 or plumbing"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Action Button Text</label>
                <input
                  type="text"
                  value={deepLinkLabel}
                  onChange={(e) => setDeepLinkLabel(e.target.value)}
                  placeholder="e.g. View Booking or Claim Offer"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Schedule vs Send Now */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              4. Delivery Mode &amp; Scheduler
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('send_now')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  deliveryType === 'send_now'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Send Immediately</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('scheduled')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  deliveryType === 'scheduled'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule for Later</span>
              </button>
            </div>

            {deliveryType === 'scheduled' && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Asia/Kolkata">IST (Asia/Kolkata, UTC+5:30)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Phone Mock Preview & Action Triggers (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Mobile Notification Preview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>Live Phone Push Preview</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                PREVIEW ONLY
              </span>
            </div>

            {/* Mobile Lockscreen Mock Container */}
            <div className="relative mx-auto w-full max-w-[320px] bg-slate-950 border-4 border-slate-800 rounded-[36px] p-4 shadow-2xl overflow-hidden aspect-[9/16] max-h-[460px] flex flex-col justify-between">
              {/* Phone Speaker & Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

              {/* Time & Date Display */}
              <div className="text-center my-2 space-y-0.5">
                <div className="text-3xl font-extralight text-white font-mono">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Push Notification Banner */}
              <div className="my-auto bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                      U
                    </div>
                    <span className="text-[11px] font-bold text-white tracking-tight">URBN SERVICES</span>
                  </div>
                  <span className="text-[9px] text-slate-400">now</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">
                    {title || 'Your Notification Title Here'}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-3 leading-tight mt-0.5">
                    {message || 'Compose your message body to see live formatting and character fitting.'}
                  </p>
                </div>

                {deepLinkLabel && (
                  <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-indigo-400 font-semibold">
                    <span>{deepLinkLabel}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Lockscreen footer bar */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
            </div>

            {/* Test Notification Action Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSendTestNotification}
                disabled={isSendingTest || !title.trim()}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>{isSendingTest ? 'Sending Test...' : 'Send Test to My Admin Device'}</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                Safely tests appearance on your phone without sending to users.
              </p>
            </div>
          </div>

          {/* Summary & Final Dispatch Actions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Target Recipients:</span>
                <strong className="text-white">
                  {audienceEstimate.userCount} Users ({audienceEstimate.deviceCount} Devices)
                </strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Execution:</span>
                <strong className="text-indigo-400">
                  {deliveryType === 'send_now' ? 'Immediate Broadcast' : `Scheduled (${scheduleDate} ${scheduleTime})`}
                </strong>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={!title.trim() || !message.trim()}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{deliveryType === 'send_now' ? 'Dispatch Notification' : 'Confirm Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- STEP 2 CONFIRMATION MODAL ----------------- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Confirm Push Notification</span>
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You are about to {deliveryType === 'send_now' ? 'immediately broadcast' : 'schedule'} this push notification:
            </p>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Title:</span>
                <span className="font-bold text-white text-sm">{title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Message:</span>
                <span className="text-slate-200">{message}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Audience:</span>
                  <span className="font-bold text-indigo-300">{audienceType.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Estimated Devices:</span>
                  <span className="font-bold text-emerald-400">{audienceEstimate.deviceCount} Devices</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                {isSubmitting ? 'Processing...' : 'Authorize & Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SAVE TEMPLATE MODAL ----------------- */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
            <h3 className="font-bold text-base">Save as Reusable Template</h3>
            <p className="text-xs text-slate-400">
              Save "{title}" so operations admins can trigger this campaign again with 1 click.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Template Description
              </label>
              <input
                type="text"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="e.g. Seasonal monsoon maintenance reminder"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAsTemplate}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
