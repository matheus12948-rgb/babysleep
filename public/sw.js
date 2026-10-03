/**
 * BabySleep - Service Worker PWA de Alta Performance
 * Cache Offline, Estratégia Stale-While-Revalidate & Notificações em Segundo Plano
 */

const CACHE_NAME = 'babysleep-cache-v1';

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
];

// 1. INSTALAÇÃO DO SERVICE WORKER
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. ATIVAÇÃO E LIMPEZA DE CACHES ANTIGOS
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. ESTRATÉGIAS DE INTERCEPTAÇÃO DE REQUISIÇÕES (FETCH)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não intercepta chamadas externas de telemetria ou extensões do Chrome
  if (!url.protocol.startsWith('http')) return;

  // Chamadas de Navegação (Páginas HTML - SPA): NetworkFirst com Fallback para cache de /index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Assets Estáticos (JS, CSS, Imagens, Fontes): Stale-While-Revalidate
  if (
    url.pathname.startsWith('/assets/') || 
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Demais requisições: tenta rede normalmente, com fallback para cache se existir
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// 4. NOTIFICAÇÕES PUSH E SEGUNDO PLANO
self.addEventListener('push', (event) => {
  let data = {
    title: 'BabySleep',
    body: 'Hora de verificar a rotina do seu bebê.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'babysleep-routine',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    tag: data.tag || 'babysleep-reminder',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
    actions: [
      { action: 'open', title: 'Abrir App' },
      { action: 'dismiss', title: 'Dispensar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
