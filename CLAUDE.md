# Tijd is Om

## Werkwijze

Werk af op een feature branch, open een pull request en merge die zelf. Niet
eerst om toestemming vragen — dat is de standaard voor deze repo. Alleen
wachten als er expliciet om een plan of een controle vooraf gevraagd wordt.

Merge zodra `npm test` hier lokaal groen is. Blijf niet naar de CI-run staan
kijken: die draait dezelfde twee suites nog een keer. Hier stond eerst dat je
erop moest wachten, en op 6 augustus kostte dat ruim een half uur — een run
bleef vijftien minuten in de wachtrij staan en werd toen door GitHub
afgebroken — voor één regel gewijzigde CSS waar geen enkele test iets over
beweert.

CI blijft draaien, maar als vangnet en als bewijs bij de PR, niet als hek. Hij
vangt de dag dat je vergeet lokaal te draaien, en verschillen tussen deze
machine en een verse `npm ci`.

**Wachten doe je wél** als de wijziging aan de speellogica zit, aan `DECKS`, of
aan de testharnas zelf. Daar zegt een verse omgeving met een volledig
doorgespeeld potje iets wat je hier niet ziet.

En weet waar de fouten echt zitten. Geen enkele misser in deze repo is ooit
door een test gevonden: de mascottes op 0 bij 0 pixels in het pauzepaneel, de
derde rechthoek om het merk, de kroon die liggend door de bovenrand schoot
(`min()` kiest bij negatieve waarden de méést negatieve), de stapel fiches die
de startknop van het scherm af duwde. Allemaal gevonden door te renderen en te
meten. Dát is de controle die telt — niet `npm test`, en al helemaal niet het
groene vinkje op GitHub.

De site draait op GitHub Pages vanaf `main`, dus wat niet gemerged is, staat
niet in de woonkamer.

## Gemerged is nog niet live

Die deploy is een eigen workflow (`pages build and deployment`), los van
`Tests`, en hij kan falen terwijl alles groen is. Het patroon: de
`build`-taak bouwt het artefact prima, en `deploy` blijft daarna tien minuten
op `Current status: deployment_queued` staan tot `Timeout reached, aborting!`.
Dat is een wachtrij aan de kant van GitHub — er is dan niets mis met deze
repo. Op 6 augustus gebeurde dat drie keer achter elkaar, waardoor drie
gemergede PR's alle drie niet in de woonkamer stonden terwijl alles er groen
uitzag.

Twee dingen om te weten als het gebeurt:

- **Eén geslaagde deploy haalt alles op.** Pages zet de hele `main` neer, geen
  diff. Mislukte deploys hoeven dus niet stuk voor stuk opnieuw; de
  eerstvolgende die slaagt, brengt alles mee.
- **Opnieuw draaien lost het níet op.** Het deployment-ID *is* de commit-SHA,
  en de time-out annuleert die deployment ("Canceled deployment with ID …").
  Elke volgende poging op dezelfde commit maakt dus opnieuw een deployment met
  een ID dat al geannuleerd is, en faalt binnen vijf seconden op "Deployment
  cancelled." — ook een volledige her-run met een vers gebouwd artefact. Wil
  je die commit alsnog live hebben, dan moet er een nieuwe op `main`: nieuwe
  SHA, nieuw deployment-ID.
- **Maar een nieuwe commit koopt alleen een nieuwe póging.** Hierboven stond
  eerst dat dat "de enige uitweg" was, en dat is te stellig gebleken: de
  commit die deze regels toevoegde kreeg keurig een vers deployment-ID en
  liep vervolgens net zo hard in dezelfde time-out. Ligt de wachtrij van
  Pages plat, dan helpt geen enkele commit — dan zet je er alleen werk
  achteraan. Vier keer achter elkaar mis in anderhalf uur is dus geen
  aanwijzing dat je iets fout doet; dat is wachten tot GitHub bijtrekt, en
  daarna één keer duwen.

Kijk na een merge dus niet alleen of `Tests` groen is, maar ook of
`pages build and deployment` op díe commit geslaagd is.

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

Dat geldt net zo goed voor goud, en daar is het één keer misgegaan: op het
overdrachtscherm stond goud tegelijk voor de kroon (staat voor), het
"+N"-label (net verdiend), de ronde-schijf (dit is de ronde nu), de rand om
de overgedragen tijd én de startknop. Vijf betekenissen op één scherm.
Het label is daarom groen geworden — die punten zijn geraden kaarten, en
geraden is `--good`, hetzelfde vlak met hetzelfde inkt-teken als de
goed-knop. Tel bij een nieuw element altijd even hoe vaak een kleur al op
datzelfde scherm staat.

Kleur staat ook nooit alleen: elke toestand heeft er een tweede kanaal bij
(een vorm, een teken, een woord, een beweging).

## Papier heeft twee randen, geen drie

