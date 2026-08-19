const CACHE_NAME='idle-hacker-v6';
const APP_FILES=['./','./index.html','./css/style.css','./css/menu.css','./css/menu-assets.css','./js/events.js','./js/game.js','./js/save.js','./js/state.js','./js/ui.js','./manifest.json','./assets/icon.svg','./assets/menu-background.svg','./assets/menu/window-grid.svg','./assets/menu/laptop.svg','./assets/menu/router.svg','./assets/menu/mug.svg','./assets/menu/glow.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(APP_FILES))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  const isAppCode=/\.(html|css|js|json)$/i.test(url.pathname) || url.pathname.endsWith('/');
  if(isAppCode){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;})
        .catch(()=>caches.match(event.request))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
