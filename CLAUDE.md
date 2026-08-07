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

**Maak de branch aan vóór je iets wijzigt, en kijk naar de diff van de PR
voordat je merget.** Anders commit je op de lokale `main` terwijl de branch
op iets ouds blijft staan, en dan merget de PR keurig een lege commit: PR #37
heeft de goede titel, groene CI en nul gewijzigde regels. Dat is niet ergens
op stukgelopen — het is gewoon nooit meegegaan, en een `git reset --hard
origin/main` daarna gooide het echte werk weg. De hoekenfix moest er
daardoor twee keer komen. Twee controles vangen dit: `git log --oneline -1`
op de branch vóór het pushen, en de regel "N files changed" op de PR.

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

Op de kaart stáát nu zo'n woord, onder de tekening, en hier stond eerst dat
spelers het nooit te zien kregen. Dat was geen regel maar een misverstand
over de eis: "hoeft niet te lezen" is niet hetzelfde als "mag niets zien".
Een emoji is dubbelzinnig — een luiaard leest als beertje, een zeehond als
dolfijn, een eekhoorn als muis — en de omschrijver moet weten wélk woord
telt, anders krijg je "ik zei toch beer!" aan tafel. Het woord beslecht dat
zonder dat iemand iets moet: het zegt exact hetzelfde als het beeld erboven,
en wie niet leest mist niets. Dezelfde constructie als de ronde-tegel
(pictogram plus OMSCHRIJVEN) en de voorvertoning op de instellingen.

Wat de eis wél verbiedt is tekst die iets toevoegt dat het beeld niet zegt.
Een woord dat pas na tien seconden verschijnt als hint zou daaronder vallen,
en een woord dat de kaart moeilijker of makkelijker maakt ook. Blijf dus bij
"zoals een vierjarige het zou zeggen", en zet het in `--ink-2` zonder kader:
het teken is de mededeling, het woord is het bijschrift.

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

`--mis` staat standaard op doorzichtig, en dat is inmiddels overal zo: geen
enkel vlak zet 'm nog. Het merk en het pauzepaneel deden dat samen, tot het
merk zijn plaat als slagschaduw ging dragen (zie hieronder) -- en toen was
het paneel de laatste. Een misregistratie die op één plek voorkomt is geen
kenmerk van de pers meer maar een gouden randje zonder reden, en op dat
scherm was het meteen een derde betekenis voor goud naast de wijzerplaat en
de verder-knop. Weg dus.

Wie 'm ooit weer aanzet: zet 'm nooit op `--ink`. Dan is de bovenste laag
geen verschoven kleur meer maar een tweede zwarte rand, en lijkt de kaart er
drie te hebben. Dat is precies wat er eerder gebeurde toen
`--team: var(--ink)` als "geen kleur hier" werd gebruikt. En zet 'm niet op
één los vlak: een kleurplaat die nergens anders terugkomt, verklaart zichzelf
niet.

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

Wat wél mag: **twee lagen op precies hetzelfde pad zijn geen twee ringen maar
één ring in twee toestanden.** De klokbaan om de kaart heeft er zo een — een
lege baan in `--paper-2` onder de inkt die afwindt, op dezelfde `d`, dezelfde
streekdikte, dezelfde plek. Zonder haar zie je alleen hoevéél inkt er nog is
en niet welk deel op is, en voor een verhouding heb je een referentie nodig.
Dat "precies" is de hele voorwaarde: wijkt de baan een pixel af, of geeft ze
zichzelf een contour, dan is het alsnog een rand erbij. `--paper-2` is de
kleur die deze app al voor tracks en putjes gebruikt, dus het is geen nieuw
vlak maar een bekend.

Kortom: tel bij elk vlak hoeveel rechthoeken er in het silhouet zitten, niet
hoeveel je er bedoeld hebt. Een screenshot met de hoeken uitvergroot laat het
in één blik zien; in de tests is het onzichtbaar. Doe die telling met de
stapel eronder weggehaald (`.cardslot .under` op `display: none`) — anders
tel je de scheve kaarten van de stapel mee en lijkt elke hoek een trap.