`.surface` legt twee lagen onder een vlak: de kleurplaat een paar pixels naar
linksboven (`--mis`, de misregistratie van de pers) en de inktschaduw naar
rechtsonder. Samen met de eigen contour geeft dat twee zichtbare randen.

`--mis` staat standaard op doorzichtig. Wie geen kleurplaat wil, laat 'm
staan; alleen het merk en het pauzepaneel zetten 'm (op goud). Zet 'm nooit
op `--ink`: dan is de bovenste laag geen verschoven kleur meer maar een
tweede zwarte rand, en lijkt de kaart er drie te hebben. Dat is precies wat
er eerder gebeurde toen `--team: var(--ink)` als "geen kleur hier" werd
gebruikt.

Dezelfde fout andersom: **een laag in de kleur van de plaat zelf is geen
laag meer, maar een tweede plaat.** Op het merk (een inkt-vlak) viel de
inktschaduw van `.surface` naar rechtsonder in precies de kleur van de
plaat. Ze werd dus geen schaduw maar een tweede zwarte rechthoek die het
silhouet verlengde, en met de gouden kleurplaat linksboven erbij lagen er
drie rechthoeken over elkaar — zichtbaar op de twee hoeken waar niemand
kijkt, rechtsboven en linksonder, als een trap waar de ene rechthoek onder
de andere uitsteekt. Een inkt-vlak krijgt dus maar één verschoven laag.

Wélke, dat is de tweede helft van de les. Die laag stond linksboven, op de
plek van de misregistratie — en daarmee was het merk het enige vlak in de
app dat de andere kant op verschoof, terwijl elke andere kaart vijf pixels
naar rechtsonder van de pagina af ligt. Naast de opdrachtkaart van het
volgende scherm viel dat op: die lag óp het papier, het merk lag erin. De
gouden plaat is daarom de schaduw geworden — zelfde afstand en richting als
overal, alleen in goud in plaats van inkt:

```css
box-shadow: var(--lift-1) var(--lift-1) 0 0 var(--go);
```

Op een inkt-vlak kun je de misregistratie óf de lift hebben, niet allebei:
de laag die de lift geeft is juist de inktlaag die hier een tweede plaat
wordt. Een crème contour ertussen om plaat en schaduw te scheiden lost het
niet op — dan liggen er vier rechthoeken (goud, crème, zwart, zwart).

Een rand op de kleur van wat eronder ligt is óók een derde rand. Datzelfde
merk zette zijn contour op `--paper` om de inkt-rand van `.surface` te
neutraliseren — maar `--paper` is de pagina, dus dat werd geen rand maar een
spleet van vier pixels tussen de plaat en haar eigen lagen. Wie een contour
niet wil, zet `border: 0` en niet een kleur die toevallig wegvalt.

Kortom: tel bij elk vlak hoeveel rechthoeken er in het silhouet zitten, niet
hoeveel je er bedoeld hebt. Een screenshot met de hoeken uitvergroot laat het
in één blik zien; in de tests is het onzichtbaar.

## Vorm zegt wat het is, diepte hoe zwaar

Drie kanalen, en ze doen elk één ding:

- **Vorm.** Een cirkel op tapmaat is de handeling waar dit scherm voor
  bestaat: spelen, geraden, nog een keer, verder. Eén per scherm, nooit
  meer. Al het andere is een rechthoek — de mindere keuze (passen), de
  uitgang (pauze, huisje, tandwiel), de onomkeerbare (stoppen) en elke
  knop met tekst op het instellingenscherm. Een cirkel *onder* tapmaat is
  iets anders: een teken dat je telt, zoals de fiches op het scorebord.
  Het tandwiel brak dit als enige — een ronde knop van 64 px voor iets
  waar het titelscherm niet voor bestaat — en is nu gewoon een `.btn-icon`.
- **Diepte.** `--lift-2` (8 px) is de hoofdhandeling, `--lift-1` (5 px) al
  het andere. Dit stond ooit als "5 staat stil, 8 kun je indrukken"
  genoteerd en dat is nooit waar geweest: de pauzeknop, "terug", de chips
  en de voorvertoningskaartjes liggen allemaal op 5 px en zijn allemaal
  indrukbaar, op dezelfde hoogte als de kaart en de opdracht, die het niet
  zijn. Reken dus niet uit de schaduw af of iets een knop is.
- **Beweging.** Dát is waar indrukbaarheid staat: elke knop zakt bij
  `:active` precies zijn eigen schaduw in, een stilstaand vlak beweegt
  nooit.

Zet een primaire knop nooit met alleen `min()` op maat. De knop in het
pauzepaneel kromp liggend mee met de schermhoogte tot 68 px — even groot als
de stopknop ernaast — en dan wegen de hoofdhandeling en de onomkeerbare even
zwaar. Er hoort een `max()` met een ondergrens omheen.

