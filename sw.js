const CACHE_NAME = 'mws-v2';
const MAP_CACHE = 'map-cache';
const respImages=['dist/img/1.webp','dist/img/1-300.webp','dist/img/1-600.webp','dist/img/2.webp','dist/img/2-300.webp','dist/img/2-600.webp','dist/img/3.webp','dist/img/3-300.webp','dist/img/3-600.webp','dist/img/4.webp','dist/img/4-300.webp','dist/img/4-600.webp','dist/img/5.webp','dist/img/5-300.webp','dist/img/5-600.webp','dist/img/6.webp','dist/img/6-300.webp','dist/img/6-600.webp','dist/img/7.webp','dist/img/7-300.webp','dist/img/7-600.webp','dist/img/8.webp','dist/img/9.webp','dist/img/10.webp'];

var filesToCache = [
	'/',
	'build/css/styles.min.css',
	'build/js/restaurant.bundle.js',
	'build/js/main.bundle.js',
	'index.html',
	'restaurant.html',
	'offline.html',
	'public/img/error_page.gif',
	'src/js/lazy-load.js',		// TODO browserify and uglify
	...respImages
];
var allCaches =[CACHE_NAME,MAP_CACHE];

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
	var url = new URL(event.request.url);
	//console.log('fetch',url);
	//var regex = '/img/webp/\d+\.webp/g';
	//console.log('regex url',regex,regex.test(url.pathname));
	event.respondWith(
		caches.match(event.request).then(function(cacheResponse){
			if(cacheResponse){
				//console.log('cache resp for',url);
				return cacheResponse;
			}

			//console.log('No response from cache. About to Fetch from Network...');
			return fetch(event.request.clone()).then(async function(resp){
				/*if(resp.status === 404){
                  return caches.match('offline.html');*/
				var respClone = resp.clone();
				if(url.hostname==='unpkg.com'){
					//console.log('Cache 1');
					//console.log('Network Response',resp);
					await caches.open(MAP_CACHE).then(mc=> mc.put(event.request,respClone));
				}
				if(url.pathname==='/fonts'){
					//console.log('cache 2');
					//console.log('Network Response',resp);
					await caches.open(CACHE_NAME).then(mc=> mc.put(event.request,respClone));
				}
				if(url.hostname === 'api.tiles.mapbox.com'){
					//console.log('map cache');
					await caches.open(MAP_CACHE).then(mc=> mc.put(event.request,respClone));
				}
				/*
                  caches.open(CACHE_NAME).then(function(cache){
                    cache.put(event.request,respClone);
                  });*/
				return resp;
			}).catch(function(error){
				//console.log('[SW] Network Error' ,error);
				return caches.match('offline.html',error);
			});
		})
	);
});