## De klok windt af

Er zijn vier voortgangsmeters in deze app: de rand om de kaart, de
aftelschijf (`#cdArc`), de overgedragen tijd op het overdrachtscherm
(`#carryRect`) en de stilstaande wijzerplaat in het pauzepaneel
(`#pauseRect`). Ze rekenen alle vier met `perim * (1 - p)`, en dat betekent
dat de inkt aan haar beginpunt vast blijft zitten terwijl het vrije uiteinde
zich terugtrekt. De band windt dus af, tegen de wijzers in, zoals een
keukenwekker die je hebt opgedraaid.

Dat is één keer omgedraaid met "een klok loopt nu eenmaal met de wijzers
mee" als reden, en dat is een regel van buiten deze app: hij zou de kaartrand
de enige van vier maken die de andere kant op gaat. Aflopende tijd wíndt af.

Wat er wél te kiezen valt is het **ankerpunt**: de plek waar de band vast zit
en waar dus de laatste inkt overblijft als de tijd bijna om is. Bij de kaart
lag dat lang linksboven, niet omdat het gekozen was maar omdat een `<rect>`
zijn pad nu eenmaal linksboven begint — precies in de hoek waar de mascotte
en de teller al om aandacht vragen. Het is nu een `<path>` die op het midden
van de bovenrand begint: twaalf uur, pal boven het teken. Wie een meter
toevoegt, kiest dat punt dus bewust in plaats van het aan de vorm over te
laten.

En hou de baan in één stuk. Er hebben even inkepingen op de hele seconden in
gezeten, zodat je de laatste tien tellen kon tellen in plaats van schatten.
Dat wérkte, maar een band die op het drukste moment van de beurt in stukken
uiteenvalt trekt de blik weg van de kaart — en de kaart is het enige waar de
speler dan íets mee moet. Haast hoort in de rand te zitten zonder dat je
ernaar kijkt. Prijs daarvan: de stap op tien seconden is kleur en niets
anders (de band verkleurt, en het cijfer ernaast verkleurt mee, wat hetzelfde
kanaal twee keer is). Wie dat ooit wil repareren, zoekt iets stils — de band
die dikker wordt, bijvoorbeeld — en niet iets dat beweegt of opbreekt.

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

En: **stapel nooit twee knoppen van rand tot rand met een verschillende
`--lift`.** Op het instellingenscherm stonden "Beginnen" (8 px) en "Terug"
(5 px) allebei op `width: 100%` boven elkaar, en dan lopen hun silhouetten
3 px uit de pas — een trapje aan de rechterkant dat je ziet zonder het te
kunnen benoemen. Uitlijnen kan niet: de schaduw hoort bij het gewicht, en het
gewicht hoort te verschillen. Kwam bovenop een tweede rekenfout: het gat
ertussen was `--s-2` (8 px) en de schaduw van de bovenste ook, dus die
schaduw landde precies op de rand van de onderste. Ze deelden een rand en
lazen als één blok, en bij `:active` zakte de bovenste er echt tegenaan.

De echte fout zat er nog onder. **Een uitgang hoort rechtsboven**, niet
onderaan tegen de hoofdhandeling geplakt — daar leest hij als gelijkwaardige
keuze ("beginnen of terug?") terwijl het titelscherm waar hij heen gaat
strikt minder kan dan het scherm dat je verlaat. "Terug" is daarom het
huisje in die hoek geworden, dezelfde knop als op overdracht en winnaar, en
dezelfde hoek waar je via het tandwiel binnenkwam. De voet zakte van 175
naar 115 px; liggend van 45% van het scherm naar 29%.

