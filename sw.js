const CACHE_NAME = 'physiology-pro-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data.text() }; }
  event.waitUntil(self.registration.showNotification(payload.title || 'Time to practice Physiology', {
    body: payload.body || 'A few focused questions today build confident clinical knowledge.',
    icon: './icon.svg', badge: './icon.svg', tag: payload.tag || 'physiology-practice',
    renotify: true, data: { url: payload.url || './index.html?open=practice' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || './index.html?open=practice';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
    const existing = windows[0];
    if (existing) return existing.navigate(target).then(client => client.focus());
    return clients.openWindow(target);
  }));
});
