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
  Een omdraai die een klok of het aftellen start (verder, start), kijkt
  eerst of de app nog in beeld is. Uit beeld zwijgt `Snd` (`Snd.stil()`).
- Een `<img>` neemt geen aanraking aan (`pointer-events: none`), anders
  opent een lange druk het beeldmenu van Chrome over het spel.

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
   ook (het aftellen, de zandloper) en wiebelt de kaart de laatste vijf tellen. Alleen de dieren bewegen uit zichzelf:
   knipperen, ademen, juichen, rek en klets. Elke beweging pakt een lengte
   en een curve uit `:root` (`--t-press/los/kom/groot`, `--e-uit/los/weg/vloei`).
   (De klok, Vasthouden, Eén kaart twee kanten, Worp, Grond, Vertrekken, Beloning, Eén label)
4. **Stem: één betekenis per kleur, klank en trilling, nooit één kanaal.**
   Rood is Vos, blauw is Uil, goud is "dit, nu", groen is geraden. Geen
   woorden voor de spelers. (De harde eis, Kleur, Geluid en trilling)

Elke beweging is een van **zeven werkwoorden**, elk met één betekenis.
Past een nieuwe beweging in geen van de zeven, dan is ze waarschijnlijk
overbodig; anders krijgt ze hier een achtste regel. (Zeven werkwoorden)

| Werkwoord | Betekent | Zo ziet het eruit |
|---|---|---|
| Drukken | een vinger of de klok doet iets | het stuk zakt zijn schaduw in (`--t-press`) en veert terug (`--e-los`) |
| Ingedrukt blijven | dit staat stil: nog niet, of niet meer | ingezakt op `--paper-2` (`.neer`, `#s-play.over`) |
| Rimpelen | de druk raakt het bord | een golf door de punten in de vorm van wat drukte, alleen op een grond met punten |
| Omdraaien | wat nu komt staat op de achterkant | smal tot een rand en breed op de plek (`draaiOm()`/`draaiWeg()`, `landOm()`) |
| Stromen | wiens beurt het is | een grond groeit als cirkel uit wat je aanraakte of uit de kaart (ploegkleur over papier, papier over ploegkleur); nooit een vervaging |
| Vliegen | dit is binnen | de geraden kaart naar de buit (`vliegKaart()`) |
| Leven | alleen Vos en Uil | ademen, knipperen, wippen, juichen, schrikken, duiken en gluren |

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
rechthoek. `--lift-2` (6 px) is de hoofdhandeling, `--lift-1` (4 px) de
rest; `--lift-1` nooit dunner dan `--line`. Indrukbaar is wat bij `:active` zijn schaduw inzakt: snel in
(`--t-press`), verend uit (`--t-los`). Een primaire knop
krijgt nooit alleen `min()`, maar een `max()` met ondergrens. Stapel nooit
twee knoppen van rand tot rand met verschillende lift. Een uitgang staat
rechtsboven. Een nieuwe knop gaat in de selectorlijst van 3. KNOPPEN, anders
veert hij niet terug. Een cirkel op een stippengrond stuurt bij de druk een
rimpel vanaf zijn rand (`knopRimpel()`, en `rimpelDoor()` als het scherm
meteen wisselt); een rechthoek niet. Uitzondering: goed en pas op het
spelscherm, want die worden tien keer per beurt ingedrukt naast de kaart. Glijdt die cirkel daarna over de
punten, dan neemt hij zijn golf mee: zwakke ringen vanaf zijn rand zolang
hij onderweg is (`golfMee()`), geen tweede rimpel bij de landing. Vervormen (rek en klets) is alleen
voor Vos en Uil: een knop zakt in, hij knijpt nooit.

**De hoek van het scherm is geen rechte hoek.** Elk blijvend rechthoekig vlak
houdt `--corner` (32 px) van beide schermranden. Tel `env(safe-area-inset-*)`
op (`calc(env(...) + marge)`), kies nooit met `max()`: in app-modus meldt een
Pixel onderaan nul. Controleer door de bogen te tekenen, niet met
`getBoundingClientRect()`.