Prijs die daarbij hoort en die je moet zien: een zwevende hoekknop op een
scherm dat scrollt, krijgt de inhoud ónder zich door. De chips schuiven met
hun eigen kader en schaduw langs het kader en de schaduw van het huisje. Zijn
eigen vlak is dekkend, dus hij blijft leesbaar, maar het is even druk in die
hoek. Wie dat wil verhelpen maakt de titelregel plakkend met een dekkende
`--paper`-band — en betaalt daar liggend zo'n 15% schermhoogte voor, precies
waar net ruimte gewonnen is.

## De hoek van het scherm is geen rechte hoek

Een telefoon met gebogen hoeken snijdt weg wat er te dicht in de bocht staat,
en `env(safe-area-inset-*)` waarschuwt daar niet voor: dat zegt alleen wat het
tóéstel opeist (statusbalk, gebarenbalk, notch), niets over de ronding. Twee
regels, allebei hier misgegaan:

- **Optellen, niet kiezen.** `calc(env(...) + eigen marge)`, nooit
  `max(env(...), marge)`. Met `max()` verdwijnt je eigen marge zodra het
  toestel iets opeist — en andersom net zo goed: in app-modus (`standalone`)
  meldt een Pixel 10 onderaan gewoon **nul**, dus `max(12px, env(...))` gaf
  exact 12 px en de knop stond twaalf pixels van de fysieke onderrand. Van
  het toestel valt daar dus niets te verwachten; die marge moet volledig uit
  onszelf komen.
- **Eén maat voor beide assen.** In een hoek telt de afstand tot allebei de
  randen mee, dus smaller aan de zijkant kopen door onderaan ruimer te gaan
  werkt niet. Vandaar `--corner` (32 px): **elk blijvend geplaatst
  rechthoekig vlak houdt `--corner` van beide schermranden.** Wat
  voorbijscrolt hoeft dat niet — dat komt met één veeg weer vrij.

Cirkels zijn vrijgesteld: die wijken in de hoek vanzelf terug. Het meest
blootgestelde vlak van de app is daarom `.btn-skip`, het vierkant linksonder.

Hoever 32 px reikt is gemeten en niet geschat: met de slagschaduw van 5 px
erbij ligt zo'n hoek feitelijk op (27, 27), en die blijft binnen een straal
tot 93 px. Uit de opname van het toestel volgt dat er minstens 48 px ronding
op staat (een hoek op (16, 12) werd afgesneden, en dat kan pas vanaf 48);
telefoons zitten rond de 50 à 60. Er zit dus ruim een factor twee tussen.

Controleren doe je door de boog te tékenen: leg een overlay met vier
`radial-gradient`-hoeken in een schreeuwkleur over elk scherm en kijk of ze
iets raken. Meten met alleen `getBoundingClientRect()` liegt twee keer — een
percentage-`border-radius` komt als `"50%"` terug (dus `parseFloat` haalt 50,
niet de halve breedte, en een cirkel telt ten onrechte als rechthoek), en een
vlak dat door een scrollend voorouder-vak wordt weggeknipt staat er nog
gewoon in met volle maten.

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

Bij een goede tik vliegt dat label ook echt van de kaart naar de teller. Er
was niets dat díe kaart met díe teller verbond: twee gebeurtenissen op twee
plekken, alleen gelijktijdig — de kaart verdween en ergens ver linksboven
sprong een getal, en het kind moest zelf bedenken dat het ene het andere
veroorzaakte. Het vliegende punt draagt daarom exact de huid van zijn
bestemming (`.gain`, plus `.turn-gain` voor de maat), zodat het als "dit
wórdt dat" leest en niet als een los effectje. Krimpt onderweg van 1,9 naar
1: van ver en groot naar dichtbij en klein.

Drie dingen die daarbij vastzitten:

- **De wip hoort bij het aankomen**, niet bij het aantikken. Vandaar dat
  `popTurnScore()` los staat van `paintTurnScore()`.
