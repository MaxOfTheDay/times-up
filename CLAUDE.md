# Tijd is Om

Dit zijn de regels die bij elke wijziging gelden. Waaróm ze zo zijn, wat er
geprobeerd is en wat er gemeten werd, staat in
[`docs/ontwerp.md`](docs/ontwerp.md), per onderwerp onder dezelfde kop. Lees
dat hoofdstuk vóór je een regel hieronder verandert, en pas het aan in
dezelfde pull request. Geschiedenis ("hier stond eerst ...") hoort in git,
niet hier en niet in de code.

## Werkwijze

Werk af op een feature branch, open een pull request en merge die zelf. Niet
eerst om toestemming vragen; alleen wachten als er expliciet om een plan of
een controle vooraf gevraagd wordt.

- **Maak de branch aan vóór je iets wijzigt.** Controleer `git log
  --oneline -1` op de branch vóór het pushen, en de regel "N files changed"
  op de PR vóór het mergen. PR #37 mergede een lege commit omdat het werk op
  de lokale `main` stond.
- **Merge zodra `npm test` lokaal groen is.** CI draait dezelfde suites nog
  een keer, als vangnet en bewijs, niet als hek.
- **Wacht wél op CI** bij wijzigingen aan de speellogica (de spelkern of de
  code die haar aanroept), aan `DECKS`, of aan de testharnas.
- **De controle die telt is renderen en meten**, niet `npm test`. Geen
  enkele misser in deze repo is door een test gevonden: mascottes op 0 bij 0
  px, een derde rechthoek om het merk, een kroon door de bovenrand, een
  stapel fiches die de startknop van het scherm duwde. Maak bij elke
  zichtbare wijziging screenshots (staand 390x844, liggend 844x390, klein
  320x568) en kijk ernaar.
- Alles staat in `index.html`: geen build, geen externe assets, werkt met de
  wifi uit. Houd dat zo. Het enige andere bestand dat de app nodig heeft is
  `sw.js`.
- Tekst in de repo (code, opmerkingen, commits, docs) is Nederlands.

## Gemerged is nog niet live

De site draait op GitHub Pages vanaf `main`, via een eigen workflow
(`pages build and deployment`), los van `Tests`. Kijk na een merge of díe op
de merge-commit geslaagd is.

Het bekende falen: `deploy` blijft tien minuten op `deployment_queued` en
stopt met `Timeout reached, aborting!`. Dat is een wachtrij bij GitHub, niet
deze repo.

- Eén geslaagde deploy haalt alles op; Pages zet de hele `main` neer.
- Opnieuw draaien helpt niet: het deployment-ID is de commit-SHA en de
  time-out heeft dat ID geannuleerd. Alleen een nieuwe commit op `main` geeft
  een nieuwe poging.
- Ligt de wachtrij plat, dan helpt ook die niet. Wacht tot GitHub bijtrekt en
  duw dan één keer.

## Opbouw

`index.html` heeft twee scripts:

- **`<script id="spelkern">`** definieert `Spel`: de spelregels, zonder DOM,
  geluid, klok of opslag. Trekken, raden, passen, beurtwissel, rondewissel
  (de andere ploeg opent), een geraden kaart terugnemen, de winnaar, en `herstel()` voor een bewaard potje.
  De kaartregels (`poolFor`, `bakFor`, `canHide`, `drawDeck`) staan er ook,
  met `DECKS` en de weggelegde kaarten als argument.
- **het hoofdscript** doet de rest: schermen, klok, geluid, trilling,
  animaties, opslag, PWA. Het roept `Spel` aan en tekent de gevolgen.

Regels voor die grens:

- **Een spelregel hoort in `Spel`, met een test in `test/kern.test.js`.** Wie
  in het hoofdscript `G.scores`, `G.pile` of `G.team` rechtstreeks aanpast,
  zet een regel op een plek waar geen snelle test hem ziet.
- De spelkern verwijst naar niets buiten haar eigen blok. De test knipt het
  blok op zijn `id` uit `index.html` en draait het in Node.
- Willekeur komt als argument binnen (`rnd`, standaard `Math.random`), zodat
  een test een vaste reeks kan geven.
