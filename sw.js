// Bump CACHE_NAME on every deploy so old cached assets get cleaned up.
var CACHE_NAME = "koerper-tracker-v6";

self.addEventListener("install", function(event){
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Network-first: always try to fetch the latest version when online,
// fall back to the last cached copy when offline. "cache: no-store" bypasses
// the browser's normal HTTP cache, since otherwise fetch() here could still
// silently hand back a stale response served under GitHub Pages' own
// Cache-Control headers instead of hitting the network.
self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request, {cache: "no-store"}).then(function(response){
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
      return response;
    }).catch(function(){
      return caches.match(event.request).then(function(cached){
        return cached || caches.match("./index.html");
      });
    })
  );
});
