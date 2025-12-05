// Service Worker for PWA functionality and background reminders

const CACHE_NAME = 'mindfat-v1';
const urlsToCache = [
  '/',
  '/index.html',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle reminder scheduling from main thread
const reminders = new Map();

self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_REMINDER') {
    const { noteId, title, reminderDatetime } = event.data;
    const reminderDate = new Date(reminderDatetime);
    const now = new Date();
    const delay = reminderDate.getTime() - now.getTime();

    if (delay > 0) {
      // Clear existing reminder
      if (reminders.has(noteId)) {
        clearTimeout(reminders.get(noteId));
      }

      // Schedule new reminder
      const timeoutId = setTimeout(() => {
        self.registration.showNotification('MindFat Reminder', {
          body: title,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `reminder-${noteId}`,
          vibrate: [200, 100, 200],
          requireInteraction: true,
        });
        reminders.delete(noteId);
      }, delay);

      reminders.set(noteId, timeoutId);
    }
  } else if (event.data.type === 'CANCEL_REMINDER') {
    const { noteId } = event.data;
    if (reminders.has(noteId)) {
      clearTimeout(reminders.get(noteId));
      reminders.delete(noteId);
    }
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