- De vorm van de spelstand `G` staat in de kop van de spelkern. Zo staat hij
  ook in `localStorage` (`tijdisom.game`, hoogstens twee uur oud). Wie een
  veld toevoegt, past `Spel.herstel()` aan, anders verdwijnt elk bewaard
  potje bij de volgende update.
- **Weggaan kost niets.** Bewaard wordt op de overdracht én bij
  `visibilitychange`/`pagehide` midden in een beurt (`bewaarBeurt()`, via
  `Spel.onderbreek()`). Twee terugvegen zonder tik ertussen sluiten de app
  op Android, wat je ook in de geschiedenis zet; reken daar niet omheen.

## De harde eis

Geen enkele speler hoeft ooit een woord te lezen: niet op de kaarten, niet op
de knoppen, niet op het scorebord. Tekst hoort op het instellingenscherm, dat
voor de volwassene is. Waar tekst elders helpt, staat ze náást een beeld dat
hetzelfde vertelt, nooit in plaats daarvan.

- Het woord onder de tekening op de kaart mag: het zegt exact wat het beeld
  zegt en beslecht welk woord telt ("luiaard", niet "beertje"). Kies het
  zoals een vierjarige het zou zeggen, in `--ink-2`, zonder kader.
- Verboden is tekst die iets toevoegt dat het beeld niet zegt: een hint die
  later verschijnt, een woord dat de kaart makkelijker of moeilijker maakt.
- Alle tekst staat op papier, nooit rechtstreeks op de ploegkleur.

## Het speelbord

De app is een bordspel, gedrukt in een paar vlakke inkten, waarop alleen Vos
en Uil leven. Luid bij de beloning, stil bij het wachten, nooit een woord
voor de spelers. Vier regels dragen dat; elke ontwerpregel hieronder hoort
bij één ervan. Toets een nieuw onderdeel eerst aan deze vier.

1. **Materiaal: papier, inkt en een paar vlakke inkten.** Geen verloop,
   geen glas, geen vervaging. Toon komt uit rasterpunten op één stilstaand
   raster van 12 px. (Kleur, Papier, Eén pen, Eén letter, Hoek van het
   scherm)
2. **Stukken: één fiche, tegels en kaarten.** Een ronde fiche per scherm
   voor wat je nu doet (`--lift-2`), vierkante tegels voor de rest
   (`--lift-1`), kaarten dragen het spel. Harde inktschaduw, rechte hoeken.
   (Vorm en diepte, Overdracht, Eén stand, Eindstand, Titel, Instellingen)
3. **Krachten: alleen de vinger, de klok, en Vos en Uil laten iets
   bewegen.** Stukken zakken in en veren terug als je drukt; de klok drukt
   ook (het aftellen, de zandloper). Alleen de dieren bewegen uit zichzelf:
   knipperen, ademen, juichen, rek en klets. Elke beweging pakt een lengte
   en een curve uit `:root` (`--t-press/los/kom/groot`, `--e-uit/los/weg/vloei`).
   (De klok, Vasthouden, Aftellen, Worp, Grond, Vertrekken, Beloning, Eén label)
4. **Stem: één betekenis per kleur, klank en trilling, nooit één kanaal.**
   Rood is Vos, blauw is Uil, goud is "dit, nu", groen is geraden. Geen
   woorden voor de spelers. (De harde eis, Kleur, Geluid en trilling)

## Ontwerpregels

Elk punt heeft een hoofdstuk met dezelfde naam in `docs/ontwerp.md`.

**Kleur betekent één ding.** Rood is Vos, blauw is Uil, en verder niets.
Toestanden pakken een kleur uit `:root`: `--go` (goud: "dit, nu", de knop om
nu in te drukken, de keuze die geldt, de ronde van nu, de kroon), `--good`
(geraden), `--time-3/2/1` (de hitte van de klok). Stoppen en "mag niet"
hebben geen eigen kleur: inkt, met een vorm. Tel bij een nieuw
element hoe vaak die kleur al op datzelfde scherm staat. Kleur staat nooit
alleen: elke toestand heeft een tweede kanaal (vorm, teken, woord,
beweging).

