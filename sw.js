/* Tijd is Om — service worker.

   Er is maar één bestand om te cachen: index.html cachet zichzelf, want
   alle CSS, JS en iconen staan er al in (zie CLAUDE.md, "Alles staat in
   index.html: geen build, geen externe assets"). Wat hier "de app-shell"
   zou heten is dus gewoon dat ene document.

   Netwerk eerst, cache als terugval. Wie online is krijgt altijd de
   nieuwste versie, en elke geslaagde laadbeurt overschrijft meteen de
   cache -- zo kan een speler nooit vastzitten op een oude build zolang hij
   af en toe met internet opent. Wie offline is (of net geïnstalleerd heeft
   zonder bereik) krijgt de laatst bewaarde versie in plaats van niets.

   CACHE_NAME optellen bij een structurele wijziging aan wat hier gecachet
   wordt, niet bij elke index.html-wijziging -- dat lost network-first al
   op. activate() ruimt oudere versies dan vanzelf op. */
const CACHE_NAME = "tijd-is-om-v1";

// De map van index.html, dus de scope van deze worker -- ook onder een
// GitHub Pages-subpad. Alle navigaties cachen en serveren onder deze ene
// sleutel, ongeacht of er precies naar "/times-up/" of "/times-up/index.html"
// gevraagd werd: het is toch hetzelfde enkele document.
const APP_URL = new URL(".", self.registration.scope).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(APP_URL);
    } catch (err) {
      // Geen netwerk bij installatie: de eerste geslaagde laadbeurt cachet
      // hem alsnog via de fetch-handler hieronder.
    }
  })());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  // Alleen de documentnavigatie zelf onderscheppen. Iconen zijn data-URI's
  // en er zijn geen andere bestanden, dus er valt verder niets te cachen.
  if (event.request.mode !== "navigate") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const fresh = await fetch(event.request);
      cache.put(APP_URL, fresh.clone());
      return fresh;
    } catch (err) {
      const cached = await cache.match(APP_URL);
      if (cached) return cached;
      throw err;
    }
  })());
});
