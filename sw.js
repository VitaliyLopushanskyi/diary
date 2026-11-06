/* Офлайн: сторінка й іконки з кешу, оновлення підтягуються у фоні. Дані сюди не потрапляють. */
var CACHE = 'diary-6c95c94d26';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'apple-touch-icon.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k.indexOf('diary-') === 0 && k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  var path = new URL(e.request.url).pathname, scope = new URL(self.registration.scope).pathname;
  var page = e.request.mode === 'navigate' && (path === scope || path === scope + 'index.html');
  if (e.request.mode === 'navigate' && !page) return;
  e.respondWith(caches.open(CACHE).then(function(c){
    var key = page ? 'index.html' : e.request;
    return c.match(key, { ignoreSearch: true }).then(function(hit){
      var net = fetch(e.request).then(function(r){ if (r && r.ok) c.put(key, r.clone()); return r; });
      if (hit){ e.waitUntil(net.catch(function(){})); return hit; }
      return net;
    });
  }));
});
