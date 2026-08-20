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
import { DEFAULT_ADDRESSES, DEFAULT_PROVIDER, INITIAL_BOOKINGS, MOCK_REVIEWS, SERVICE_CATEGORIES } from '../src/data/mockData';

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
    // Seed initial bookings
    INITIAL_BOOKINGS.forEach((b) => {
      this.bookings.set(b.id, { ...b });
    });

    // Seed initial reviews
    MOCK_REVIEWS.forEach((r) => {
      this.reviews.set(r.id, { ...r });
    });

    // Seed default provider record
    this.providers.set(DEFAULT_PROVIDER.id, {
      ...DEFAULT_PROVIDER,
      userId: 'provider-ramesh-1',
      email: 'ramesh.jadhav@urbnservices.in',
      verificationStatus: 'Approved',
      isOnline: true,
      categories: ['plumbing', 'appliance', 'ac'],
      serviceAreas: ['Gangapur Road', 'College Road', 'Mahatma Nagar', 'Panchavati'],
      totalJobsCompleted: 124,
      grossEarnings: 74200,
      platformCommission: 11130,
      netEarnings: 63070,
      payoutStatus: 'Processed',
    });

    // Seed secondary provider
    this.providers.set('prov-suresh-2', {
      id: 'prov-suresh-2',
      name: 'Suresh Patil',
      profession: 'Master Electrician',
      rating: 4.92,
      reviewsCount: 98,
      phone: '+91 98221 44556',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      verified: true,
      etaMinutes: 16,
      vehicleType: 'Bajaj Pulsar 150',
      vehicleNumber: 'MH 15 DP 7711',
      currentLocationName: 'Indira Nagar Circle, Nashik',
      coords: { lat: 19.968, lng: 73.782 },
      userId: 'provider-suresh-2',
      email: 'suresh.patil@urbnservices.in',
      verificationStatus: 'Approved',
      isOnline: true,
      categories: ['electrical', 'appliance'],
      serviceAreas: ['Indira Nagar', 'Mumbai Naka', 'Nashik Road'],
      totalJobsCompleted: 89,
      grossEarnings: 53400,
      platformCommission: 8010,
      netEarnings: 45390,
      payoutStatus: 'Processed',
    });

    // Seed initial provider applications in review pipeline
    this.providerApplications.set('app-pravin-101', {
      id: 'app-pravin-101',
      userId: 'user-pravin-shinde',
      applicantName: 'Pravin Shinde',
      email: 'pravin.ac.nashik@gmail.com',
      phone: '+91 98902 33441',
      experienceYears: 6,
      primaryCategory: 'ac',
      offeredCategories: ['ac', 'appliance'],
      serviceAreas: ['Gangapur Road', 'College Road', 'Mahatma Nagar'],
      vehicleType: 'Honda Activa 6G',
      vehicleNumber: 'MH 15 FG 4912',
      governmentIdType: 'Aadhaar Card',
      governmentIdNumber: 'XXXX-XXXX-8921',
      status: 'Under Review',
      appliedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      internalNotes: 'Aadhaar verified. Awaiting certificate verification for Daikin & Voltas AC servicing.',
    });

    this.providerApplications.set('app-ganesh-102', {
      id: 'app-ganesh-102',
      userId: 'user-ganesh-kale',
      applicantName: 'Ganesh Kale',
      email: 'ganesh.carpenter@yahoo.com',
      phone: '+91 94222 78109',
      experienceYears: 9,
      primaryCategory: 'carpenter',
      offeredCategories: ['carpenter'],
      serviceAreas: ['Panchavati', 'Nashik Road', 'Mumbai Naka'],
      vehicleType: 'TVS Jupiter',
      vehicleNumber: 'MH 15 EZ 1092',
      governmentIdType: 'PAN Card',
      governmentIdNumber: 'XXXXX9012K',
      status: 'Application Submitted',
      appliedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    });

    // Seed initial administrative event notifications
    this.notifications = [
      {
        id: 'notif-1',
        category: 'New Provider Application',
        priority: 'high',
        title: 'New Provider Onboarding Application',
        message: 'Pravin Shinde submitted an application for AC & Appliance repair in Gangapur Road.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        read: false,
        relatedApplicationId: 'app-pravin-101',
      },
      {
        id: 'notif-2',
        category: 'New Booking',
        priority: 'medium',
        title: 'New Express Booking Created',
        message: 'Booking UB-89421 created for Bathroom Deep Cleaning in College Road.',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        read: false,
        relatedBookingId: 'UB-89421',
      },
      {
        id: 'notif-3',
        category: 'SLA Risk',
        priority: 'high',
        title: '1-Day Promise SLA Check',
        message: 'All 7 active Nashik bookings are running within 1-Day Promise SLA parameters (100% on schedule).',
        timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: 'notif-4',
        category: 'Provider Arrived',
        priority: 'low',
        title: 'Technician Arrived at Location',
        message: 'Ramesh Jadhav reached customer location in Gangapur Road. Awaiting OTP verification.',
        timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
        read: true,
        relatedBookingId: 'UB-94821',
        relatedProviderId: DEFAULT_PROVIDER.id,
      },
    ];

    // Initial audit log
    this.recordAudit({
      actorId: 'system',
      actorRole: 'system',
      action: 'SYSTEM_BOOTSTRAP',
      resource: 'backend_store',
      resourceId: 'nashik_cluster',
      reason: 'URBN SERVICES Multi-Role RBAC & Command Center Initialized',
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