**Wat je moet vasthouden, zegt dat.** Een lange druk is alleen voor het
onomkeerbare, en dat is precies één handeling: stoppen, via `holdButton()`
(`.btn-houd`). Het huisje staat op twee plekken: in de hoek van de
overdracht (`#btnStopHo`) en op de achterkant van de speelkaart
(`#btnStop`). Er staat nooit een huisje dat een tweede huisje opent. Het
teken is het huisje, nooit een kruis (een kruis betekent "sluit dit
paneel"), zonder stippellijn of ander teken in rust: een losse tik doet de
druk voor in plaats van te weigeren, en dat leert de knop. Loslaten laat de
vloed leeglopen; de terugveeg op de overdracht doet de druk voor. Starten is een
tik; het aftellen van drie tellen vangt een strijkende vinger op. Afbreken
kan tijdens het aftellen alleen via de tegel rechtsboven (`#cdBack`), met
het pauzeteken, niet via het hele vlak.

**Eén overdrachtscherm, drie vakken.** `#s-handoff` is het enige scherm
tussen twee beurten: stand, opdracht, start. De stand staat ín de
opdrachtkaart. Beurtwissel en rondewissel hebben dezelfde maat en
verschillen in beweging (`.mode-round`): bij een beurtwissel duikt wie net
speelde achter de rand en komt de ander op (`RAND_WEG`, `RAND_OP`, op de
ploegklank; zijn landing rimpelt de punten), bij een rondewissel krimpt de gouden schijf tot tegel en groeit de
volgende ronde tot schijf (`.ronderij`, `paintRij()`). Wat de kaart draagt
(stand, ronde, wat er nog ligt) scheidt lucht, geen lijn: de cijfers
groot onder hun dier. Aan de voet, als bijzaak, wat er nog ligt (`#hoCards`)
en de seconden van de beurt (`#hoSecs`), altijd allebei: elk een teken en
een getal in `--ink-2`, zonder kader (met een kader leest de teller als een
rondetegel). De drie rondes staan
als één rij: nu is de schijf, de andere zijn gelijke papieren tegels, en de
plek links of rechts zegt geweest of nog te komen. Geen kroon, geen "+N", geen
fiche per punt op dit scherm. Vos en Uil zitten op de bovenrand van de
opdrachtkaart zoals op het merk (`.gluur`): wie aan zet is rechtop en
ademend, de ander gluurt tot de ogen; in de stand staan alleen de cijfers,
elk onder zijn dier. De wake lock blijft hier aan, begrensd op
`WAKE_MAX`.

**Eén pen voor tekening en mascotte.** Het teken op de kaart (en in
`#kijk`) krijgt de inktlijn van Vos en Uil: vier `drop-shadow`s zonder
vervaging, 4 px (2 px op de kleine plaatjes). Niet vlakker maken met een
filter. De mascottes en de rondetekens nemen voor hun lijn
`max(eigen dikte, min(var(--pen), plafond))`; `penLijn()` zet `--pen` per
svg, zodat geen lijn dunner wordt dan 2,3 px op het scherm. Een nieuw
gebruik buiten `svgUse()` meld je daar aan.

**De ronde in drie maten** komt altijd uit `paintRound(ico, size, host)`
(`"teken"`, `"chip"`, `"kaart"`), nooit los bijgewerkt.

**Eén kaart, twee kanten.** De opdrachtkaart is de achterkant van de
speelkaart. Start draait haar om (`draaiWeg()`) en de startknop zakt achter
de onderrand weg; op het spelscherm wordt de speelkaart breed vanaf de
gemeten opdrachtkaart (`landOm(..., KAART_GROEI)`; meet in de klik-handler).
De balk staat er dan al (wie, de ronde, de klok met de seconden die komen;
`#cdBack` ligt alleen op het pauzeteken), goed en pas wachten ingedrukt. Het aftellen is de klok die
zich opwindt: drie rukken op één maat (`TEL_EERST`, `TEL_MAAT`), elk een
derde band (`rukBand()`), de kaart die haar schaduw inzakt (`drukKaart()`),
het volgende cijfer groot in inkt op de kaart (`.cd-cijfer`, geen goud en
geen raster) en een rimpel in de vorm van de kaart (`rimpelRand()`), elke
tel iets sterker. Op nul draait de kaart om naar het eerste woord (de
landing meet de kaart pas als haar vouw los is: `draaiOm()`) en veren goed
en pas op; de punten blijven. De laatste vijf tellen wiebelt de kaart, één
heen-en-weer per seconde op de tik (`.cardslot.hurry`), symmetrisch, met
`--e-vloei`.

**De worp verklapt zichzelf niet.** Zolang er geloot wordt is de grond die
van de titel (papier, inkten punten); de ploegkleur groeit als een cirkel uit
de startknop als de worp landt (`veldHo.onthul()`). Laat de achtergrond niet
meeflikkeren. Een druk die de grond verandert, laat de nieuwe grond uit die
knop groeien; de knop zelf glijdt mee (`rimpelDoor()`), en de kaart die je
zag (het merk, de eindstand) draait om naar de eerste opdracht. Naar huis
ook: de titel groeit als cirkel uit de knop (`naarTitel()`), en Nog een
keer laat de grond van de worp zo uit zijn knop groeien (`groeiUit()`). Afbreken op
het aftellen houdt de grond (`handoff(..., zelfdeGrond)`) en draait de kaart
terug naar de opdracht (`terugNaarOpdracht()`).

**De grond stroomt, het scherm vervaagt niet.** `#s-handoff`, `#s-play` en
`#s-winner` hebben geen `screenIn`. Een grond verandert altijd als cirkel,
nooit als vervaging (die liep door grijsblauw en zalmroze, buiten het
palet): uit de knop die je indrukte, of uit de kaart waar de beurt gebeurde.
Bij tijd om en een lege stapel groeit het papier uit de kaart over de
ploegkleur (`papierUitKaart()`, `#plVloed`); op de overdracht en de
eindstand groeit de ploegkleur uit de kaart die daar landt
(`kleurUitKaart()`, op `onthul()`). Nooit rechtstreeks naar de andere
ploeg, want dat mengt door paars. Het spelscherm verandert van grond niet:
het is de ploegkleur met de punten van het aftellen, die de hele beurt
stil blijven liggen: het canvas van het aftellen (`veldCd`) tot `NA_NUL`
na nul, daarna dezelfde punten stil in CSS (`--stip`). Bij beperkte beweging geen vloed. De rasterpunten op die grond zijn papier op lage
dekking, per ploeg op hetzelfde contrast (`STIP_PAPIER`: 23% op rood, 16%
op blauw), geen eigen kleur, op één stilstaand raster van 12 px, getekend
op één canvas per grond (`stipveld()`). Wat beweegt is rastertoon: een punt
groeit, hij licht niet alleen op. Ze lopen van rand tot rand, zonder
uitsparing: de stukken liggen erop (`opt.masker` is een haak, geen
standaard). Ze bewegen alleen als iets ze indrukt (geen deining): een tik op de grond geeft een rimpel die de
punten opzij duwt en terug laat veren: 12 px opzij en een punt tot ruim het
dubbele, want minder leest op een telefoon als niets; in het dal achter de
kam krimpen ze. Het canvas tekent tot 3x. Ze staan op de
overdracht, het aftellen en het spelen, de eindstand (in de ploegkleur van wie won, bij
gelijkspel inkt op papier) en de titel, die van allebei de ploegen is en dus
inkt op papier krijgt (12%, `inkt: true`). De stralen van de eindstand
zitten ín de punten: groter binnen twaalf stralen, die rond blijven draaien
zolang het feest in beeld is (`veldWn.stralen()`), het enige dat buiten de
dieren uit zichzelf beweegt; op het aftellen gaat bij elke tel
een golf vanuit de rand van de kaart, in haar vorm (`rimpelRand()`), op de
eindstand barst het vuurwerk in de punten (`vuurwerk()`). Na een beurt
groeien ze op de overdracht als rastertoon terug vanuit de kaart
(`toon()`). Er loopt alleen een lus zolang er iets beweegt; bij beperkte
beweging één stilstaand beeld.

**Vertrekken mag, als er niets achter wacht.** Geen vertrekanimaties, behalve
de startknop die na zijn tik achter de onderrand wegzakt, het oplossen van
de sluier van het losse pauzepaneel bij hervatten (`.uit`; alleen de
sluier, `.overlay::before`, het paneel vervaagt nooit), de eerste helft
van het omdraaien (`draaiOm()`, `draaiWeg()`, `draaiPauze()`, `closePause()`, `sluitKijk()`), het scherm
onder de titelcirkel (`naarTitel()`) en de kopie
van de kaart die naar de teller krimpt of onderop gaat
(`kaartSpook()`: eerst bóven de stapel omlaag, dan erachter terug in): de volgende kaart ligt er dan al onder. `hidden` gaat
meteen aan; `inert` pas na het verzetten van de focus.

**Beloning.** Een beurt en een ronde eindigen met een stempel op de kaart
(tijd om: de zandloper op inkt; stapel leeg: het vinkje op groen) dat
goed en pas indrukt: ze zakken hun schaduw in en blijven op `--paper-2`
liggen, nooit vervagen (een tint op een stromende grond mengt kleuren buiten
het palet), en een adem van `BEURT_ADEM` waarin de buit op zijn plek
springt (hij groeit niet over het rondeteken); dan draait de kaart om (`draaiOm()`, `landOm()`) en
is haar achterkant de opdracht, de volgende ronde of de eindstand. De mascotte in de balk reageert via
`mascotte()` (wip, juich, schrik, nee bij overslaan), met rek en klets, altijd
met Web Animations en overgeslagen bij beperkte beweging; bij juich, schrik en
nee wisselt ook het gezicht (`#m-vos-blij`, `#m-uil-schrik`, `-dicht`), en
elke mascotte in beeld knippert om de paar tellen (`knipperLus()`), en wie wint lacht op de eindstand. De eindstand telt eerst op; de kroon en het feest
komen daarna: vier rimpels bij de hoeken op de noten van de fanfare, een
ring uit de kaart op de slotnoot, en één val snippers.

**De eindstand telt niet, ze noemt.** Wie won staat in de kroon en de
mascotte die rechtop komt; per ploeg het totaal, met de drie rondes klein eronder.
Twee totalen even groot, op een papieren kaart zo breed als de opdrachtkaart
(`.wn-kaart`). Vos en Uil zitten op haar bovenrand zoals op de overdracht:
wie won gluurt tijdens het optellen en komt overeind met de kroon, de ander
gluurt tot de ogen; bij gelijkspel staan ze allebei. Grep voor je een korte
klassenaam pakt (`.bar` bestond al).

**Eén label voor "wat er bij komt".** Het groene `+N` (`.gain`) staat alleen
in de balk tijdens het spelen. Bij goed vliegt alleen de kaart erin
(`vliegKaart()`), geen los `+1`: op `--e-vloei`, dekkend tot ze er is,
en ze krimpt tot precies de hoogte van het vak. De kaart eronder ligt er al
en beweegt niet, ook niet na pas. Terugnemen
(`kaartTerug()`) is dezelfde vlucht achterstevoren. Via Web
Animations; het getal plus de wip horen bij de landing (`landFly()`), ook
bij een schermwissel.

**De balk heeft drie stukken.** Wie (`.who`: mascotte | buit), hoe (het
rondeteken, alleen, in het midden) en de klok (`.klokknop`: seconden |
pauze), allemaal `--balk` hoog, in die volgorde. Twee vakken in één stuk
scheidt een inktlijn; niets ligt over een ander stuk heen. Alleen de
klokknop heeft lift. Op het aftellen staat de balk er al; alleen ligt
`#cdBack` dan op de gemeten plek van de klokknop. Tekst in de balk staat op papier of op het groen, nooit op de
ploegkleur.

**Pauze legt het spel weg en draait de kaart om, zonder sluier.** De grond
blijft vlak in de ploegkleur (hij zegt wie er speelt); wat verandert is de
vorm van het bord: goed en pas zakken achter de onderrand, de mascotte en
het rondeteken schuiven boven de rand weg, de stapel onder de kaart is weg
(`legSpelWeg()`, `#s-play.pauze`, op `translate`), en de klokknop blijft
ingedrukt (`PAUZE_NEER`). Geen donkere grond, geen punten, geen papier: een
sluier of donkere inkt gaf bruin en marine, papier leek op de titel of het
einde van een beurt. Alleen het losse paneel houdt de sluier. Terugkijken
naar de stapel (`#kijk`) gaat net zo: de opdrachtkaart draait om, haar
achterkant toont de kaarten die nog liggen, de startknop zakt weg
(`legKijk()`, `sluitKijk()`), zonder sluier. Tijdens een beurt ligt het pauzepaneel als
achterkant op de gemeten plek van de kaart (`legPaneel()`), met haar eigen
stilstaande band als rand. Erop drie dingen: het rondeteken (`#pauseRonde`)
in het midden, "verder" eronder, het huisje rechtsboven; geen stand (die
hoort op de overdracht), geen dieren, geen zandloper; alles in `cqmin`,
zodat het met de kaart meeschaalt. Geen tweede
klok, geen pauzebalken, en het woord ligt afgedekt. Verder draait haar weer
helemaal om: de achterkant wordt smal, dan de kaart breed (`closePause()`,
`kaartBoven()`); pas daarna loopt de klok. Op de overdracht is er geen pauze: er loopt geen klok,
en het huisje in de hoek is zelf de uitgang. Past de achterkant niet op de
kaart, dan een los paneel met de deuren naast elkaar.

**Eén stand.** `buildTally()` bouwt de stand voor `#hoTally`, de enige
plek waar hij staat. Ook de pauze laat hem weg: midden in een beurt helpt
hij je niet verder.

**Geluid en trilling.** Eén betekenis per cue, nooit het enige kanaal.
Alle cues lopen door `Snd` en `Tril`, naar één bus met compressor. Geen
muziek. Elke cue moet op een telefoonluidspreker hoorbaar zijn: geen sinus
onder 400 Hz als drager, meet met het telefoonmodel uit `docs/ontwerp.md`.
De ploeg klinkt (`Snd.ploeg`) alleen waar de worp landt, waar een beurt of
ronde overgaat (in `turnEnd`/`endRound`, niet in `handoff()`) en na de
fanfare. Een trilling duurt minstens 20 ms. Een rimpel trilt niet: de
trilling hoort bij de gebeurtenis (een tel, het startsein, het vuurwerk),
niet bij het beeld van een druk.

**App-pictogram en installeerbaarheid.** Het manifest wordt in het geheugen
gebouwd (blob-URL) met een expliciete `id`, `start_url` en `scope`. De zin
die zegt wat de app is staat één keer, in `<meta name="description">`.
Pictogrammen en manifest-screenshots worden gegenereerd, nooit overgetypt
(`npm run pictogrammen`, `npm run schermen`, beide deterministisch). `sw.js`
is cache eerst, ververs erachter, met `res.ok` vóór `cache.put` en
`cache: "no-cache"` bij het verversen. Geen melding over een nieuwe versie; wel een stille herlaadbeurt als de
pagina verborgen raakt op de titel zonder bewaard potje (`meldNieuw()`).
Het installeerveld heeft vijf standen (`knop`, `zetop`, `menu`, `delen`,
`weg`), is hoogstens één rij in de lijst van Deze telefoon (zonder
uitlegzin), en levert alleen de weg die het platform heeft weggenomen.

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

**Het instellingenscherm.** Vier groepen, elk één vraag: Potje (hoe lang
een potje loopt: Aantal kaarten met de telling van de menging op de regel
van de naam, Tijd per beurt), Kaarten (welke kaarten erin kunnen: een
lijst met Gewone en Eigen, elk met haar stand onder de naam: de
moeilijkheid, en hoeveel eigen kaarten er in elk potje gaan), Deze telefoon (Geluid en Trilling als schakelaars in een lijst,
en de rij om te installeren of te delen), Zo speel je (één rij naar
`#s-regels`). Een veldnaam
herhaalt zijn groepskop niet. De lange lijsten staan op hun eigen scherm,
`#s-kaarten`, één lijst per bezoek: de titel zegt welke ("Gewone kaarten",
"Eigen kaarten"), zonder tabbladen, met de uitgang rechtsboven, Moeilijkheid
bovenaan Gewone en "In elk potje" bovenaan Eigen; terug brengt je op
Instellingen (`terug()`). Onder Gewone één regel (het aantal in de bak, de
sleuf), en bij het scrollen een greep rechts die je sleept, met de letter
groot ernaast (`.cb-greep`, `.cb-bel`); in rust staat er niets naast het
raster. Twee soorten stukken, elk één betekenis: een rij
keuzeknoppen kiest er één, een rij in een `.lijst` gaat naar een scherm (de
pijl) of schakelt (`.knop`, goud is aan). Een rij zakt niet in; een druk kleurt hem. De keuzes zijn rijen
keuzeknoppen, geen schuif. Drie lagen tekst: hoofdletters alleen voor de
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

**De bak en de greep.** De bak is alles waar uit getrokken kan worden:
in Instellingen twee rijen (Gewone, Eigen), elk met haar getal; een tik
opent haar kaarten op `#s-kaarten`, één lijst tegelijk (`settings.lade`,
`openKaarten()`). De greep (16, 24 of 32) bestaat pas als je op Beginnen tikt (`drawDeck` in
`newGame`). Trek nooit vooruit. Wat in de greep gaat, komt eerst uit de
kaarten die het langst niet kwamen (`tijdisom.gezien`, per woord, ook voor
eigen kaarten via `laatst`), zodat Nog een keer andere kaarten deelt. `settings.hidden` gaat op het woord, één lijst
voor alle standen; alles op het paneel gaat over de stand die je voor je
hebt. `MIN_BAK` (40) geldt over alle drie de standen. De sleuf van hint en
knop wisselt met `visibility`, nooit met `hidden`.

**Eigen kaarten.** Een foto of tekening met het woord dat telt, gemaakt in Instellingen
op een eigen scherm (`openMaker()`, `#s-maker`, terug brengt je waar je
vandaan kwam). De lijst staat in `tijdisom.eigen`, de beelden in IndexedDB
(`Beeld`), niets verlaat de telefoon. In de greep is een eigen kaart
`[Spel.EIGEN + id, woord]`.

- `Spel.drawDeck` neemt er het gekozen aantal van
  (`settings.eigenAantal`, een van `Spel.EIGEN_AANTALLEN`: 0, 2, 4, 8;
  standaard 4; nooit meer dan de helft van de greep), de langst niet
  getrokken eerst, en een eigen kaart verdringt de gewone met hetzelfde
  woord. Een vast aantal en geen deel: de knoppen veranderen niet mee met
  16, 24 of 32. Je kiest het bovenaan Eigen op `#s-kaarten`, met de
  uitkomst ernaast (`paintPotje()`); de rij van Eigen op Instellingen
  zegt "4 in elk potje". Met minder eigen kaarten draagt de eerste knop
  die meer vraagt hun aantal; een verzonken knop houdt zijn eigen getal.
- Een kaart zonder beeld bestaat niet: `Spel.zonder()` en
  `herstel(..., weg)` halen haar uit de stapel. Het herstel bij de start
  wacht daarom op `eigenKlaar`.
- Elk teken op een kaart gaat door `zetTeken()`. Een foto ligt kaal op het
  papier (`.kaal`, geen inktlijn: om een vierkant is dat een derde rand);
  een tekening houdt de pen van `.glyph`, behalve een getoverde.
- Zonder eigen kaarten heeft de rij Eigen een gestippelde plus en opent
  ze meteen de maker; na bewaren staat `#s-kaarten` open op Eigen. Daar
  staan de kaarten in hetzelfde raster als de gewone, met vooraan één lege kaart met een plus (`#btnEigenNieuw`),
  gestippeld en plat; nooit een rij die opzij schuift.
  Foto of tekening kies je onder de titel van de maker (`#mkSoort`, `wisselSoort()`):
  het woord gaat mee, wat er al was blijft als klad, en een nieuwe kaart
  opent in de soort van de vorige keer (`tijdisom.soort`). Een bestaande
  kaart heeft die keuze niet. Er is geen Aan/Uit: 0 bij "In elk potje"
  is uit, en dan staat "uit" in de rij.
- Is het woord al een gewone kaart, dan zegt een regel onder het woord dat
  (`#mkAl`, `gewoneKaart()`); bewaren mag nog steeds.
- Bewaren is goud zodra er een beeld is; zonder woord wijst een tik de
  woordregel aan (`nudge()` en focus). Weggooien kost twee tikken; een niet
  bewaarde nieuwe kaart blijft per soort als klad liggen.
- Een nieuwe kaart opent op de camera in het vierkant (`startCam()`), met
  het album als terugval. De camera gaat uit bij afdrukken, sluiten en
  verbergen (`stopCam()`); de voorcamera spiegelt alleen in de zoeker.
- Of je tekent haar in hetzelfde vierkant (`mkDoek`): zes tekenkleuren
  zijn inhoud, geen betekenis. Een tekening is een doorzichtige PNG en
  krijgt de pen van `.glyph`, geen kader.

**Toveren.** De toverstaf vraagt een tekening aan een Cloudflare Worker
(`worker/tover.mjs`, uitgerold door `.github/workflows/worker.yml`, adres in
`TOVER_URL`; leeg is geen staf). Het is de enige plek waar de app het net op
gaat, alleen op een tik van de volwassene, en alleen met het woord. Zonder
net, of als het dagbudget op is, werkt alles behalve de staf.

- De staf ligt midden op het lege vel van Tekenen (`#mkStaf`, rond, de fiche
  van Tekenen), daarna in het gereedschap (`#mkStafRij`); er is geen derde
  soort kaart. Zolang hij tovert blijft hij ingedrukt en drukt hij om de
  `TOVER_TEL` een ring door de punten van het vel (`toverGolf()`, `veldMk`).
- Een getoverde tekening is één actie in `mk.acties` (`{ beeld }`) die het
  vel vervangt, met de achtergrond weggeknipt (`knipUit()`) en bijgesneden
  tot de tekening (`snijBij()`). Ze heeft haar eigen zwarte lijn en ligt
  dus kaal, zonder de pen van `.glyph` (`getoverd` op de kaart).

## Tests

`npm test` draait vier suites, en CI draait ze op elke pull request:

- `test/kern.test.js` toetst de spelkern in Node, in milliseconden
  (`npm run test:kern`). Dit is de plek voor een nieuwe spelregel.
- `test/tover.test.js` toetst de toverstaf-Worker met een nagebootste
  Workers AI (`npm run test:tover`).
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