**Papier heeft twee randen, geen drie.** Tel bij elk vlak de rechthoeken in
het silhouet, met de stapel eronder weggehaald (`.cardslot .under` op
`display: none`). `--mis` staat overal op doorzichtig; zet hem nooit op
`--ink` of op één los vlak. Een inkt-vlak krijgt één verschoven laag: de
gouden plaat als schaduw naar rechtsonder. Een contour die je niet wilt is
`border: 0`, geen kleur die toevallig wegvalt.

**De klok windt af.** De meter is de rand om de kaart: hij rekent met
`perim * (1 - p)` en is verankerd op twaalf uur. De pauze toont geen eigen
klok maar neemt die band over (`legPaneel()`). Kies bij een nieuwe meter het ankerpunt bewust. De band blijft
in één stuk, zonder inkepingen.

**Vorm zegt wat het is, diepte hoe zwaar.** Eén cirkel op tapmaat per scherm,
voor de handeling waar het scherm voor bestaat; al het andere is een
rechthoek. `--lift-2` (8 px) is de hoofdhandeling, `--lift-1` (5 px) de
rest. Indrukbaar is wat bij `:active` zijn schaduw inzakt: snel in
(`--t-press`), verend uit (`--t-los`). Een primaire knop
krijgt nooit alleen `min()`, maar een `max()` met ondergrens. Stapel nooit
twee knoppen van rand tot rand met verschillende lift. Een uitgang staat
rechtsboven. Een nieuwe knop gaat in de selectorlijst van 3. KNOPPEN, anders
veert hij niet terug. Een cirkel op een stippengrond stuurt bij de druk een
rimpel vanaf zijn rand (`knopRimpel()`, en `rimpelDoor()` als het scherm
meteen wisselt); een rechthoek niet. Vervormen (rek en klets) is alleen
voor Vos en Uil: een knop zakt in, hij knijpt nooit.

**De hoek van het scherm is geen rechte hoek.** Elk blijvend rechthoekig vlak
houdt `--corner` (32 px) van beide schermranden. Tel `env(safe-area-inset-*)`
op (`calc(env(...) + marge)`), kies nooit met `max()`: in app-modus meldt een
Pixel onderaan nul. Controleer door de bogen te tekenen, niet met
`getBoundingClientRect()`.

**Wat je moet vasthouden, zegt dat.** Een lange druk is alleen voor het
onomkeerbare, en dat is precies één knop: stoppen, via `holdButton()`, als
enige met de stippellijn. Het teken is het huisje, nooit een kruis (een
kruis betekent "sluit dit paneel"). Een losse tik doet de druk voor in
plaats van te weigeren; loslaten laat de vloed leeglopen. Starten is een
tik; het aftellen van drie tellen vangt een strijkende vinger op. Afbreken
kan tijdens het aftellen alleen via de tegel rechtsboven (`#cdBack`), met
het pauzeteken, niet via het hele vlak.

**Eén overdrachtscherm, drie vakken.** `#s-handoff` is het enige scherm
tussen twee beurten: stand, opdracht, start. De stand staat ín de
opdrachtkaart. Beurtwissel en rondewissel hebben dezelfde maat en
verschillen in beweging (`.mode-round`): bij een beurtwissel ademt de
mascotte, bij een rondewissel komt de tekening op. Geen kroon, geen "+N", geen
fiche per punt op dit scherm. De wake lock blijft hier aan, begrensd op
`WAKE_MAX`.

**Eén pen voor tekening en mascotte.** Het teken op de kaart (en in
`#kijk`) krijgt de inktlijn van Vos en Uil: vier `drop-shadow`s zonder
vervaging, 4 px (2 px op de kleine plaatjes). Niet vlakker maken met een
filter. De mascottes, de rondetekens en `#i-kaarten` nemen voor hun lijn
`max(eigen dikte, min(var(--pen), plafond))`; `penLijn()` zet `--pen` per
svg, zodat geen lijn dunner wordt dan 2,3 px op het scherm. Een nieuw
gebruik buiten `svgUse()` meld je daar aan.

