const CACHE = 'vita-flow-offline-20261002-1';
const ROOT = new URL('./', self.location.href);
const SHELL = new URL('index.html', ROOT).href;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll([new Request(SHELL, {cache:'reload'}), new URL('manifest.webmanifest', ROOT).href, new URL('icon.svg', ROOT).href]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for(const key of await caches.keys()) if(key.startsWith('vita-flow-offline-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(event.request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  if(event.request.mode === 'navigate' && [ROOT.pathname, new URL('index.html',ROOT).pathname].includes(url.pathname)) {
    // All historic query-string links share the same offline page. Records remain in localStorage.
    const refresh = fetch(new Request(SHELL,{cache:'no-cache'})).then(async response => {
      if(response.ok && response.headers.get('content-type')?.includes('text/html')) {
        const cache=await caches.open(CACHE);await cache.put(SHELL,response.clone());
      }
      return response;
    });
    event.waitUntil(refresh.catch(()=>{}));
    event.respondWith(caches.match(SHELL).then(cached => cached || refresh));
  } else if(['manifest.webmanifest','icon.svg'].some(path=>url.href===new URL(path,ROOT).href)) {
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
  }
});
