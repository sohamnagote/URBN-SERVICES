import { Booking, BookingStatus, CategoryId, Review, SupportTicket } from '../types';

/**
 * URBN SERVICES Production Backend API Client
 */
export const apiClient = {
  // 1. Serviceability & 1-Day Promise SLA
  async checkServiceability(locality: string, pincode?: string, categoryId?: CategoryId) {
    const res = await fetch('/api/serviceability/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locality, pincode, categoryId }),
    });
    if (!res.ok) {
      throw new Error(`Serviceability check failed (${res.status})`);
    }
    return res.json();
  },

  async getServiceAreas() {
    const res = await fetch('/api/serviceability/areas');
    return res.json();
  },

  // 2. Bookings Lifecycle
  async createBooking(bookingPayload: any): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create booking');
    }
    return res.json();
  },

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    actorRole: 'customer' | 'provider' | 'operations' = 'operations',
    reason?: string
  ): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actorRole, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update booking status');
    }
    return res.json();
  },

  async verifyBookingOtp(
    bookingId: string,
    otp: string,
    providerId?: string
  ): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`/api/bookings/${bookingId}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, providerId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'OTP verification failed');
    }
    return res.json();
  },

  async cancelBooking(
    bookingId: string,
    reason?: string,
    actorRole: 'customer' | 'operations' = 'customer'
  ): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, actorRole }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to cancel booking');
    }
    return res.json();
  },

  // 3. Provider Operations & Payouts
  async getProviderDetails(providerId: string) {
    const res = await fetch(`/api/providers/${providerId}`);
    if (!res.ok) throw new Error('Failed to fetch provider details');
    return res.json();
  },

  async toggleProviderDuty(providerId: string, isOnline: boolean) {
    const res = await fetch(`/api/providers/${providerId}/duty`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline }),
    });
    return res.json();
  },

  async initiateProviderPayout(providerId: string) {
    const res = await fetch(`/api/providers/${providerId}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Payout request failed');
    }
    return res.json();
  },

  // 4. Central Dispatch & Operations Console
  async getOperationsDashboard() {
    const res = await fetch('/api/operations/dashboard');
    if (!res.ok) throw new Error('Failed to fetch operations dashboard');
    return res.json();
  },

  async reassignBookingProvider(bookingId: string, newProviderId: string, reason?: string) {
    const res = await fetch('/api/operations/reassign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, newProviderId, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Reassignment failed');
    }
    return res.json();
  },

  // 5. Payments
  async initiatePayment(bookingId: string, amount: number, paymentMethod: string, userId?: string) {
    const res = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amount, paymentMethod, userId }),
    });
    return res.json();
  },

  async confirmPayment(bookingId: string, transactionId: string, paymentMethod?: string, userId?: string) {
    const res = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, transactionId, paymentMethod, userId }),
    });
    return res.json();
  },

  // 6. Reviews
  async submitReview(payload: {
    bookingId?: string;
    rating: number;
    comment: string;
    authorName?: string;
    locality?: string;
    serviceTitle?: string;
    userId?: string;
  }): Promise<{ success: boolean; review: Review }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // 7. Support
  async createSupportTicket(payload: {
    bookingId?: string;
    subject: string;
    category: string;
    messageText: string;
    userId?: string;
    userName?: string;
  }): Promise<{ success: boolean; ticket: SupportTicket }> {
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // 8. Provider Onboarding & Application Pipeline
  async applyToBecomeProvider(payload: any) {
    const res = await fetch('/api/providers/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit provider application');
    }
    return res.json();
  },

  async getProviderApplicationStatus(userId: string, email?: string) {
    const url = `/api/providers/application-status/${userId}${email ? `?email=${encodeURIComponent(email)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return { status: 'Not Applied', application: null };
    return res.json();
  },

  // 9. Dedicated Secure Admin Command Center APIs
  async checkAdminAuth(adminEmail?: string) {
    const email = adminEmail || 'someshnagote14@gmail.com';
    const res = await fetch(`/api/admin/auth-check?email=${encodeURIComponent(email)}`, {
      headers: { 'x-admin-email': email },
    });
    return res.json();
  },

  async getAdminOverview(adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/admin/overview', {
      headers: { 'x-admin-email': adminEmail },
    });
    if (!res.ok) throw new Error('Failed to fetch admin overview');
    return res.json();
  },

  async getAdminBookings(
    filters: { status?: string; locality?: string; category?: string; search?: string } = {},
    adminEmail: string = 'someshnagote14@gmail.com'
  ) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.locality) params.append('locality', filters.locality);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
      headers: { 'x-admin-email': adminEmail },
    });
    if (!res.ok) throw new Error('Failed to fetch admin bookings');
    return res.json();
  },

  async reassignAdminBooking(bookingId: string, newProviderId: string, reason?: string, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch(`/api/admin/bookings/${bookingId}/reassign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify({ newProviderId, reason, adminEmail }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Reassignment failed');
    }
    return res.json();
  },

  async getAdminProviders(adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/admin/providers', {
      headers: { 'x-admin-email': adminEmail },
    });
    if (!res.ok) throw new Error('Failed to fetch providers');
    return res.json();
  },

  async updateAdminProviderStatus(providerId: string, verificationStatus: string, reason?: string, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch(`/api/admin/providers/${providerId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify({ verificationStatus, reason, adminEmail }),
    });
    return res.json();
  },

  async getAdminProviderApplications(adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/admin/provider-applications', {
      headers: { 'x-admin-email': adminEmail },
    });
    if (!res.ok) throw new Error('Failed to fetch provider applications');
    return res.json();
  },

  async reviewAdminProviderApplication(
    applicationId: string,
    action: 'approve' | 'reject',
    internalNotes?: string,
    rejectionReason?: string,
    adminEmail: string = 'someshnagote14@gmail.com'
  ) {
    const res = await fetch(`/api/admin/provider-applications/${applicationId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify({ action, internalNotes, rejectionReason, adminEmail }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Review submission failed');
    }
    return res.json();
  },

  async getAdminNotifications(adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/admin/notifications', {
      headers: { 'x-admin-email': adminEmail },
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markAdminNotificationRead(notificationId: string, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch(`/api/admin/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: { 'x-admin-email': adminEmail },
    });
    return res.json();
  },

  async markAllAdminNotificationsRead(adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/admin/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'x-admin-email': adminEmail },
    });
    return res.json();
  },

  async updateAdminNotificationPreferences(preferences: any, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/admin/notifications/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify(preferences),
    });
    return res.json();
  },

  async getAdminServiceAreas(adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/admin/service-areas', {
      headers: { 'x-admin-email': adminEmail },
    });
    return res.json();
  },

  async updateAdminServiceArea(hubId: string, data: any, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch(`/api/admin/service-areas/${hubId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAdminAuditLogs(limit: number = 100, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch(`/api/admin/audit-logs?limit=${limit}`, {
      headers: { 'x-admin-email': adminEmail },
    });
    return res.json();
  },

  async getAdminSystemHealth(adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/admin/system-health', {
      headers: { 'x-admin-email': adminEmail },
    });
    return res.json();
  },

  // -------------------------------------------------------------
  // 7. USER NOTIFICATION INBOX & PUSH DEVICE ENDPOINTS
  // -------------------------------------------------------------
  async getUserNotifications(userId: string = 'customer-rohit-nashik') {
    const res = await fetch(`/api/notifications/user?userId=${encodeURIComponent(userId)}`, {
      headers: { 'x-user-id': userId },
    });
    if (!res.ok) throw new Error('Failed to fetch user notifications');
    return res.json();
  },

  async markUserNotificationRead(notificationId: string, userId: string = 'customer-rohit-nashik') {
    const res = await fetch(`/api/notifications/user/${notificationId}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async markAllUserNotificationsRead(userId: string = 'customer-rohit-nashik') {
    const res = await fetch('/api/notifications/user/mark-all-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async getUserNotificationPreferences(userId: string = 'customer-rohit-nashik') {
    const res = await fetch(`/api/notifications/user/preferences?userId=${encodeURIComponent(userId)}`);
    return res.json();
  },

  async updateUserNotificationPreferences(userId: string, preferences: any) {
    const res = await fetch('/api/notifications/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, preferences }),
    });
    return res.json();
  },

  // -------------------------------------------------------------
  // 8. ADMIN CUSTOM NOTIFICATIONS & SCHEDULED ENGINE ENDPOINTS
  // -------------------------------------------------------------
  async estimateAudience(audience: any, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/notifications/admin/audience-estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify({ audience }),
    });
    if (!res.ok) throw new Error('Failed to estimate audience size');
    return res.json();
  },

  async getAdminNotificationJobs(
    params?: { status?: string; category?: string; search?: string },
    adminEmail: string = 'someshnagote14@gmail.com'
  ) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/notifications/admin/jobs?${query.toString()}`, {
      headers: { 'x-admin-email': adminEmail },
    });
    if (!res.ok) throw new Error('Failed to fetch notification jobs');
    return res.json();
  },

  async createAdminNotificationJob(payload: any, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/notifications/admin/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create notification job');
    }
    return res.json();
  },

  async getAdminNotificationJobDetails(jobId: string, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch(`/api/notifications/admin/jobs/${jobId}`, {
      headers: { 'x-admin-email': adminEmail },
    });
    if (!res.ok) throw new Error('Failed to fetch notification details');
    return res.json();
  },

  async cancelAdminScheduledNotification(jobId: string, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch(`/api/notifications/admin/jobs/${jobId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to cancel notification');
    }
    return res.json();
  },

  async sendAdminNotificationImmediately(jobId: string, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch(`/api/notifications/admin/jobs/${jobId}/send-now`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send notification immediately');
    }
    return res.json();
  },

  async deleteAdminNotificationJob(jobId: string, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch(`/api/notifications/admin/jobs/${jobId}`, {
      method: 'DELETE',
      headers: { 'x-admin-email': adminEmail },
    });
    return res.json();
  },

  async sendAdminTestNotification(payload: any, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/notifications/admin/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send test notification');
    }
    return res.json();
  },

  async getAdminNotificationTemplates(adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/notifications/admin/templates', {
      headers: { 'x-admin-email': adminEmail },
    });
    return res.json();
  },

  async saveAdminNotificationTemplate(template: any, adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/notifications/admin/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Failed to save template');
    return res.json();
  },

  async getAdminNotificationAnalytics(adminEmail: string = 'someshnagote14@gmail.com') {
    const res = await fetch('/api/notifications/admin/analytics', {
      headers: { 'x-admin-email': adminEmail },
    });
    return res.json();
  },
};
