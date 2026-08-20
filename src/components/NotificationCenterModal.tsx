import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Smartphone,
  Shield,
  Tag,
  Wrench,
  Truck,
  Sparkles,
  Clock,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { DeepLinkDestination, NotificationCategory, UserInboxNotification } from '../types';
import { apiClient } from '../services/apiClient';
import { pushClient } from '../services/pushNotificationClient';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userRole?: string;
  userEmail?: string;
  onNavigateDeepLink?: (deepLink: DeepLinkDestination) => void;
  onDeepLink?: (deepLink: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  userId = 'customer-rohit-nashik',
  userRole = 'customer',
  userEmail,
  onNavigateDeepLink,
  onDeepLink,
}) => {
  const [notifications, setNotifications] = useState<UserInboxNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'inbox' | 'preferences'>('inbox');
  
  // Push permission status
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);
  const [pushSuccessBanner, setPushSuccessBanner] = useState(false);

  // Preferences
  const [preferences, setPreferences] = useState({
    bookingUpdates: true,
    serviceReminders: true,
    promotionsAndOffers: true,
    systemAlerts: true,
    soundEnabled: true,
    pushEnabled: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getUserNotifications(userId);
      if (res.success) {
        setNotifications(res.notifications || []);
      }
      const prefRes = await apiClient.getUserNotificationPreferences(userId);
      if (prefRes.success && prefRes.preferences) {
        setPreferences(prefRes.preferences);
      }
    } catch (err) {
      console.warn('Failed to load user notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPushStatus(Notification.permission);
      }
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const normalizedRole = (userRole === 'admin' || userRole === 'provider' ? userRole : 'customer') as 'customer' | 'provider' | 'admin';

  const handleEnablePush = async () => {
    setIsRegisteringPush(true);
    try {
      const result = await pushClient.requestNotificationPermission(userId, normalizedRole, userEmail);
      setPushStatus(result.status);
      if (result.status === 'granted') {
        setPushSuccessBanner(true);
        setTimeout(() => setPushSuccessBanner(false), 4000);
      }
    } finally {
      setIsRegisteringPush(false);
    }
  };

  const handleMarkRead = async (notifId: string) => {
    try {
      await apiClient.markUserNotificationRead(notifId, userId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.warn('Error marking read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllUserNotificationsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Error marking all read:', err);
    }
  };

  const handleTogglePreference = async (key: string, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      await apiClient.updateUserNotificationPreferences(userId, { [key]: value });
    } catch (err) {
      console.warn('Error updating preferences:', err);
    }
  };

  const getCategoryIcon = (category: NotificationCategory, iconType?: string) => {
    if (iconType === 'truck' || category === 'Provider Update') {
      return <Truck className="w-4 h-4 text-amber-500" />;
    }
    if (iconType === 'sparkles' || category === 'Promotion') {
      return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
    if (iconType === 'shield' || category === 'Booking') {
      return <Shield className="w-4 h-4 text-blue-500" />;
    }
    if (iconType === 'wrench') {
      return <Wrench className="w-4 h-4 text-indigo-500" />;
    }
    if (iconType === 'clock' || category === 'Service Reminder') {
      return <Clock className="w-4 h-4 text-emerald-500" />;
    }
    return <Bell className="w-4 h-4 text-slate-600" />;
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'bookings') return n.category === 'Booking' || n.category === 'Provider Update';
    if (activeFilter === 'promotions') return n.category === 'Promotion';
    if (activeFilter === 'services') return n.category === 'Service Reminder';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl h-full sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-50 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Notifications &amp; Alerts</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Live service updates &amp; Nashik announcements</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab(activeTab === 'inbox' ? 'preferences' : 'inbox')}
              className={`p-2 rounded-xl transition-colors ${
                activeTab === 'preferences'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Notification Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Push Notification Activation Banner */}
        {pushStatus !== 'granted' && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3.5 sm:px-5 text-white flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-blue-200 shrink-0" />
              <div>
                <p className="text-xs font-bold leading-tight">Enable Real-Time Mobile Push</p>
                <p className="text-[11px] text-blue-100 leading-tight mt-0.5">
                  Get instant technician arrival and 1-Day Promise guarantee alerts.
                </p>
              </div>
            </div>
            <button
              onClick={handleEnablePush}
              disabled={isRegisteringPush}
              className="px-3 py-1.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-all shrink-0 active:scale-95 shadow-sm"
            >
              {isRegisteringPush ? 'Enabling...' : 'Enable Push'}
            </button>
          </div>
        )}

        {/* Push Success Toast */}
        {pushSuccessBanner && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center gap-2 justify-center animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            Push Notifications successfully activated on this device!
          </div>
        )}

        {/* Tab View 1: Inbox */}
        {activeTab === 'inbox' ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Filter pills & Mark All Read */}
            <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto bg-white shrink-0">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: `Unread (${unreadCount})` },
                  { id: 'bookings', label: 'Bookings' },
                  { id: 'promotions', label: 'Offers' },
                  { id: 'services', label: 'Reminders' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeFilter === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 shrink-0 px-2 py-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">No notifications here</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      You're all caught up! When you book services or new offers arrive in Nashik, they'll appear here.
                    </p>
                  </div>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      notif.read
                        ? 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
                        : 'bg-blue-50/50 border-blue-200/90 text-slate-900 shadow-xs hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs shrink-0 mt-0.5">
                        {getCategoryIcon(notif.category, notif.iconType)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs sm:text-sm font-bold truncate ${notif.read ? 'text-slate-800' : 'text-slate-900'}`}>
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                          <span>
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' · '}
                            {new Date(notif.timestamp).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="font-semibold text-slate-500 uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                            {notif.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Deep link button if attached */}
                    {notif.deepLink && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notif.id);
                          if (onNavigateDeepLink) {
                            onNavigateDeepLink(notif.deepLink!);
                          }
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs transition-colors self-center"
                      >
                        <span>{notif.deepLink.label || 'View'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Tab View 2: Preferences */
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Notification Preferences</h4>
              <p className="text-xs text-slate-500">
                Choose which notifications and mobile push alerts you receive.
              </p>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-xs">Transactional Booking Alerts</p>
                  <p className="text-[11px] text-slate-500">
                    Technician assignment, arrival alerts &amp; OTP verification.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.bookingUpdates}
                  onChange={(e) => handleTogglePreference('bookingUpdates', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-xs">Service Maintenance Reminders</p>
                  <p className="text-[11px] text-slate-500">
                    Upcoming appliance and plumbing filter tune-up suggestions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.serviceReminders}
                  onChange={(e) => handleTogglePreference('serviceReminders', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-xs">Promotions &amp; Seasonal Offers</p>
                  <p className="text-[11px] text-slate-500">
                    Nashik festival discounts, monsoon care packages &amp; coupons.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.promotionsAndOffers}
                  onChange={(e) => handleTogglePreference('promotionsAndOffers', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-xs">Sound &amp; Vibration</p>
                  <p className="text-[11px] text-slate-500">
                    Play notification tone on incoming priority dispatches.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={(e) => handleTogglePreference('soundEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Device Push Status:</span>
              <span className={`text-xs font-bold ${pushStatus === 'granted' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {pushStatus === 'granted' ? 'Active & Registered' : 'Not Granted'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