- **Web Animations, geen CSS-animatie**, om dezelfde reden als
  `holdButton()`: bij `prefers-reduced-motion` ligt er een
  `animation: none !important` over alles heen, en dan zou de landing — en
  dus de wip — nooit afgaan. Beperkte beweging wordt daarom expliciet
  gelezen en de vlucht overgeslagen; het punt komt dan meteen aan.
- **Een vlucht die nog loopt als het scherm wisselt, landt alsnog**
  (`landFly()` in `show()`). Het punt hangt aan de `body` en niet aan het
  spelscherm — dat moet, want `.screen` krijgt bij binnenkomst een transform
  en een `position: fixed` nakomeling rekent dan tegen dát vlak in plaats van
  tegen het venster — dus zonder dat bleef het over het overdrachtscherm heen
  vliegen.

De kaart zet de eerste centimeter van diezelfde reis. Bij "goed" tilt een
kopie van de geraden kaart (`.cardgone`, zie `cardOff()`) van de stapel af
richting de teller, en komt de volgende eronder vandaan. Daarmee gaan **beide
knoppen over de kaart die wég is** — de enige vraag die de speler op dat moment
heeft. Passen deed dat al (`tuck`, de kaart zakt onder de stapel waar ze ook
echt heen gaat); "goed" ging over de kaart die eráán kwam, schuin van
linksboven op de stapel gedeeld. Dat kwam uit de hoek waar de teller staat, dus
het vliegende punt en de nieuwe kaart kruisten elkaar in hetzelfde gangetje,
tegen elkaar in. De nieuwe kaart komt nu omhoog uit de stapel, precies waar
`.u1` ligt: de tegenrichting van `tuck`.

Vier dingen die bij die kopie vastzitten:

- **Een kopie en niet de kaart zelf.** `#card` is één element dat alleen zijn
  inhoud wisselt, dus wie hém laat vertrekken laat de vólgende kaart
  vertrekken. `cardOff()` wordt daarom bovenin `nextCard()` aangeroepen, vóór
  de wissel.
- **Geen klokbaan op de kopie.** De klok hoort bij de beurt en niet bij de
  kaart — ze loopt gewoon door — en twee ringen van verschillende maat over
  elkaar zijn twee klokken. Doordat de kopie krimpt in plaats van groeit blijft
  de ring van de kaart eronder heel. Wat er wél twee keer ligt is een
  kaartsilhouet, en dat is hier geen derde rand maar twee kaarten: dezelfde
  figuur als de scheve `.under`-lagen, alleen boven de bovenste.
- **Krimpen, niet wegvliegen.** Dit is het grootste vlak van het scherm, tot
  vijftien keer per beurt. Zou het de hele reis naar de teller maken, dan dekt
  het bij een goede reeks vrijwel onafgebroken de nieuwe kaart af — juist het
  enige waar de omschrijver op dat moment íets mee moet. Het gebaar staat in
  procenten en niet in pixels, zodat het op een telefoon van 280 px even groot
  is als op een tablet van 744.
- **Het wegvallen komt pas op het eind.** Vertrekken is de mededeling,
  verdwijnen het opruimen erna. Let op de valkuil die dat de eerste keer brak:
  een `easing` op de animatie zelf loopt over de héle tijdlijn, en
  keyframe-`offset`s zijn voortgang en geen tijd. Met een ease-out eroverheen
  zit je op `.45` voortgang al na een vijfde van de duur, en dan begint het
  wegvallen na 32 ms in plaats van na 100 — de kaart loste dan halverwege op in
  plaats van weg te gaan. Vandaar `easing: "linear"` op de animatie, met de
  vaart in de eerste keyframe.

Hetzelfde stijgt hoorbaar mee: `Snd.goed(i)` gaat een halve toon omhoog per
geraden kaart van deze beurt, tot zeven. Een reeks klinkt dan als klimmen,
ook voor het kind dat staat uit te beelden en niet naar het scherm kijkt. Na
zeven stopt het: een kwint hoger is nog vrolijk, een octaaf hoger is schel,
en een goede ploeg haalt er twaalf.

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

