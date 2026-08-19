const CACHE_NAME='idle-hacker-v4';
const APP_FILES=['./','./index.html','./css/style.css','./css/menu.css','./js/events.js','./js/game.js','./js/save.js','./js/state.js','./js/ui.js','./manifest.json','./assets/icon.svg','./assets/menu-background.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener('fetch',event=>{event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)))})
