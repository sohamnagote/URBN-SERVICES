import {
  Address,
  AdminNotification,
  AdminNotificationCategory,
  AdminNotificationPreferences,
  Booking,
  BookingStatus,
  CategoryId,
  Provider,
  ProviderApplication,
  Review,
  SupportTicket,
} from '../src/types';

export const AUTHORIZED_ADMIN_EMAILS = new Set<string>([
  'someshnagote14@gmail.com',
]);

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  previousState?: any;
  newState?: any;
  reason?: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  userId?: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface ProviderRecord extends Provider {
  userId: string;
  email: string;
  verificationStatus: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Suspended';
  isOnline: boolean;
  categories: CategoryId[];
  serviceAreas: string[];
  totalJobsCompleted: number;
  grossEarnings: number;
  platformCommission: number;
  netEarnings: number;
  payoutStatus: 'Pending' | 'Processed';
}

export interface ServiceAreaConfig {
  id: string;
  locality: string;
  pincode: string;
  hubName: string;
  isServiceable: boolean;
  promiseEligible: boolean;
  avgEtaMinutes: number;
  activeProsCount: number;
  coords: { lat: number; lng: number };
}

// In-Memory Authoritative Store for Production Backend
class BackendStore {
  public bookings: Map<string, Booking> = new Map();
  public providers: Map<string, ProviderRecord> = new Map();
  public providerApplications: Map<string, ProviderApplication> = new Map();
  public notifications: AdminNotification[] = [];
  public notificationPreferences: AdminNotificationPreferences = {
    newBooking: true,
    providerArrival: true,
    providerCancellation: true,
    slaRiskAlerts: true,
    slaMissAlerts: true,
    paymentFailures: true,
    providerApplications: true,
    supportEscalations: true,
    systemAlerts: true,
  };
  public reviews: Map<string, Review> = new Map();
  public supportTickets: Map<string, SupportTicket> = new Map();
  public auditLogs: AuditLogRecord[] = [];
  public analyticsEvents: AnalyticsEvent[] = [];
  public platformCommissionRate = 0.15; // 15% platform commission

  public serviceAreas: ServiceAreaConfig[] = [
    {
      id: 'nashik-gangapur',
      locality: 'Gangapur Road',
      pincode: '422013',
      hubName: 'Gangapur Central Hub',
      isServiceable: true,
      promiseEligible: true,
      avgEtaMinutes: 12,
      activeProsCount: 14,
      coords: { lat: 20.015, lng: 73.762 },
    },
    {
      id: 'nashik-college-rd',
      locality: 'College Road',
      pincode: '422005',
      hubName: 'College Road Express Station',
      isServiceable: true,
      promiseEligible: true,
      avgEtaMinutes: 14,
      activeProsCount: 12,
      coords: { lat: 20.005, lng: 73.765 },
    },
    {
      id: 'nashik-indira-nagar',
      locality: 'Indira Nagar',
      pincode: '422009',
      hubName: 'South Nashik Command Post',
      isServiceable: true,
      promiseEligible: true,
      avgEtaMinutes: 18,
      activeProsCount: 9,
      coords: { lat: 19.965, lng: 73.778 },
    },
    {
      id: 'nashik-road',
      locality: 'Nashik Road',
      pincode: '422101',
      hubName: 'Railway & Industrial Station',
      isServiceable: true,
      promiseEligible: true,
      avgEtaMinutes: 22,
      activeProsCount: 11,
      coords: { lat: 19.955, lng: 73.835 },
    },
    {
      id: 'nashik-panchavati',
      locality: 'Panchavati',
      pincode: '422003',
      hubName: 'Old City & Heritage Hub',
      isServiceable: true,
      promiseEligible: true,
      avgEtaMinutes: 16,
      activeProsCount: 8,
      coords: { lat: 20.018, lng: 73.805 },
    },
    {
      id: 'nashik-mumbai-naka',
      locality: 'Mumbai Naka',
      pincode: '422001',
      hubName: 'Transit & Gateway Hub',
      isServiceable: true,
      promiseEligible: true,
      avgEtaMinutes: 15,
      activeProsCount: 10,
      coords: { lat: 19.985, lng: 73.785 },
    },
    {
      id: 'nashik-mahatma-nagar',
      locality: 'Mahatma Nagar',
      pincode: '422007',
      hubName: 'West Nashik Residential Hub',
      isServiceable: true,
      promiseEligible: true,
      avgEtaMinutes: 14,
      activeProsCount: 8,
      coords: { lat: 19.998, lng: 73.75 },
    },
  ];

  constructor() {
    this.seedInitial();
  }

  public isAdmin(email?: string | null): boolean {
    if (!email) return false;
    return AUTHORIZED_ADMIN_EMAILS.has(email.toLowerCase().trim());
  }

  private seedInitial() {
    // Clean production state: No seeded fake bookings, reviews, providers, applications, or fake notifications.
    // Initial audit log to mark cluster initialization
    this.recordAudit({
      actorId: 'system',
      actorRole: 'system',
      action: 'SYSTEM_BOOTSTRAP',
      resource: 'backend_store',
      resourceId: 'nashik_cluster',
      reason: 'URBN SERVICES Multi-Role RBAC & Command Center Initialized in Clean Production State',
    });
  }

  public dispatchNotification(
    category: AdminNotificationCategory,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    meta: {
      relatedBookingId?: string;
      relatedProviderId?: string;
      relatedCustomerId?: string;
      relatedApplicationId?: string;
      actionLink?: string;
    } = {}
  ): AdminNotification {
    const notif: AdminNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category,
      priority,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      ...meta,
    };
    this.notifications.unshift(notif);
    if (this.notifications.length > 200) {
      this.notifications.pop();
    }
    return notif;
  }

  public recordAudit(log: Omit<AuditLogRecord, 'id' | 'timestamp'>) {
    const record: AuditLogRecord = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.auditLogs.unshift(record);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return record;
  }

  public trackAnalytics(eventName: string, metadata: Record<string, any> = {}, userId?: string) {
    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventName,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
    };
    this.analyticsEvents.unshift(event);
    if (this.analyticsEvents.length > 1000) {
      this.analyticsEvents.pop();
    }
  }

  // Find eligible provider for category & locality
  public findEligibleProvider(categoryId: CategoryId, locality: string): ProviderRecord | null {
    const eligible = Array.from(this.providers.values()).filter(
      (p) =>
        p.verificationStatus === 'Approved' &&
        p.isOnline &&
        p.categories.includes(categoryId)
    );

    if (eligible.length === 0) return null;

    // Prefer provider serving the specific locality
    const localityMatch = eligible.find((p) =>
      p.serviceAreas.some((sa) => sa.toLowerCase().includes(locality.toLowerCase()))
    );

    return localityMatch || eligible[0];
  }
}

export const backendStore = new BackendStore();

