var CACHE_NAME = "mws-v2";
var filesToCache = [
  'css/styles.css',
  'index.html',
  'restaurant.html',
  'offline.html',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  'js/main.js',
  'js/restaurant_info.js',
  'js/dbhelper.js',
  'js/lazy-load.js'
];
var allCaches =[CACHE_NAME];

self.addEventListener('install',function(event){
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache){
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate',function(event){
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.filter(function(cacheName){
          return cacheName.startsWith('mws-') && !allCaches.includes(cacheName);
        }).map(function(cacheName){
          console.log('Deleting ',cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch',function(event){
    console.log('[Service Worker] Fetch',event.request.url);
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache){
        return cache.match(event.request).then(function(response){
          return response || fetch(event.request)
          .then(function(resp){
            if(response.ok){
              console.log('[serviceWorker] Caching new data');
              cache.put(event.request,resp.clone());
              return resp;
            }else{
              console.log('[serviceWorker] Resp',resp);
              throw Error('response status '+response.status);
            }
          })
          .catch(function(error){
              console.log('[Service Worker] Network Request Failed');
              return caches.match('offline.html');
          });
        });
      })
    );
});