`DECKS` bovenaan `index.html`, één regel per kaart. Drie tiers, en ze spelen
niet los van elkaar: `poolFor()` geeft een tier zijn eigen kaarten **plus die
van de tier eronder**. Klein speelt met 90 kaarten, midden met 183, groot met
185.

Waarom schuivend en niet gestapeld: de moeilijkheid van een avond komt maar
half uit de kaart. De andere helft komt uit de ronde, en die is voor iedereen
gelijk -- omschrijven, één woord, zwijgend uitbeelden. Een makkelijke kaart is
in ronde 3 nog steeds werk; een moeilijke kaart is voor de jongste aan tafel in
élke ronde muurvast. De tier zegt daarom "tot en met zo moeilijk" in plaats van
"alleen deze band", zodat een tafel met verschillende leeftijden één stand kan
kiezen die voor allebei speelbaar is. Niet álles eronder meenemen, want dan is
bij groot twee derde van de stapel uit de lagere banden en speelt een tafel van
negenjarigen vooral peuterkaarten.

Drie regels bij het toevoegen:

- **één betekenis los van context** (geen ⭐, niets cultureel gebonden). Geen
  test ziet dit; dit is mensenwerk;
- **geen dubbele emoji of woorden in de póól**, niet alleen binnen de tier.
  Aangrenzende tiers delen een stapel, dus een kaart die in twee tiers staat
  komt twee keer in één potje. Zo bleven `hamer` (klein + midden) en `slapen`
  (midden + groot) lang onzichtbaar: per tier klopte het. `test/deck.test.js`
  toetst nu de samengestelde pool;
- **geen ZWJ-reeksen en geen huidskleur-modifiers.** Die vallen op een oud
  toestel uiteen in losse tekens. Er zitten er nu nul in; de 26 kaarten met
  een variatieselector (☂️ ✈️ ❤️) zijn de veilige soort.

Over de Unicode-versie: hier stond dat alleen emoji tot en met 9.0 (2016)
mochten, en dat de test dat bewaakte. Dat tweede klopte niet -- de controle
meet of een glyph tekent op de máchine die de test draait, en die heeft een
verse letterfamilie. Een splinternieuwe emoji komt daar dus doorheen en staat
op een oude tablet alsnog als ▯. De grens is dus een keuze, geen hek. Er staan
nu bewust nieuwere kaarten in (🧸 🪁 🦥 🪑 🧩 🪐 …); kijk bij twijfel één keer
op het oudste toestel dat in huis meespeelt.

## Tests

`npm test` draait twee suites in een echte browser. Ze draaien ook op elke
pull request. De speltest duurt ruim een halve minuut omdat één beurt echt
moet uitlopen, en klikt bewust trager dan 280 ms omdat een dubbele tik op
"goed" met opzet als één telt.

Voor de controle die er écht toe doet — renderen en meten — staan
`stopClock`, `paintClock` en `sizeCard` onder `?debug` in `window.__tijd`.
Daarmee zet je de klok stil en schilder je hem op een gekozen stand, zodat je
tien tellen of vijf tellen kunt fotograferen: in een echt potje duren die
precies één seconde, en dan mis je ze. Twee valkuilen bij zo'n opname:

- **Screenshot de kaart via `clip` en niet via de locator.** Onder vijf
  tellen klopt `.cardslot` (`.hurry`) en dan wacht playwright zich suf op een
  element dat "stabiel" moet zijn.
- **Wacht na het zetten van de stand.** De kleur van de band en het opdoemen
  van een laag lopen via een overgang van 0,3 s; lees je `getComputedStyle`
  meteen, dan krijg je de beginwaarde terug en lijkt er niets te gebeuren.
