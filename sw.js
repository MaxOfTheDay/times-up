/* Tijd is Om — service worker.

   Er is maar één bestand om te cachen: index.html cachet zichzelf, want
   alle CSS, JS en iconen staan er al in (zie CLAUDE.md, "Alles staat in
   index.html: geen build, geen externe assets"). Wat hier "de app-shell"
   zou heten is dus gewoon dat ene document.

   Cache eerst, ververs erachter. De app start meteen uit de kast en haalt
   op de achtergrond een verse kopie op, voor de vólgende keer.

   Hier stond network-first, met "wie online is krijgt altijd de nieuwste
   versie" als reden. Dat klopt in de twee gevallen die je zelf uitprobeert
   -- online, en vliegtuigstand -- maar niet in het geval ertussenin, en dat
   is op een telefoon in een woonkamer juist het gewone geval: verbonden met
   wifi, geen route. `fetch()` faalt dan niet, hij hángt, tot de time-out van
   het toestel. Tientallen seconden op precies het scherm waar een
   vierjarige staat te wachten. "Werkt met de wifi uit" was waar; "werkt met
   slechte wifi" niet.

   De prijs hoort erbij genoemd: de woonkamer loopt nu hoogstens één
   opstartbeurt achter op main. Punt 2 hieronder (periodicsync) koopt die
   terug waar het toestel meewerkt. Er komt met opzet géén melding over een
   nieuwe versie -- dat zou tekst zijn op een scherm dat zonder tekst moet
   kunnen, voor iets wat de eerstvolgende koude start vanzelf oplost.

   CACHE_NAME optellen bij een structurele wijziging aan wat hier gecachet
   wordt, niet bij elke index.html-wijziging -- dat lost de verversing al
   op. activate() ruimt oudere versies dan vanzelf op. */
const CACHE_NAME = "tijd-is-om-v2";

// De map van index.html, dus de scope van deze worker -- ook onder een
// GitHub Pages-subpad. Alle navigaties cachen en serveren onder deze ene
// sleutel, ongeacht of er precies naar "/times-up/" of "/times-up/index.html"
// gevraagd werd: het is toch hetzelfde enkele document.
const APP_URL = new URL(".", self.registration.scope).href;

/* De enige plek waar er iets in de kast komt, met drie aanroepers: de
   installatie, elke navigatie (op de achtergrond) en periodicsync.

   Twee details die er niet toevallig staan.

   `cache: "no-cache"` is niet hetzelfde als `"reload"`: het dwingt een
   gesprek met de server af, maar staat een 304 toe. Er komt dus alleen een
   body over de lijn als er echt iets gewijzigd is, en dat maakt deze
   verversing goedkoop genoeg om hem bij élke navigatie te doen. Zonder dit
   beantwoordt de browser hem tien minuten lang uit zijn eigen HTTP-cache
   (GitHub Pages zet `Cache-Control: max-age=600` op HTML) en verifieert de
   "verversing" niets.

   `res.ok` stond er niet, en dat was een fout die je pas offline ziet: een
   404, of de foutpagina van een deploy die nog liep, ging gewoon de kast in
   en werd daarna geserveerd tot er weer netwerk was. */
async function ververs() {
  const res = await fetch(new Request(APP_URL, { cache: "no-cache" }));
  if (res.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(APP_URL, res.clone());
  }
  return res;
}

self.addEventListener("install", event => {
  // Geen netwerk bij de installatie: dan cachet de eerste geslaagde
  // navigatie hem alsnog via de fetch-handler hieronder.
  event.waitUntil(ververs().catch(() => {}));
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

  /* De verversing start altijd, ook als er een kopie in de kast staat --
     dát is het "erachter" van cache eerst. Allebei de aanroepen staan
     synchroon in de handler en niet verderop in een async-tak: waitUntil()
     aanroepen nadat de handler is teruggekeerd is een InvalidStateError. */
  const vers = ververs();
  event.waitUntil(vers.catch(() => {}));

  event.respondWith((async () => {
    const cached = await caches.match(APP_URL, { cacheName: CACHE_NAME });
    /* Niets in de kast -- eerste bezoek, of net opgeruimd na een
       versieverhoging -- dan tóch wachten op het netwerk. Dat is precies
       het oude gedrag, en het duurt één laadbeurt. */
    return cached || vers;
  })());
});

/* De prijs van cache eerst, teruggekocht waar het toestel meewerkt. Een
   geïnstalleerde app mag zich periodiek laten wekken om zijn eigen kast te
   verversen zonder dat iemand hem open heeft; dan is de kopie die bij de
   volgende start meteen in beeld springt óók al de nieuwste.

   Alleen Chromium op Android, alleen geïnstalleerd, en de browser bepaalt
   zelf of en wanneer hij wekt. Het is dus een meevaller en nooit een
   garantie: er hangt niets aan, en waar het niet bestaat gebeurt er stil
   niets. De registratie staat in index.html. */
self.addEventListener("periodicsync", event => {
  if (event.tag === "ververs") event.waitUntil(ververs());
});
