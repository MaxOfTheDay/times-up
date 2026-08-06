# Tijd is Om

## Werkwijze

Werk af op een feature branch, open een pull request en merge die zelf zodra
de tests groen zijn. Niet eerst om toestemming vragen — dat is de standaard
voor deze repo. Alleen wachten als er expliciet om een plan of een controle
vooraf gevraagd wordt.

De site draait op GitHub Pages vanaf `main`, dus wat niet gemerged is, staat
niet in de woonkamer.

## De harde eis

Geen enkele speler hoeft ooit een woord te lezen: niet op de kaarten, niet op
de knoppen, niet op het scorebord. Tekst hoort op het instellingenscherm, dat
voor de volwassene is. Waar tekst elders toch helpt, staat ze náást een beeld
dat hetzelfde vertelt — nooit in plaats daarvan.

## Kleur betekent één ding

Rood is Vos en blauw is Uil, en verder niets. Wie een kleur nodig heeft voor
een toestand pakt er een uit `:root`: `--go` (goud) voor verdergaan,
`--good` voor geraden, `--danger` voor stoppen, `--time-3/2/1` voor de klok.
Nooit een ploegkleur lenen — dan betekent rood op het ene scherm "de vossen"
en op het volgende "haast je", en daarmee niets meer.

Kleur staat ook nooit alleen: elke toestand heeft er een tweede kanaal bij
(een vorm, een teken, een woord, een beweging).

## Wat je moet vasthouden, zegt dat

Een lange druk is alleen voor wat echt niet ongedaan te maken is: starten
(de klok mag niet lopen terwijl het toestel nog van hand wisselt) en
stoppen (een lopend potje weg). Allebei lopen via `holdButton()` en dragen
dezelfde gestippelde rand. Die functie tekent de voortgang zelf, per frame:
een CSS-overgang zou bij `prefers-reduced-motion` meteen op vol springen,
en het toetsenbord zou de druk overslaan.

Het tandwiel kreeg deze behandeling ooit ook, maar instellingen openen is
niets onomkeerbaars en het tandwiel bestaat alleen op het titelscherm --
geen risico dat een lange druk moest afdekken. Hij is nu een gewone tik,
zoals alles wat niets kost om ongedaan te maken.

"Beginnen" op de instellingen kreeg deze behandeling ooit ook, toen het nog
een lopend spel kon weggooien. Er bestaat geen lopend spel meer om weg te
gooien: het titelscherm start altijd vers, er is geen "verder spelen" en
geen potje overleeft een herlaadbeurt. Die knop is nu ook een gewone tik.

Alles staat in `index.html`: geen build, geen externe assets, werkt met de
wifi uit. Houd dat zo.

## Eén overdrachtscherm, drie vakken

Vroeger waren er vier schermen tussen "de klok is om" en "de volgende beurt
begint": een terugblik, een overdracht, een rondeafsluiting, een
ronde-intro. Geen van de tikken ertussen bewaakte iets -- ze wachtten alleen
tot je verder tikte -- terwijl "wie is er nu aan de beurt" op twee van die
schermen apart onthuld werd. `#s-handoff` is nu het enige scherm, en het
vult altijd dezelfde drie vakken in dezelfde volgorde:

1. **stand** -- hoe staan we, wie is er aan zet, wat kwam er net bij;
2. **opdracht** -- wat moet je doen;
3. **start** -- vasthouden, de enige handeling.

Het enige verschil tussen de twee wissels is de dichtheid van vak 2.
`handoff("turn")` laat de kaart compact (de opdracht is niet veranderd),
`handoff("round")` klapt hem uit met de ronde-tekening en de regel erin.
Dat uitklappen ís het teken dat er iets nieuws te leren valt -- daar is geen
apart scherm of tweede component voor nodig. `.mode-round` schakelt ertussen.

Wat er níet meer staat, en waarom:

- **Geen routekaart.** Die noemde de ronde nog een keer met hetzelfde
  pictogram en hetzelfde woord dat er al in kapitalen boven stond.
- **Geen grote mascotte op een plaat.** Het scherm heeft al de ploegkleur en
  de stand toont die mascotte al; ze stond er dus drie keer, terwijl de
  opdracht -- het enige waar de speler íets mee moet -- het kleinste kaartje
  op het scherm was. Wie aan zet is, blijkt nu uit de opgetilde tegel in de
  stand: vorm en reliëf, dus kleur staat nog steeds niet alleen.
- **Geen aparte regel-schijf.** Die is de tekening ín de uitgeklapte kaart
  geworden.

Alle tekst staat op papier, nooit rechtstreeks op de ploegkleur: `--ink-2`
haalt op ploegblauw maar 1,5:1 en op ploegrood 2,0:1, en de uitleg bij de
regel is juist de enige tekst in het spel die een speler moet kunnen lezen.

De stand (`#hoTally`) toont geen stapel fiches, zoals de winnaar dat wel
doet: dat scherm is verder leeg, maar hier deelt de stand de ruimte met de
opdracht. Een stapel van dertig-plus fiches duwde tegen ronde 3 de startknop
van het scherm af -- onzichtbaar in de test tot je 'm met een screenshot ziet
staan. Een totaal met een goud "+N" ernaast zegt hetzelfde in vaste breedte,
met een kroon boven wie voorstaat (hetzelfde teken als op het winnaarsscherm,
want twee getallen vergelijken kan een vierjarige nog niet).

De knop rechtsboven draagt hier een huisje en geen pauzeteken: er loopt geen
klok, dus er valt niets te pauzeren. De enige reden om er te tikken is
weggaan -- en dat is wat het huisje op het winnaarsscherm ook betekent.

## App-pictogram en installeerbaarheid

Het manifest staat niet als los bestand naast `index.html` -- dat zou de
regel "alles staat in `index.html`" breken -- maar wordt bij het laden in
het geheugen opgebouwd en als blob-URL aan `<link rel="manifest">` gehangen.
Een blob-URL heeft geen pad om relatief tegenaan te resolven, dus
`start_url` en `scope` staan er expliciet in als de volledige map-URL
(`location.href` met de bestandsnaam eraf), niet als `"."` of `"/"`.

De pictogrammen (`favicon`, `apple-touch-icon`, en de drie manifest-iconen)
zijn dezelfde zeefdruk-plaat als `.wordmark`: inkt-vlak, gouden zandloper,
crème contour. Ze zijn met Pillow gegenereerd uit dezelfde coördinaten als
het `#i-glass`-symbool en als vaste PNG's ingebakken -- geen build-stap,
gewoon eenmalig gegenereerd. Wijzigt de zandloper in `#i-glass`, genereer
de pictogrammen dan opnieuw met dezelfde vorm.

## Kaarten

`DECKS` bovenaan `index.html`, één regel per kaart. Twee regels bij het
toevoegen, allebei bewaakt door `test/deck.test.js`:

- één betekenis los van context (geen ⭐, niets cultureel gebonden);
- alleen emoji tot en met Unicode 9.0 (2016), anders ontbreekt de glyph op
  oudere tablets en is de kaart onspeelbaar.

## Tests

`npm test` draait twee suites in een echte browser. Ze draaien ook op elke
pull request. De speltest duurt ruim een halve minuut omdat één beurt echt
moet uitlopen, en klikt bewust trager dan 280 ms omdat een dubbele tik op
"goed" met opzet als één telt.