## Wat je moet vasthouden, zegt dat

Een lange druk is alleen voor wat echt niet ongedaan te maken is, en dat is
nog precies één ding: **stoppen**. Die knop loopt via `holdButton()` en draagt
als enige de stippellijn — gestippeld betekent nu dus letterlijk "dit is de
onomkeerbare". `holdButton()` tekent de voortgang zelf, per frame: een
CSS-overgang zou bij `prefers-reduced-motion` meteen op vol springen, en het
toetsenbord zou de druk overslaan.

Die stippellijn is een regel ín de knop en niet haar contour, en dat is één
keer heen en weer gegaan. Eerst een streepje van 22 px onderin, in de kleur
van de knop zelf op 45% dekking: onzichtbaar, en het las als een vlekje.
Het antwoord daarop was de hele omtrek stippelen — waarmee stoppen het enige
vlak in de app werd zonder inkt-contour én zonder reliëf, en dus niet op het
paneel lag maar eruit geknipt leek. Rood-gestippeld betekent buiten deze app
bovendien "uitgeschakeld" of "sleep hier iets heen", niet "pas op".

De knop draagt nu dezelfde huid als pauze, huisje en terug (papier,
inkt-rand, `--lift-1`), en houdt drie eigen tekens: de gestippelde regel in
rust, het rood dat van onder naar boven volloopt tijdens het houden, en het
teken dat halverwege omkeert naar papier zodra die vloed het inhaalt. Dat
omslagpunt is het enige ijkpunt onderweg. Wat de eerste poging mankeerde was
contrast en maat — volle dekking, volle breedte, `--danger` — niet de plek.

Starten hoorde daar ooit ook bij, maar dat was het niet waard. De klok
starten is niet onomkeerbaar — pauze zet 'm zo weer stil — en de rekening
kwam bij de speler die deze knop élke beurt indrukt: een kind van vier, voor
wie 700 ms volhouden het lastigste gebaar in de app is. Wat de lange druk
écht afdekte was een strijkende vinger tijdens het doorgeven, en dat vangt
het **aftellen** nu op: tikken, drie tellen, dan pas de kaart en de klok. Een
misser kost drie tellen in plaats van een beurt, en er is meteen een tel om
je klaar te zetten. Tikken tijdens het aftellen breekt af — zonder die
uitweg zou een losse aanraking alsnog een beurt starten, alleen later.

Daarmee is de speelknop op de titel en die op het overdrachtscherm ook
dezelfde knop geworden: zelfde maat, zelfde vlak, zelfde rand. Ze betekenen
allebei "spelen", dus horen ze er niet verschillend uit te zien.

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
3. **start** -- één tik, de enige handeling; het aftellen komt erna.

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
staan. Een totaal met een groen "+N" ernaast zegt hetzelfde in vaste breedte,
met een kroon boven wie voorstaat (hetzelfde teken als op het winnaarsscherm,
want twee getallen vergelijken kan een vierjarige nog niet). Die stand blijft
kleiner dan de opdrachtkaart: ze is naslag, en de opdracht is het enige waar
de speler íets mee moet.

De knop rechtsboven draagt hier een huisje en geen pauzeteken: er loopt geen
klok, dus er valt niets te pauzeren. De enige reden om er te tikken is
weggaan -- en dat is wat het huisje op het winnaarsscherm ook betekent.

## Eén label voor "wat er bij komt", op beide schermen

Wat je tijdens een beurt verzamelt en wat er daarna op de stand bij komt, is
dezelfde grootheid, en dus hetzelfde ding: een groen `+N` met een
inkt-contour (`.gain`), rechts van de mascotte. Het waren twee dingen -- een
rij ploegkleurige fiches onder de mascotte tijdens het spelen, een groen
label ernaast op het overdrachtscherm -- en dan is er niets dat verraadt dat
het om hetzelfde gaat. Zelfde kleur, zelfde vorm, zelfde plek, zelfde
leesrichting.

Groen en niet de ploegkleur: dit zijn geraden kaarten, en geraden is
`--good`. De ploeg staat al in de mascotte ernaast.

## Eén stand, twee schermen

`#hoTally` en de stand in het pauzepaneel zijn hetzelfde onderdeel met
dezelfde twee tekens: de kroon boven wie voorstaat, de opgetilde tegel
(`.side.up`) onder wie aan zet is. Ze waren losse kopieën, en die groeiden
uit elkaar: de kopie in het paneel miste de `.head`-omhulling en viel
daardoor buiten `.mini-score .head > svg`, zodat beide mascottes op 0 bij 0
pixels stonden en er twee kale getallen overbleven zonder eigenaar --
precies het soort tekst-zonder-beeld dat de harde eis verbiedt. Wie de ene
aanpast, past de andere mee aan, of voegt ze samen.

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
