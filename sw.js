var CACHE_NAME = "mws-v2";
var filesToCache = [
  '/',
  'build/css/styles.min.css',
  'build/js/restaurant.bundle.js',
  'build/js/main.bundle.js',
  'index.html',
  'restaurant.html',
  'offline.html',
  'public/img/webp/1.webp',
  'public/img/webp/2.webp',
  'public/img/webp/3.webp',
  'public/img/webp/4.webp',
  'public/img/webp/5.webp',
  'public/img/webp/6.webp',
  'public/img/webp/7.webp',
  'public/img/webp/8.webp',
  'public/img/webp/9.webp',
  'public/img/webp/10.webp',
  'public/img/error_page.gif',
  'src/js/lazy-load.js'  // TODO browserify and uglify
];
var allCaches =[CACHE_NAME];

self.addEventListener('install',function(event){
  //console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache){
      return cache.addAll(filesToCache);
    }).then(self.skipWaiting())
  );
});

self.addEventListener('activate',function(event){
  //console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.filter(function(cacheName){
          return cacheName.startsWith('mws-') && !allCaches.includes(cacheName);
        }).map(function(cacheName){
          //console.log('Deleting ',cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch',function(event){
  //console.log(event.request);
  console.log('Fetch ',event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(cacheResponse){
            if(cacheResponse){
              return cacheResponse;
            }

              //console.log('No response from cache. About to Fetch from Network...');
              return fetch(event.request.clone()).then(function(resp){
                /*if(resp.status === 404){
                  return caches.match('offline.html');
                }
                var respClone = resp.clone();
                  caches.open(CACHE_NAME).then(function(cache){
                    cache.put(event.request,respClone);
                  });*/
                  return resp;
              }).catch(function(error){
                  //console.log('[SW] Network Error' ,error);
                  return caches.match('offline.html');
              });
        })
    );
});
