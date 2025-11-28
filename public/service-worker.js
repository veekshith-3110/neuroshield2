const CACHE_NAME = 'burnout-app-v1';

self.addEventListener('install', (event) => {
  // Skip waiting and activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only cache the root - don't try to cache files that might not exist
        return cache.add('/').catch((err) => {
          // Ignore cache errors
          console.log('Cache install error (ignored):', err);
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // COMPLETELY BYPASS service worker for:
  // 1. All API requests (any path starting with /api/)
  // 2. All backend requests (localhost:5000 or 127.0.0.1:5000)
  // 3. All cross-origin requests to port 5000
  // 4. All POST/PUT/DELETE requests (they should never be cached)
  if (
    url.pathname.startsWith('/api/') || 
    (url.hostname === 'localhost' && url.port === '5000') ||
    (url.hostname === '127.0.0.1' && url.port === '5000') ||
    url.origin.includes(':5000') ||
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(event.request.method)
  ) {
    // Don't intercept at all - let browser handle directly
    return;
  }
  
  // Only handle GET requests for static assets
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For static assets, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response (streams can only be read once)
          const responseToCache = response.clone();
          
          // Cache successful responses
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(() => {
          // Return a basic offline response if fetch fails
          return new Response('Offline', { 
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

