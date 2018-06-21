var CACHE_NAME = "mws-v1";
var filesToCache = [
  '/',
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
  'img/error_page.gif',
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
  console.log(event.request);
  console.log('Search cache for ',event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response){
          console.log('Response from cache',response);
            if(response){
              console.log('[SW] Found response in cache');
              return response;
            }

              console.log('No response from cache. About to Fetch from Network...');
              return fetch(event.request.clone(),{
                mode : 'no-cors'
              }).then(function(resp){
                  console('[Service Worker] Network Resp',resp);
                  caches.open(CACHE_NAME).then(function(cache){
                    cache.put(event.request,resp.clone());
                  });
                  return resp;
              }).catch(function(error){
                  console.log('[SW] Network fetching failed for' , event.request.url);
                  return caches.match('offline.html');
              });
        })
    );
});
