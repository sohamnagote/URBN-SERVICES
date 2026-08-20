export type CategoryId = 'plumbing' | 'electrical' | 'cleaning' | 'appliance' | 'ac' | 'carpenter' | 'painting';

export interface ServiceItem {
  id: string;
  categoryId: CategoryId;
  title: string;
  shortDesc: string;
  fullDesc: string;
  price: number;
  originalPrice?: number;
  unit?: string;
  durationMin: number;
  rating: number;
  reviewsCount: number;
  image: string;
  bestseller?: boolean;
  features?: string[];
  included?: string[];
  excluded?: string[];
}

export interface ServiceCategory {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  rating: number;
  reviewCount: number;
  promiseBadge: string;
  services: ServiceItem[];
}

export interface Address {
  id: string;
  title: string;
  line1: string;
  locality: string;
  city: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

export interface CartItem {
  service: ServiceItem;
  quantity: number;
}

export interface Provider {
  id: string;
  name: string;
  profession: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  avatar: string;
  verified: boolean;
  etaMinutes: number;
  vehicleType: string;
  vehicleNumber?: string;
  currentLocationName: string;
  coords: { lat: number; lng: number };
}

export type BookingStatus =
  | 'Requested'
  | 'Confirmed'
  | 'Assigned'
  | 'On the Way'
  | 'Arrived'
  | 'Started'
  | 'Completed'
  | 'Cancelled'
  | 'Disputed';

export interface BookingStatusStep {
  status: BookingStatus;
  label: string;
  time?: string;
  completed: boolean;
  current?: boolean;
  description?: string;
}

export interface BillBreakdown {
  serviceVisitCharge: number;
  estimatedLabor: number;
  platformDiscount: number;
  taxesAndFee: number;
  partsCharge?: number;
  total: number;
  couponApplied?: string;
}

export interface Booking {
  id: string;
  items: CartItem[];
  primaryServiceTitle: string;
  primaryServiceImage: string;
  category: CategoryId;
  address: Address;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  statusHistory: BookingStatusStep[];
  provider?: Provider;
  bill: BillBreakdown;
  paymentMethod: 'UPI' | 'Card' | 'Cash on Service' | 'NetBanking';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  createdAt: string;
  promiseDeadline: string;
  otp: string;
  userRating?: number;
  userReview?: string;
}

export interface Review {
  id: string;
  author: string;
  locality: string;
  rating: number;
  timeAgo: string;
  comment: string;
  serviceTitle: string;
  verified: boolean;
  avatarInitials: string;
  avatarColor: string;
}

export interface SupportTicket {
  id: string;
  bookingId?: string;
  subject: string;
  category: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  lastUpdated: string;
  messages: {
    id: string;
    sender: 'user' | 'agent' | 'bot';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface NashikHub {
  id: string;
  name: string;
  locality: string;
  address: string;
  coords: { lat: number; lng: number };
  activeTechnicians: number;
  avgEtaMins: number;
  coverageRadiusKm: number;
  phone: string;
  status: 'Operational' | 'High Demand' | 'Standby';
  keyLandmarks: string[];
}

export interface GroundingChunkSource {
  web?: { uri?: string; title?: string };
  maps?: {
    placeId?: string;
    title?: string;
    uri?: string;
    address?: string;
    types?: string[];
  };
}

export interface MapsGroundingResponse {
  text: string;
  groundingMetadata?: {
    webSearchQueries?: string[];
    searchEntryPoint?: { renderedContent?: string };
    groundingChunks?: {
      web?: { uri: string; title: string };
      maps?: {
        placeId: string;
        title: string;
        uri: string;
        address: string;
      };
    }[];
    groundingSupports?: any[];
  } | null;
  locality?: string;
}

export type ActiveTab = 'home' | 'bookings' | 'support' | 'profile' | 'maps';
export type AppRole = 'customer' | 'provider' | 'admin' | 'operations';

export type ProviderApplicationStatus =
  | 'Not Applied'
  | 'Application Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Suspended';

export interface ProviderApplication {
  id: string;
  userId: string;
  applicantName: string;
  email: string;
  phone: string;
  experienceYears: number;
  primaryCategory: CategoryId;
  offeredCategories: CategoryId[];
  serviceAreas: string[];
  vehicleType: string;
  vehicleNumber: string;
  governmentIdType: string;
  governmentIdNumber: string;
  status: ProviderApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  internalNotes?: string;
  rejectionReason?: string;
}

export type AdminNotificationCategory =
  | 'New Booking'
  | 'Booking Assignment Failure'
  | 'Provider Arrived'
  | 'Provider Cancellation'
  | 'Provider No-Show'
  | 'Customer Cancellation'
  | 'New Provider Application'
  | 'Payment Failure'
  | 'Refund Request'
  | 'SLA Risk'
  | 'SLA Miss'
  | 'Support Escalation'
  | 'Dispute'
  | 'Security Alert'
  | 'System Failure';

export interface AdminNotification {
  id: string;
  category: AdminNotificationCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedBookingId?: string;
  relatedProviderId?: string;
  relatedCustomerId?: string;
  relatedApplicationId?: string;
  actionLink?: string;
}

export interface AdminNotificationPreferences {
  newBooking?: boolean;
  newBookings?: boolean;
  providerArrival?: boolean;
  providerArrivals?: boolean;
  providerCancellation?: boolean;
  cancellations?: boolean;
  slaRiskAlerts?: boolean;
  slaMissAlerts?: boolean;
  slaWarnings?: boolean;
  paymentFailures?: boolean;
  providerApplications?: boolean;
  newApplications?: boolean;
  supportEscalations?: boolean;
  systemAlerts?: boolean;
  minimumSeverity?: string;
  soundEnabled?: boolean;
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

// -------------------------------------------------------------
// URBN SERVICES CUSTOM PUSH NOTIFICATION PLATFORM TYPES
// -------------------------------------------------------------

export type NotificationCategory =
  | 'Booking'
  | 'Provider Update'
  | 'Service Reminder'
  | 'Payment'
  | 'Support'
  | 'Promotion'
  | 'System'
  | 'Custom Admin Notification';

export type TargetAudienceType =
  | 'all_users'
  | 'customers'
  | 'providers'
  | 'selected_users'
  | 'service_areas'
  | 'active_bookings'
  | 'completed_bookings'
  | 'inactive_users';

export interface AudienceCriteria {
  type: TargetAudienceType;
  selectedUserIds?: string[];
  serviceAreas?: string[];
  minDaysInactive?: number;
  customFilterName?: string;
}

export type NotificationLifecycleStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Processing'
  | 'Sending'
  | 'Sent'
  | 'Partially Sent'
  | 'Failed'
  | 'Cancelled';

export type DeliveryType = 'send_now' | 'scheduled';

export type DeepLinkType =
  | 'home'
  | 'booking_details'
  | 'active_booking'
  | 'service_page'
  | 'support_ticket'
  | 'provider_profile'
  | 'notification_center'
  | 'promotion'
  | 'custom_url';

export interface DeepLinkDestination {
  type: DeepLinkType;
  targetId?: string;
  label: string;
  url?: string;
}

export interface NotificationDeliveryLog {
  id: string;
  timestamp: string;
  deviceId: string;
  userId: string;
  platform: string;
  status: 'Delivered' | 'Failed' | 'Invalid Token';
  errorMessage?: string;
}

export interface NotificationStats {
  targetUserCount: number;
  activeDeviceCount: number;
  deliveredCount: number;
  failedCount: number;
  invalidTokensCount: number;
  openedCount?: number;
}

export interface PushNotificationJob {
  id: string;
  title: string;
  message: string;
  iconType?: 'wrench' | 'sparkles' | 'shield' | 'truck' | 'bell' | 'tag' | 'zap' | 'clock' | 'custom';
  iconUrl?: string;
  category: NotificationCategory;
  audience: AudienceCriteria;
  deepLink?: DeepLinkDestination;
  deliveryType: DeliveryType;
  scheduledFor?: string; // ISO UTC string
  timezone: string;
  status: NotificationLifecycleStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  stats: NotificationStats;
  deliveryLogs: NotificationDeliveryLog[];
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  isTestDelivery?: boolean;
  templateId?: string;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  iconType?: 'wrench' | 'sparkles' | 'shield' | 'truck' | 'bell' | 'tag' | 'zap' | 'clock' | 'custom';
  iconUrl?: string;
  deepLink?: DeepLinkDestination;
  isBuiltIn: boolean;
  audienceSuggestion?: TargetAudienceType;
  description?: string;
}

export interface DeviceRecord {
  id: string;
  userId: string;
  userRole: 'customer' | 'provider' | 'admin';
  userEmail?: string;
  pushToken: string;
  platform: 'android' | 'ios' | 'web' | 'pwa';
  browser: string;
  permissionStatus: 'granted' | 'denied' | 'default';
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInboxNotification {
  id: string;
  userId: string;
  jobId?: string;
  title: string;
  message: string;
  category: NotificationCategory;
  iconType?: string;
  iconUrl?: string;
  deepLink?: DeepLinkDestination;
  timestamp: string;
  read: boolean;
  readAt?: string;
  relatedBookingId?: string;
}

export interface UserNotificationPreferences {
  userId: string;
  bookingUpdates: boolean;
  serviceReminders: boolean;
  promotionsAndOffers: boolean;
  systemAlerts: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
}

