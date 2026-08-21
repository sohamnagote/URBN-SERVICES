import { DeviceRecord } from '../types';

export interface PushStatus {
  isSupported: boolean;
  permission: NotificationPermission;
  isRegistered: boolean;
  deviceRecord?: DeviceRecord;
}

class PushNotificationClient {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private currentDeviceId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentDeviceId = localStorage.getItem('urbn_device_id') || `dev-web-${Date.now().toString(36)}`;
      localStorage.setItem('urbn_device_id', this.currentDeviceId);
      this.initServiceWorker();
    }
  }

  public async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      
      // Listen for messages from service worker (e.g. notification click)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'URBN_PUSH_NOTIFICATION_CLICKED') {
          window.dispatchEvent(
            new CustomEvent('urbn-push-clicked', { detail: event.data })
          );
        }
      });

      return this.swRegistration;
    } catch (err) {
      console.warn('Service Worker registration fallback:', err);
      return null;
    }
  }

  public isPushSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Contextual permission request with registration to backend
   */
  public async requestNotificationPermission(
    userId: string = 'customer-rohit-nashik',
    userRole: 'customer' | 'provider' | 'admin' = 'customer',
    userEmail?: string
  ): Promise<{ status: NotificationPermission; registered: boolean }> {
    if (!this.isPushSupported()) {
      return { status: 'denied', registered: false };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registered = await this.registerDeviceWithBackend(userId, userRole, userEmail);
        return { status: 'granted', registered };
      }
      return { status: permission, registered: false };
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return { status: 'denied', registered: false };
    }
  }

  /**
   * Registers current browser device endpoint with the backend
   */
  public async registerDeviceWithBackend(
    userId: string,
    userRole: 'customer' | 'provider' | 'admin',
    userEmail?: string
  ): Promise<boolean> {
    try {
      const deviceId = this.currentDeviceId || `dev-${userId}-${Date.now().toString(36)}`;
      const platform = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        ? 'ios'
        : /Android/i.test(navigator.userAgent)
        ? 'android'
        : (window.matchMedia('(display-mode: standalone)').matches ? 'pwa' : 'web');

      const pushToken = `web-push-sub-${userId}-${deviceId.substring(0, 8)}`;

      const res = await fetch('/api/notifications/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userRole,
          userEmail,
          pushToken,
          platform,
          browser: navigator.userAgent.includes('Chrome')
            ? 'Chrome'
            : navigator.userAgent.includes('Safari')
            ? 'Safari'
            : navigator.userAgent.includes('Firefox')
            ? 'Firefox'
            : 'Browser',
          permissionStatus: Notification.permission,
          deviceId,
        }),
      });

      return res.ok;
    } catch (err) {
      console.warn('Failed to register device with backend:', err);
      return false;
    }
  }

  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    return this.initServiceWorker();
  }

  public async initDeviceRegistration(
    userId?: string,
    userRole: 'customer' | 'provider' | 'admin' | 'operations' = 'customer',
    userEmail?: string
  ): Promise<boolean> {
    const effectiveUserId = userId || 'anonymous_user';
    const effectiveRole = (userRole === 'operations' ? 'admin' : userRole) as 'customer' | 'provider' | 'admin';
    return this.registerDeviceWithBackend(effectiveUserId, effectiveRole, userEmail);
  }

  /**
   * Displays local native notification if browser allows
   */
  public showNativeNotification(title: string, options?: NotificationOptions) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        if (this.swRegistration) {
          this.swRegistration.showNotification(title, {
            icon: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=192',
            badge: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=96',
            ...options,
          });
        } else {
          new Notification(title, {
            icon: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=192',
            ...options,
          });
        }
      } catch (err) {
        console.warn('Native notification display error:', err);
      }
    }
  }
}

export const pushClient = new PushNotificationClient();
export const pushNotificationClient = pushClient;