**De ronde in drie maten** komt altijd uit `paintRound(ico, size, host)`
(`"teken"`, `"chip"`, `"kaart"`), nooit los bijgewerkt.

**Het aftellen draagt allebei de feiten**: de ronde en de ploeg (`.cd-team`
op papier). Beide tegels en de gouden schijf liggen op de gemeten plek van
hun tegenhanger, niet in CSS nagerekend. Meet de startknop in de
klik-handler. De schijf ís die startknop: ze houdt `--lift-2`, en elke tel
drukt de klok haar in (`telDruk`, dezelfde in en uit als een vinger), met
de ring door de punten bij het terugveren. Geen ring om de schijf: één
ritme, per tel.

**De worp verklapt zichzelf niet.** Zolang er geloot wordt is de grond die
van de titel (papier, inkten punten); de ploegkleur groeit als een cirkel uit
de startknop als de worp landt (`veldHo.onthul()`). Laat de achtergrond niet
meeflikkeren. Een druk die de grond verandert, laat de nieuwe grond uit die
knop groeien; de knop zelf glijdt mee (`rimpelDoor()`). Naar huis ook: de
titel groeit als cirkel uit de knop (`naarTitel()`). Afbreken op het
aftellen houdt de grond (`handoff(..., zelfdeGrond)`).

**De grond stroomt, het scherm vervaagt niet.** `#s-handoff`, `#s-play` en
`#s-winner` hebben geen `screenIn`: op de overdracht stroomt alleen de grond van papier
naar ploegkleur, en het spelscherm verandert van grond niet. Bij beperkte
beweging geen vloed. De rasterpunten op die grond zijn papier op lage
dekking (16%), geen eigen kleur, op één stilstaand raster van 12 px, getekend
op één canvas per grond (`stipveld()`). Wat beweegt is rastertoon: een punt
groeit, hij licht niet alleen op. Ze lopen van rand tot rand, zonder
uitsparing: de stukken liggen erop (`opt.masker` is een haak, geen
standaard). Ze bewegen alleen als iets ze indrukt (geen deining): een tik op de grond geeft een rimpel die de
punten opzij duwt en terug laat veren: 12 px opzij en een punt tot ruim het
dubbele, want minder leest op een telefoon als niets. Ze staan op de
overdracht, het aftellen, de eindstand van wie won (in de ploegkleur, met
de stralen als papier) en de titel, die van allebei de ploegen is en dus
inkt op papier krijgt (11%, `inkt: true`); op het aftellen gaat bij elke tel
een ring vanuit de schijf (`telGolf()`), op de eindstand barst het vuurwerk
in de punten (`vuurwerk()`). Er loopt alleen een lus zolang er iets beweegt; bij beperkte
beweging één stilstaand beeld.

**Vertrekken mag, als er niets achter wacht.** Geen vertrekanimaties, behalve
de schijf die op nul opengaat (`.countdown.open`; `cdOut` bij beperkte
beweging), de opdrachtkaart die op het aftellen in de grond zakt
(`.cd-kaart`), het oplossen van de pauzesluier bij hervatten (`.uit`; alleen
de sluier, `.overlay::before`, het paneel vervaagt nooit), de eerste helft
van het omdraaien (`draaiOm()`, `draaiPauze()`), het scherm onder de titelcirkel
(`naarTitel()`) en de kopie
van de kaart die naar de teller krimpt of onder de stapel zakt
(`kaartSpook()`): de volgende kaart ligt er dan al onder. `hidden` gaat
meteen aan; `inert` pas na het verzetten van de focus.

**Beloning.** Een beurt en een ronde eindigen met een stempel op de kaart
(tijd om: de zandloper op inkt; stapel leeg: het vinkje op groen) en een
adem van `BEURT_ADEM`; dan draait de kaart om (`draaiOm()`, `landOm()`) en
is haar achterkant de opdracht, de volgende ronde of de eindstand. De mascotte in de balk reageert via
`mascotte()` (wip, juich, schrik, nee bij overslaan), met rek en klets, altijd
met Web Animations en overgeslagen bij beperkte beweging; bij juich, schrik en
nee wisselt ook het gezicht (`#m-vos-blij`, `#m-uil-schrik`, `-dicht`), en
elke mascotte in beeld knippert om de paar tellen (`knipperLus()`), en wie wint lacht op de eindstand. De eindstand telt eerst op; de kroon en het feest
komen daarna: vier rimpels bij de hoeken op de noten van de fanfare, een
ring uit de kaart op de slotnoot, en één val snippers.

