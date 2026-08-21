// URBN SERVICES Service Worker for Web Push & Real Mobile Notifications
/* eslint-disable no-restricted-globals */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle real incoming Web Push notifications from backend
self.addEventListener('push', (event) => {
  let data = {
    title: 'URBN SERVICES',
    message: 'New update regarding your service.',
    category: 'Booking',
    iconUrl: '/favicon.ico',
    deepLink: { type: 'home', url: '/' },
    timestamp: new Date().toISOString(),
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.message = event.data.text();
    }
  }

  const notificationTitle = data.title || 'URBN SERVICES';
  const notificationOptions = {
    body: data.message || 'You have a new update from URBN SERVICES Nashik.',
    icon: data.iconUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=192',
    badge: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=96',
    tag: `urbn-notif-${data.id || Date.now()}`,
    renotify: true,
    requireInteraction: data.category === 'Booking' || data.category === 'Provider Update',
    vibrate: [200, 100, 200],
    data: {
      url: data.deepLink?.url || '/',
      deepLink: data.deepLink,
      notificationId: data.id,
      timestamp: data.timestamp,
      category: data.category,
    },
    actions: [
      {
        action: 'open_app',
        title: 'Open URBN App',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Handle notification tap
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetDeepLink = event.notification.data?.deepLink;
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and post a message with deep link info
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'URBN_PUSH_NOTIFICATION_CLICKED',
            deepLink: targetDeepLink,
            notificationId: event.notification.data?.notificationId,
          });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
