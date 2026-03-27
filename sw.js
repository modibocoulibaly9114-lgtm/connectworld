const CACHE_NAME = 'connectworld-v1';
const ASSETS = [
  '/connectworld/',
  '/connectworld/index.html',
  '/connectworld/manifest.json'
];

// Installation — mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activation — nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — stratégie Network First avec fallback cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'ConnectWorld AI', {
      body: data.body || 'Nouvelle notification',
      icon: 'https://via.placeholder.com/192x192/4f6ef7/ffffff?text=CW',
      badge: 'https://via.placeholder.com/72x72/4f6ef7/ffffff?text=CW',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/connectworld/' }
    })
  );
});

// Clic sur notification
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/connectworld/')
  );
});

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-content') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  console.log('ConnectWorld AI — synchronisation en arrière-plan');
}