**De eindstand telt niet, ze noemt.** Wie won staat in de kroon en de
mascotte die groeit; per ploeg het totaal, met de drie rondes klein eronder.
Twee totalen even groot, op een papieren kaart zo breed als de opdrachtkaart
(`.wn-kaart`), met de kroon binnen de rand. Grep voor je een korte
klassenaam pakt (`.bar` bestond al).

**Eén label voor "wat er bij komt".** Het groene `+N` (`.gain`) staat alleen
in de balk tijdens het spelen. Het vliegende punt draagt dezelfde huid, gaat
via Web Animations, en het getal plus de wip horen bij de landing
(`landFly()`), ook bij een schermwissel.

**Pauze draait de kaart om.** Tijdens een beurt ligt het pauzepaneel als
achterkant op de gemeten plek van de kaart (`legPaneel()`), met haar eigen
stilstaande band als rand en de stand en de twee deuren erop. Geen tweede
klok, geen pauzebalken, en het woord ligt afgedekt. Verder draait haar weer
om (`kaartBoven()`). Op de overdracht draait de opdrachtkaart zo om, met
alleen de deuren. Past de achterkant niet op de kaart, dan een los paneel.

**Eén stand, twee schermen.** `buildTally()` bouwt de stand voor
`#hoTally` en `#pauseTally`. Ook de stijlen staan in één selectorlijst met
allebei de plekken; iets alleen onder `#s-handoff` laat het paneel achter.

**Geluid en trilling.** Eén betekenis per cue, nooit het enige kanaal.
Alle cues lopen door `Snd` en `Tril`, naar één bus met compressor. Geen
muziek. Elke cue moet op een telefoonluidspreker hoorbaar zijn: geen sinus
onder 400 Hz als drager, meet met het telefoonmodel uit `docs/ontwerp.md`.
De ploeg klinkt (`Snd.ploeg`) alleen waar de worp landt, waar een beurt of
ronde overgaat (in `turnEnd`/`endRound`, niet in `handoff()`) en na de
fanfare. Een trilling duurt minstens 20 ms.

**App-pictogram en installeerbaarheid.** Het manifest wordt in het geheugen
gebouwd (blob-URL) met een expliciete `id`, `start_url` en `scope`. De zin
die zegt wat de app is staat één keer, in `<meta name="description">`.
Pictogrammen en manifest-screenshots worden gegenereerd, nooit overgetypt
(`npm run pictogrammen`, `npm run schermen`, beide deterministisch). `sw.js`
is cache eerst, ververs erachter, met `res.ok` vóór `cache.put` en
`cache: "no-cache"` bij het verversen. Geen melding over een nieuwe versie; wel een stille herlaadbeurt als de
pagina verborgen raakt op de titel zonder bewaard potje (`meldNieuw()`).
Het installeerveld heeft vijf standen (`knop`, `zetop`, `menu`, `delen`,
`weg`), staat onderaan als vierde groep, en levert alleen de weg die het
platform heeft weggenomen.

**Eén letter voor cijfers en koppen.** Fredoka, ingebakken als base64 in de
`@font-face`, vast op 700, met cijfers die even breed zijn. Hij staat op wat
je in één blik ziet (cijfers, koppen, het woord op de kaart, knoppen in
hoofdletters), via één selectorlijst met `var(--font-display)`; zin-tekst
voor de volwassene blijft de systeemletter. Opnieuw maken met
`tools/letter.py`, nooit met de hand. Vaste maten komen van de trap
`--fs-1` tot `--fs-6` (12, 14, 16, 20, 28, 40); hoofdletters krijgen
`--track-caps`, zin-tekst geen spatiëring.

