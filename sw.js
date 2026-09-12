var C='kb-os-v9';
var ASSETS=['index.html','weather.html','docs.html','season.html','shopping.html','app.js','os.js','manifest.json'];
self.addEventListener('install',function(e){ self.skipWaiting(); e.waitUntil(caches.open(C).then(function(c){ return Promise.allSettled(ASSETS.map(function(a){return c.add(a);})); })); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(k){ return Promise.all(k.filter(function(x){return x!==C;}).map(function(x){return caches.delete(x);})); }).then(function(){return self.clients.claim();})); });
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  var u=new URL(e.request.url);
  if(u.origin!==location.origin) return;               /* never cache Open-Meteo or fonts */
  e.respondWith(
    fetch(e.request).then(function(r){ var cp=r.clone(); caches.open(C).then(function(c){c.put(e.request,cp);}); return r; })
    .catch(function(){ return caches.match(e.request).then(function(m){ return m || caches.match('index.html'); }); })
  );
});
