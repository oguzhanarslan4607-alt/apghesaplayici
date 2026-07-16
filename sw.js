// Önbellek sürümü. Kodlarda güncelleme yaptığında bu v3'ü v4, v5 olarak değiştirirsen herkesin cihazında zorla güncellenir.
const CACHE_NAME = 'vade-sapma-v6';

const urlsToCache = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Yeni service worker'ı hemen aktifleştir
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eski sürüme ait önbellekleri silerek uygulamanın güncellenmesini sağla
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Ağ Öncelikli (Network First) Yaklaşım
// Önce internetten en güncel dosyayı çekmeye çalışır, internet yoksa önbellekteki (cache) dosyayı açar.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Başarılı bir istek yaptıysak, bunu hemen önbelleğe de kopyala
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // İnternet yoksa veya sunucuya ulaşılamıyorsa önbellekten getir
        return caches.match(event.request);
      })
  );
});
