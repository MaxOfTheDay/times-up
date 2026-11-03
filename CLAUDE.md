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
  met overgedragen tijd, de winnaar, en `herstel()` voor een bewaard potje.
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

## Ontwerpregels

Elk punt heeft een hoofdstuk met dezelfde naam in `docs/ontwerp.md`.

**Kleur betekent één ding.** Rood is Vos, blauw is Uil, en verder niets.
Toestanden pakken een kleur uit `:root`: `--go` (goud, verdergaan), `--good`
(geraden), `--danger` (stoppen), `--time-3/2/1` (de klok). Tel bij een nieuw
element hoe vaak die kleur al op datzelfde scherm staat. Kleur staat nooit
alleen: elke toestand heeft een tweede kanaal (vorm, teken, woord,
beweging).

**Papier heeft twee randen, geen drie.** Tel bij elk vlak de rechthoeken in
het silhouet, met de stapel eronder weggehaald (`.cardslot .under` op
`display: none`). `--mis` staat overal op doorzichtig; zet hem nooit op
`--ink` of op één los vlak. Een inkt-vlak krijgt één verschoven laag: de
gouden plaat als schaduw naar rechtsonder. Een contour die je niet wilt is
`border: 0`, geen kleur die toevallig wegvalt.

**De klok windt af.** Alle drie de meters (kaartrand, `#cdArc`,
`#pauseRect`) rekenen met `perim * (1 - p)` en zijn verankerd
op twaalf uur. Kies bij een nieuwe meter het ankerpunt bewust. De band blijft
in één stuk, zonder inkepingen.

**Vorm zegt wat het is, diepte hoe zwaar.** Eén cirkel op tapmaat per scherm,
voor de handeling waar het scherm voor bestaat; al het andere is een
rechthoek. `--lift-2` (8 px) is de hoofdhandeling, `--lift-1` (5 px) de
rest. Indrukbaar is wat bij `:active` zijn schaduw inzakt. Een primaire knop
krijgt nooit alleen `min()`, maar een `max()` met ondergrens. Stapel nooit
twee knoppen van rand tot rand met verschillende lift. Een uitgang staat
rechtsboven.

**De hoek van het scherm is geen rechte hoek.** Elk blijvend rechthoekig vlak
houdt `--corner` (32 px) van beide schermranden. Tel `env(safe-area-inset-*)`
op (`calc(env(...) + marge)`), kies nooit met `max()`: in app-modus meldt een
Pixel onderaan nul. Controleer door de bogen te tekenen, niet met
`getBoundingClientRect()`.

**Wat je moet vasthouden, zegt dat.** Een lange druk is alleen voor het
onomkeerbare, en dat is precies één knop: stoppen, via `holdButton()`, als
enige met de stippellijn. Starten is een tik; het aftellen van drie tellen
vangt een strijkende vinger op. Afbreken kan tijdens het aftellen alleen
via de tegel rechtsboven (`#cdBack`), niet via het hele vlak.

**Eén overdrachtscherm, drie vakken.** `#s-handoff` is het enige scherm
tussen twee beurten: stand, opdracht, start. De stand staat ín de
opdrachtkaart. Beurtwissel en rondewissel hebben dezelfde maat en
verschillen in beweging (`.mode-round`): bij een beurtwissel ademt de
mascotte, bij een rondewissel komt de tekening op. Geen kroon, geen "+N", geen
fiche per punt op dit scherm. De wake lock blijft hier aan, begrensd op
`WAKE_MAX`.

**De ronde in drie maten** komt altijd uit `paintRound(ico, size, host)`
(`"teken"`, `"chip"`, `"kaart"`), nooit los bijgewerkt.

**Het aftellen draagt allebei de feiten**: de ronde en de ploeg (`.cd-team`
op papier). Beide tegels en de gouden schijf liggen op de gemeten plek van
hun tegenhanger, niet in CSS nagerekend. Meet de startknop in de
klik-handler.

**De worp verklapt zichzelf niet.** Zolang er geloot wordt is de grond
`--paper-2`; de ploegkleur komt als de worp landt. Laat de achtergrond niet
meeflikkeren.

**De grond stroomt, het scherm vervaagt niet.** `#s-handoff` en `#s-play`
hebben geen `screenIn`: op de overdracht stroomt alleen de grond van papier
naar ploegkleur, en het spelscherm verandert van grond niet. Bij beperkte
beweging geen vloed.

**Vertrekken mag, als er niets achter wacht.** Geen vertrekanimaties, behalve
`cdOut`, het oplossen van de pauzesluier bij hervatten (`.uit`) en de kopie
van de kaart die naar de teller krimpt of onder de stapel zakt
(`kaartSpook()`): de volgende kaart ligt er dan al onder. `hidden` gaat
meteen aan; `inert` pas na het verzetten van de focus.

**Beloning.** Een beurt en een ronde eindigen met een stempel op de kaart
(tijd om: de zandloper op inkt; stapel leeg: het vinkje op groen) en een
adem van `BEURT_ADEM` voor de overdracht. De mascotte in de balk reageert via
`mascotte()` (wip, juich, schrik), altijd met Web Animations en overgeslagen
bij beperkte beweging. De eindstand telt eerst op; de kroon en het feest
komen daarna.

**De eindstand telt niet, ze noemt.** Wie won staat in de kroon en de
mascotte die groeit; per ploeg het totaal, met de drie rondes klein eronder.
Twee totalen even groot. Grep voor je een korte klassenaam pakt (`.bar`
bestond al).

**Eén label voor "wat er bij komt".** Het groene `+N` (`.gain`) staat alleen
in de balk tijdens het spelen. Het vliegende punt draagt dezelfde huid, gaat
via Web Animations, en het getal plus de wip horen bij de landing
(`landFly()`), ook bij een schermwissel.

**Eén stand, twee schermen.** `buildTally()` bouwt de stand voor
`#hoTally` en `#pauseTally`. Ook de stijlen staan in één selectorlijst met
allebei de plekken; iets alleen onder `#s-handoff` laat het paneel achter.

**App-pictogram en installeerbaarheid.** Het manifest wordt in het geheugen
gebouwd (blob-URL) met een expliciete `id`, `start_url` en `scope`. De zin
die zegt wat de app is staat één keer, in `<meta name="description">`.
Pictogrammen en manifest-screenshots worden gegenereerd, nooit overgetypt
(`npm run pictogrammen`, `npm run schermen`, beide deterministisch). `sw.js`
is cache eerst, ververs erachter, met `res.ok` vóór `cache.put` en
`cache: "no-cache"` bij het verversen. Geen melding over een nieuwe versie.
Het installeerveld heeft vijf standen (`knop`, `zetop`, `menu`, `delen`,
`weg`), staat onderaan als vierde groep, en levert alleen de weg die het
platform heeft weggenomen.

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