**Het titelscherm heeft twee dingen**: het merk en de knop. Vos en Uil zitten
op de bovenrand van het merk (`.gluur` in `.wordmark`), niet ernaast, en
komen bij binnenkomst van achter de rand omhoog. De knip staat stil; elke
beweging heeft haar eigen eigenschap (`rotate`, `translate`, `scale`,
`transform` voor `mascotte()`), om het punt op de rand. Zet er niets bij.
De titel komt binnen zonder `screenIn`. Wie een dier aantikt, laat het wippen
en het andere antwoordt (`wipOpRand()`); de landing van zo'n wip rimpelt de
punten. Wat de dieren uit zichzelf doen, rimpelt niet. Een tik op de plaat
zelf draait de zandloper meteen om (`draaiGlas()`, op `rotate`); de plaat
zakt niet in en er komt geen rimpel.

**Het instellingenscherm.** Vier groepen, in de volgorde waarin je ze nodig
hebt: Spel (moeilijkheid met de bak, kaarten per potje, tijd; alle drie
rijen keuzeknoppen, geen schuif), Voorkeuren
(aan/uit als één regel met twee kleine knoppen), Zo speel je (de vouwregel
is de groepskop), Deze app. Drie lagen tekst: hoofdletters alleen voor de
titel en de groepskoppen (klein, in `--ink-2`); veldnamen in inkt het luidst
na de titel; keuzeknoppen op `--line-2`, getallen erin in Fredoka
(`.chips.getal`). De systeemletter kent één vet: 700, nooit 800. Geen strepen onder koppen, en geen
uitlegzin onder een knop die zichzelf uitlegt: minder is meer.

## Kaarten

`DECKS` bovenaan `index.html`, één regel per kaart. Een stand is een
plafond: `poolFor()` geeft alle kaarten tot en met die moeilijkheid (90, 183,
275). Stuur de moeilijkheid bij met kaarten, nooit door scheef te trekken.

- één betekenis los van context, niets cultureel gebonden (mensenwerk, geen
  test ziet het);
- geen dubbele emoji of woorden, ook niet over de standen heen;
- geen ZWJ-reeksen en geen huidskleur-modifiers.

Hoe nieuw een emoji mag zijn is een keuze: de test meet alleen de machine die
hem draait. Kijk bij twijfel op het oudste toestel in huis.

**De bak en de greep.** De bak is alles waar uit getrokken kan worden; de
greep (16, 24 of 32) bestaat pas als je op Beginnen tikt (`drawDeck` in
`newGame`). Trek nooit vooruit. `settings.hidden` gaat op het woord, één lijst
voor alle standen; alles op het paneel gaat over de stand die je voor je
hebt. `MIN_BAK` (40) geldt over alle drie de standen. De sleuf van hint en
knop wisselt met `visibility`, nooit met `hidden`.

## Tests

`npm test` draait drie suites, en CI draait ze op elke pull request:

- `test/kern.test.js` toetst de spelkern in Node, in milliseconden
  (`npm run test:kern`). Dit is de plek voor een nieuwe spelregel.
- `test/deck.test.js` bewaakt de kaartregels in een echte browser.
- `test/game.test.js` speelt een volledig potje in een echte browser, zo'n
  anderhalve tot twee minuten. Hij klikt bewust trager dan 280 ms, omdat
  een dubbele tik op "goed" met opzet als één telt.

De browser komt uit `test/browser.js`: `CHROME` als die gezet is, anders
Playwright, anders een voorgeïnstalleerde Chromium onder `/opt/pw-browsers`.

Onder `?debug` staat `window.__tijd`, met onder meer `G`, `stopClock`,
`paintClock`, `sizeCard` en `toonInstall`. Daarmee zet je de klok stil op
een gekozen stand of fotografeer je een installeerstand. Bij zo'n opname:

- screenshot de kaart via `clip`, niet via de locator (onder vijf tellen
  klopt `.cardslot` en wacht Playwright eeuwig op stabiliteit);
- wacht 0,3 s na het zetten van een stand voor je `getComputedStyle` leest.
