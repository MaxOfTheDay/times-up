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
(pictogram plus OMSCHRIJVEN) en de kaarten in de bak op de instellingen.

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

Het label groen maken haalde er één weg en liet er vier staan, en dát is de
les die overblijft: **één instantie repareren brengt de telling niet omlaag.**
Er staan er nu drie — de ronde-schijf, het merkteken van de ronde waar je in
zit, en de startknop — doordat de kroon en de overgedragen tijd om hun eigen
redenen van dit scherm verdwenen zijn. Tel bij een nieuw element dus niet of
díe kleur al iets betekent, maar hoe vaak ze op datzelfde scherm al staat.

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

Die regel stond hier wel opgeschreven maar was nooit doorgetrokken, en dat
is precies de fout die de stand in twee kopieën ook al eens maakte: alleen
de kaartband kreeg zijn `<path>`. `#pauseRect` bleef een `<rect>` en hield
dus zijn anker in de hoek linksboven, terwijl de kaartband en de aftelschijf
(die zijn twaalf uur van `rotate(-90deg)` op `.cd-disc .ring` krijgt) op
twaalf uur stonden. Alle drie staan nu op twaalf uur. Bij een vaste `viewBox`
kan dat gewoon in de opmaak — `M40 5 H75 V75 H5 V5 Z` voor de 70×70 van het
paneel — en de omtrek die de JS al hardcodeert blijft kloppen, want een
gesloten pad om dezelfde rechthoek is even lang. Controleer dat door te
tékenen en niet door te rekenen: zet ze alle drie op 60% en kijk waar het gat
valt.

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
  en de kaarttegels in de bak liggen allemaal op 5 px en zijn allemaal
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

1. **stand** -- hoe staan we, wie is er aan zet;
2. **opdracht** -- wat moet je doen, en hoe groot is wat eraan komt;
3. **start** -- één tik, de enige handeling; het aftellen komt erna.

De eerste twee zitten inmiddels op hetzelfde vlak. De stand stond ernaast, in
een eigen omrand kaartje op de ploegkleur, en dat gaf het scherm drie vlakken
waar twee genoeg zijn. `buildTally()` hangt haar met `prepend` in de
opdrachtkaart; daarmee staat alle tekst op hetzelfde papier -- op ploegkleur
haalt `--ink-2` maar 1,5:1 -- en houdt het scherm nog de kaart en de knop
over.

De twee wissels vragen het tegenovergestelde, en dát is wat het verschil
tussen de twee standen moet dragen. Bij een **beurtwissel** gaat het toestel
écht van hand: `turnEnd()` draait `G.team` om, en "wie krijgt hem" is dan het
enige waar het scherm voor bestaat. Bij een **rondewissel** blijft het toestel
in dezelfde handen -- `endRound()` raakt `G.team` niet aan, want de
resterende tijd gaat mee naar dezelfde ploeg -- en is de nieuwe regel het
nieuws.

Hier stond dat het enige verschil de dichtheid van vak 2 was: compact bij een
beurtwissel, uitgeklapt bij een rondewissel. Dat kanaal zegt over de handeling
niets. Een tafel die de overdracht eenmaal geleerd heeft, geeft het toestel
bij ronde 2 dus aan de verkeerde ploeg door -- het scherm ziet er immers uit
als "geef door".

Het verschil zat lang in de **dichtheid van vak 2**: compact bij een
beurtwissel, uitgeklapt bij een rondewissel. Die compacte variant bestond om
een goede reden -- de kaart overstemde het antwoord op "wie is er nu" met
39.372 px2 tegen 4.484 -- maar het was een symptoom repareren. Twee dingen
vochten om dezelfde blik omdat het twee vlakken wáren. Zet de stand ín de
kaart en die strijd is voorbij: wie aan zet is, is de grote mascotte in de
kop van de kaart zelf.

Daarmee heeft de kaart nog maar één maat, in allebei de standen, en zijn de
twee wissels meetkundig gelijk: gemeten op 390 bij 844 een kaart van 343 bij
372 en een knop op y 557, wat het ook is. Wat de twee onderscheidt is
**beweging en één merkteken**, niet de opmaak:

- **beurtwissel** -- de mascotte in de stand komt op en ademt daarna; het
  opdrachtblok staat stil;
- **rondewissel** -- de tekening en het woord komen op; de stand staat stil,
  en het vakje van de ronde die net afliep loopt vol met inkt.

Precies één gebied van de kaart leeft, en wélk gebied dat is, ís de
mededeling. `.mode-round` schakelt ertussen, en elke regel die eraan hangt
staat als `#s-handoff:not(.mode-round)` genoteerd.

Dat je een marker voor "nieuwe ronde" verder niet nodig hebt, komt doordat
het onderscheid al in het luidste element zit: `turnEnd()` draait `G.team` om
en `endRound()` niet, dus bij een beurtwissel is de grote mascotte de ándere
ploeg en bij een rondewissel dezélfde -- met een woord en een tekening die
dan volledig veranderd zijn.

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

De ronde komt in drie maten in beeld -- alleen het teken, teken plus woord,
en de tekening met de regel. Ze werden op drie plekken los bijgewerkt en
lazen alle drie dezelfde rijtjes zelf uit; één plek die je vergeet en de
ronde staat op twee opeenvolgende schermen anders. `paintRound(ico, size,
host)` doet ze nu alle drie, met `size` op `"teken"`, `"chip"` of `"kaart"`.
`ROUND_HOW` staat alleen in de `"kaart"`-tak, en dus één keer per ronde.

`"chip"` zet het woord alleen als de host er een `<b>` voor heeft -- en de
balk tijdens het spelen heeft er sindsdien geen meer. Hier stond dat die
balk juist "teken plus woord" was, met als reden dat beeld én woord samen
lezen zeker maakt wie wél leest. Dat argument stond niet ter discussie, maar
de afweging wel: tijdens het spelen is de kaart het enige waar de speler
iets mee moet, en het pictogram houdt de drie rondes al uit elkaar op vorm
(drie stippen, één dikke stip, een doorgestreepte ballon) -- geen tekst
nodig om ze te onderscheiden. Het woord is daarom van de balk gehaald; wie
leest krijgt de naam nog via de aria-label van de tegel, alleen niet meer
zichtbaar. De compacte kaart op de overdracht hield haar `<b>` wel -- dat
scherm is juist naslag, en daar mag een bijschrift blijven staan.

Dat trok twee dingen recht die alleen bestonden om die balk-tekst netjes te
houden: het kritieke cijfer kromp op smalle telefoons van 34 naar 26 px om
niet over het woord heen te vallen, en het woord zelf kromp op zijn beurt
naar 10 px om nog te passen -- op 320 px zelfs dan nog krap. Zonder woord is
de ronde-tegel een vast vlak van 48 px zonder tekst, met een marge tot het
cijfervak die niet meer van lettertype tot lettertype kan verschuiven. Het
cijfer staat weer op zijn volle maat.

Alle tekst staat op papier, nooit rechtstreeks op de ploegkleur: `--ink-2`
haalt op ploegblauw maar 1,5:1 en op ploegrood 2,0:1, en de uitleg bij de
regel is juist de enige tekst in het spel die een speler moet kunnen lezen.

De stand (`#hoTally`) toont geen fiche per punt. Zo'n stapel duwde tegen
ronde 3 de startknop van het scherm af -- onzichtbaar in de test tot je 'm met
een screenshot ziet staan. Er staat nu per ploeg een mascotte en een getal, en
verder niets.

**De kroon en het "+N" zijn er allebei af gegaan**, en de reden is bij allebei
dezelfde: ze zeiden iets over de ploeg die het toestel juist kwijtraakt, op
het scherm dat aan de ploeg erná gericht is, en van geen van beide hangt een
handeling af.

De kroon zei wie voorstaat. Dat is twaalf keer per potje een mededeling waar
niemand iets mee doet -- en voor het kind dat achterstaat twaalf keer dezelfde
mededeling. Het argument dat haar hier ooit neerzette ("twee getallen
vergelijken kan een vierjarige nog niet") klopt, maar het is een argument over
het winnaarsscherm: dáár doet de vraag ertoe. Ze bestaat daar nog, gebouwd door
`tallyNode()`, en is door de schaarste een prijs geworden in plaats van
doorlopend commentaar.

Het "+N" zei wat de vorige beurt opleverde. Dat is tijdens het spelen al
verteld, en luider: het label in de balk telt per kaart op, het vliegende punt
landt erop, en `Snd.goed()` gaat er een halve toon bij omhoog. Wie scoorde
heeft het gezien én gehoord. Het hier nog eens stil herhalen is de zwakste van
de twee vertoningen -- en het was ook het element dat de rij scheeftrok: het
schoof het cijfer van de ene ploeg opzij en dat van de andere niet, zodat twee
getallen die je moet vergelijken nooit op dezelfde plek in hun eigen blok
stonden. Er is geen schikking die een derde element gratis in dat blok houdt:
ernaast geeft een gat, eronder duwt het cijfer van de hartlijn van de
mascotte. Voor wie luistert verandert er niets -- `paintHoTally()` zet allebei
de feiten nog in de aria-label.

De knop rechtsboven draagt hier een huisje en geen pauzeteken: er loopt geen
klok, dus er valt niets te pauzeren. De enige reden om er te tikken is
weggaan -- en dat is wat het huisje op het winnaarsscherm ook betekent.

De merktekens van de hoeveelste ronde (`.rounddots`) staan onder de tekening,
in allebei de standen. Hier stond dat ze alleen in de uitgeklapte kaart
hoorden, want tussen twee beurten verandert er niets aan het antwoord. Dat
klopt, maar verbergen is signaleren met een afwezigheid, en het maakte de twee
standen verschillend op een manier die niets betekent. Ze zijn het
paginanummer van de ronde, en een paginanummer dat verdwijnt omdat de bladzijde
niet omsloeg is vreemder dan een dat blijft staan.

Verbruikt is inkt, nu is goud, nog te komen is leeg. Dat volgelopen vakje is
het enige teken op dit scherm dat zegt dat er een ronde afgesloten is, en het
kost geen enkel nieuw element.

Aan de voet van de kaart staan twee tellers: hoeveel kaarten er nog liggen en
hoe lang je krijgt. Allebei altijd in beeld, ook als er niets bijzonders aan
is -- zo betekent het teken elke keer hetzelfde, en hoeft niemand het te leren
op het ene moment dat het afwijkt. Ze staan aan de vóét omdat ze over de beurt
gaan die de knop eronder start; in de kop lazen ze als bijschrift bij de ronde
erboven. Ze delen één tekenstijl (`#i-kaarten` en `#i-zand`, contour in
`currentColor`): `#i-glass` kon dat niet doen, want dat is de merkplaat --
gouden zandloper op crème contour, getekend om op een inkt-vlak te staan -- en
naast een inkt-teken op papier las hij als een gouden splinter.

Het scherm blijft hier aan. De wake lock liep alleen tijdens een beurt --
`show()` liet hem los op elk scherm dat geen `play` was -- en daarmee was
de overdracht het enige moment waarop het toestel écht van hand gaat én het
scherm ondertussen gewoon mocht uitvallen. Bij terugkomst staat er dan een
pincode tussen de tafel en de volgende beurt.

Wel begrensd (`WAKE_MAX`, drie minuten), want dit scherm heeft geen einde
uit zichzelf: er loopt geen klok die hem afsluit. Een beurt duurt 30 à 60
seconden en een overdracht seconden, dus drie minuten dekt een tafel die
begint te praten en laat ruim los voordat het de accu iets kost. Blijft een
vergeten potje toch liggen, dan vergrendelt het toestel zoals elk ander
scherm, en `loadGame()` zet het binnen twee uur terug. De timer wordt in
`releaseWake()` gewist, dus elke bestaande uitgang ruimt hem al op.

Let op de `visibilitychange`-handler: die keerde terug tenzij `current` op
`"play"` stond. De browser laat de lock los zodra het document verborgen
raakt, dus zonder een eigen tak voor de overdracht komt hij daar nooit meer
terug -- en valt het scherm alsnog uit op precies het verkeerde moment.

## Het aftellen draagt allebei de feiten

Die drie tellen zijn het moment waarop het toestel fysiek van hand gaat, en
wie hem aanneemt kijkt dan voor het eerst. Er stond alleen het rondetegeltje
op -- van wie de beurt was, stond er enkel in de achtergrondkleur, en dat is
het ene kanaal dat in deze app nooit alleen mag staan.

Er staat nu ook een mascotte (`.cd-team`). Waarom er papier onder moet: de
mascotte draagt de ploegkleur en dit vlak ook, dus zonder achtergrond wordt ze
een uitgesneden silhouet. Dat is precies het bezwaar waarop het optillen van
de hele bovenbalk ooit sneuvelde -- maar dat bezwaar gold de bálk (met haar
pauzeknop en haar woord op ploegkleur), niet een mascotte op papier.

Allebei de tegels worden op de gemeten plek van hun tegenhanger op de balk
gelegd, niet in CSS nagerekend: nagerekend klopt het staand op een telefoon
en staat het liggend 45 px mis. Bij het rondetegeltje ligt het papier eronder,
bij de mascotte eromheen -- de mascotte krijgt precies de gemeten maat en
plek, zodat ze bij het oplossen blijft staan waar ze staat en het spelscherm
eronder haar daar al heeft. Nagemeten op 390 bij 844: 48 bij 48 op (32, 32),
aan allebei de kanten van de wissel.

En de gouden schijf begint op de plek van de knop die je net indrukte. Die
twee waren al hetzelfde ding -- 177 tegen 179 px, allebei goud, allebei op
cx 195 -- alleen lagen ze 225 px uit elkaar. Ze stijgt daarna in 340 ms naar
haar eigen midden: de verbinding wordt in de eerste beeldjes gelegd, en
daarna hoort het cijfer in het midden, want daar kijkt iemand die het toestel
net aangereikt krijgt. Bij beperkte beweging blijft ze op de knop staan, en
dat is nog steeds de goede plek.

**Let op de coördinatenval, want die kostte twee pogingen.** `.cd-round` en
`.cd-team` trekken twee punten binnen hétzelfde vervormde vlak van elkaar af
(de tegel op de balk min de oorsprong van het aftelvlak), en dat verschil is
transform-invariant -- ze overleven dus de binnenkomst-animatie van het
spelscherm, ook al wordt er middenin gemeten. De rechthoek van de startknop
komt van het vórige scherm en heeft die bescherming niet. Verschuiven op een
mid-animatie meting klopte zolang de animatie liep en zat er zes pixels naast
zodra ze stilviel; een tweede correctieslag corrigeerde alleen naar hetzelfde
bewegende doel. Wat wél opgaat: het aftelvlak ligt met `inset: 0` op de
opvulbox van `.screen`, en die begint op (0, 0) van het venster -- lokale
coördinaten zijn hier vensters-coördinaten, dus de gemeten rechthoek kan er
rechtstreeks in. Meten moet in de klik-handler; een tel later is het
overdrachtscherm weg en heeft de knop geen rechthoek meer.

## De worp verklapt zichzelf niet

`handoff()` zette de ploegkleur op het scherm vóór `tossTeams()` liep. Dat was
onschuldig zolang de worp een klein opgetild tegeltje in een aparte balk
omschakelde: een achtergrond die het antwoord al wist, viel daar niet naast
op. Sinds de stand in de kaart staat wisselt de worp de gróte mascotte, en
toen stond er een seconde lang "vos" op de kaart terwijl het hele scherm
"uil" zei -- het luidste kanaal in tegenspraak met het op een na luidste, op
het ene scherm dat aankondigt wie begint.

De grond blijft nu neutraal (`--paper-2`) zolang er geloot wordt, en de kleur
stroomt binnen op het moment dat de worp landt. De kleur ís het antwoord, dus
ze hoort met het antwoord te komen. `landToss()` zet haar goed bij een
afgebroken worp en bij beperkte beweging, waar `tossTeams()` meteen
terugkeert; `tossTeams()` zet daarna opzettelijk weer neutraal en zet de
echte kleur pas in de laatste stap.

Wat hier níet moet: de achtergrond mee laten flikkeren met de worp. Dat is
veel spannender en het is de eerlijkste vertaling van "de kleur wordt
geloot", maar het zijn zeven volledige schermwisselingen in een seconde,
waarvan de eerste paar 50 ms uit elkaar -- dat zet je niet voor kinderen neer.

## De eindstand telt niet, ze noemt

Het winnaarsscherm hield de fiches nog even -- het was "verder leeg", dus
daar was ruimte. Dat klopte niet meer: bij 42 tegen 20 stond er een raster
van negen rijen bolletjes dat een derde van het scherm vulde, en hetzelfde
getal stond er vier keer (de stapel, de drie rondes, het totaal, en de kroon
zei allang wie won). Nergens in de app ligt dus nog één bolletje per punt.

Er is niets voor in de plaats gekomen. Geen kolom, geen balk, geen tweede
grafiek: **wie won staat in de kroon en in de mascotte die groeit, en dat
zijn de twee kanalen die een niet-lezer nodig heeft.** Hoevéél is naslag, en
naslag is een getal. Vandaar de volgorde per ploeg: mascotte, dan het totaal
groot, dan de drie rondes klein eronder met hun pictogram. Eerst de uitslag,
dan waar ze vandaan komt.

De twee totalen staan even groot. Het is verleidelijk om de winnaar ook
daar te laten groeien, maar dan zeggen kroon, mascotte én cijfergrootte
alle drie hetzelfde, terwijl twee cijfers van verschillend formaat juist
lastiger naast elkaar te leggen zijn.

Let op de klassenaam als je hier ooit tóch iets bijtekent: `.bar` bestond
al -- dat is de streep door de pas-knop als de stapel op is. Een tweede
`.bar` erbij zette meteen `display: flex` en een rand op dat SVG-pad. Grep
even voor je een korte naam pakt.

## Eén label voor "wat er bij komt", en nog maar één plek

Wat je tijdens een beurt verzamelt is een groen `+N` met een inkt-contour
(`.gain`), rechts van de mascotte in de balk. Het waren ooit twee dingen --
een rij ploegkleurige fiches onder de mascotte tijdens het spelen, een groen
label op het overdrachtscherm -- en die zijn toen tot één vorm gebracht: zelfde
kleur, zelfde vorm, zelfde plek, zelfde leesrichting.

Van die twee plekken is er nu één over. Het label op de overdracht is weg
(zie hierboven bij de stand): daar was het een stille herhaling van iets dat
tijdens de beurt al luider verteld is, op het scherm van de ploeg erná. Wat
hieronder staat gaat dus over de balk tijdens het spelen -- de plek waar het
label wél hoort, bij de ploeg die scoort, op het moment dat ze scoort.

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

- **Het getal én de wip horen bij het aankomen**, niet bij het aantikken:
  het punt komt het getal brengen. Hier stond alleen de wip, en dat was de
  halve maatregel — `popTurnScore()` verhuisde naar de landing, maar
  `paintTurnScore()` bleef bij de tik staan omdat de meting hem daar nodig
  had. Gevolg: de teller sprong 230 ms voordat het punt aankwam, en op de
  eerste kaart van een beurt stonden er twee `+1`'en tegelijk in beeld — de
  vliegende en de aangekomene, terwijl de vlucht juist moet zeggen dat het
  er één is. Beide gebeuren nu in `landFly()`. Wat de meting nodig had is
  niet vervallen maar apart gezet: `meetTurnScore()` schildert vooruit,
  meet, en zet meteen terug. De volgorde bij aankomst is schilderen dan
  wippen, want `popTurnScore()` slaat een verborgen label over.
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

Hetzelfde stijgt hoorbaar mee: `Snd.goed(i)` gaat een halve toon omhoog per
geraden kaart van deze beurt, tot zeven. Een reeks klinkt dan als klimmen,
ook voor het kind dat staat uit te beelden en niet naar het scherm kijkt. Na
zeven stopt het: een kwint hoger is nog vrolijk, een octaaf hoger is schel,
en een goede ploeg haalt er twaalf.

## Eén stand, twee schermen

`#hoTally` en de stand in het pauzepaneel zijn hetzelfde onderdeel: per ploeg
een mascotte en een getal, en wie aan zet is is de grote mascotte. Ze waren
losse kopieën, en die groeiden uit elkaar: de kopie in het paneel miste de
`.head`-omhulling en viel daardoor buiten `.mini-score .head > svg`, zodat
beide mascottes op 0 bij 0 pixels stonden en er twee kale getallen overbleven
zonder eigenaar -- precies het soort tekst-zonder-beeld dat de harde eis
verbiedt.

Hier stond "wie de ene aanpast, past de andere mee aan, of voegt ze samen".
Ze zijn nu samengevoegd: `buildTally()` bouwt de twee zijden en wordt bij het
laden twee keer aangeroepen, voor `#hoTally` en voor `#pauseTally`. In de
opmaak staan allebei de vakken leeg. De ids blijven dezelfde (`hoSideA`,
`pauseScoreB`, ...) zodat `paintHoTally()` en `paintPauseScore()` ze gewoon
blijven vinden.

**En die garantie dekt de opmaak, niet de stijlen.** Dat is precies waar het
een tweede keer misging: de hele herziening van de stand stond onder
`#hoRoundCard`, en het paneel volgde daardoor niet. Nagemeten waren de twee
standen toen weer twee verschillende dingen -- op de overdracht een mascotte
met een getal, in het paneel een opgetilde papieren tegel mét kroon, in een
paneel dat zelf al een omrand vlak is. Een kader in een kader.

De maten staan daarom in één selectorlijst met allebei de plekken erin
(`#s-handoff .mini-score ..., #pauze .mini-score ...`). De ids staan er om in
specificiteit te winnen van de bestaande `#s-handoff`-regels, niet omdat de
twee schermen iets verschillends krijgen. Wie hier een waarde wijzigt,
wijzigt hem op allebei -- en wie hier iets toevoegt onder alleen `#s-handoff`,
laat het paneel weer achter.

Het enige echte verschil is beweging: op de overdracht ademt de mascotte van
wie aan zet is, in het paneel niet. Daar staat een beurt stil, en iets dat
ademt spreekt dat tegen.

## App-pictogram en installeerbaarheid

Het manifest staat niet als los bestand naast `index.html` -- dat zou de
regel "alles staat in `index.html`" breken -- maar wordt bij het laden in
het geheugen opgebouwd en als blob-URL aan `<link rel="manifest">` gehangen.
Een blob-URL heeft geen pad om relatief tegenaan te resolven, dus
`start_url` en `scope` staan er expliciet in als de volledige map-URL
(`location.href` met de bestandsnaam eraf), niet als `"."` of `"/"`.

Dat het werkt is gemeten en niet aangenomen: met een blijvend profiel
(`launchPersistentContext`, want een schone context geeft altijd
`in-incognito`) plus `--bypass-app-banner-engagement-checks` geeft
`Page.getInstallabilityErrors` een lege lijst en vuurt
`beforeinstallprompt` zo'n 80 ms na het laden -- ruim vóór de service
worker, want een geldig manifest is tegenwoordig genoeg. Data-URI's als
pictogram worden gewoon geslikt. Kopieer die opstelling als je hier ooit
iets wijzigt; kop noch staart hiervan is in een gewone testbrowser te zien.

`id` staat er expliciet in, op dezelfde map-URL die de browser er anders
zelf van maakt. Zonder dat veld hangt de identiteit van de geïnstalleerde
app aan `start_url`, en dan is elke wijziging daarvan een ándere app: de
oude blijft naast de nieuwe op het beginscherm staan. Verzin er dus nooit
een naam voor -- dat doet precies wat het moest voorkomen, in één keer voor
iedereen die de app al heeft.

### Eén zin, drie plekken

Wat de app is, staat één keer voluit: in de `<meta name="description">`. Het
manifest (dat is wat de installatiedialoog toont) en de deelknop lezen hem
daaruit. Zelfde reden als bij het pictogram hieronder -- drie overgetypte
kopieën groeien uit elkaar, en dan zegt de installatiedialoog iets anders
dan het bericht waarmee je de app doorstuurt. De README heeft zijn eigen
kopie, want die staat buiten het bestand; die moet je met de hand meenemen.

De zin luidt "Time's Up voor kinderen -- ook voor wie nog niet kan lezen."
Er stond "voor kinderen die nog niet kunnen lezen", en dat sloot precies de
tafel uit waar deze app voor gemaakt is. Een stand is een plafond (zie
`poolFor`): een potje met een vijfjarige én een achtjarige is het normale
geval en niet de uitzondering. Niet kunnen lezen is hier geen toelatingseis
maar iets wat je niet in de weg zit -- en dat is ook precies wat de harde
eis zegt.

De deelknop zet er een zandloper (⏳) voor, en alleen de deelknop: dat is
het enige van de drie dat als bericht in een chat terechtkomt, en daar doet
een teken werk dat het in een installatiedialoog niet doet. Het is bovendien
het merk zelf. Wie er ooit een ander teken bij zet, houdt zich aan dezelfde
regel als bij `DECKS`: geen ZWJ-reeksen en geen huidskleur-modifiers, want
die vallen op een oud toestel uiteen in losse tekens. U+23F3 is van 2010 en
dus veilig.

### De platen

De pictogrammen zijn dezelfde zeefdruk-plaat als `.wordmark`: inkt-vlak,
gouden zandloper, crème contour. Vier stuks, als vaste PNG's ingebakken --
geen build-stap. De 192 staat er één keer in: het manifest leest hem uit de
`<link rel="icon">` in plaats van dezelfde base64 een tweede keer neer te
zetten, zodat het tabblad en het beginscherm niet uit elkaar kunnen groeien.

Hier stond dat ze "met Pillow gegenereerd zijn uit dezelfde coördinaten als
`#i-glass`". Dat overtypen was precies de fout: de platen misten de ronde
uiteinden van de balken en de ronde hoeken van de strik, dus stond op het
beginscherm van het toestel een nét andere zandloper dan op het beginscherm
van de app. Niemand die dat ziet zonder ze naast elkaar te leggen.

Ze worden nu getekend uit de páden van `#i-glass` zelf: Chromium rendert het
symbool op een inkt-plaat, Pillow brengt dat terug tot precies drie kleuren
en schrijft een palet-PNG. Die tweede stap is geen afwerking maar de helft
van de winst -- zachte randen kosten 31 kB base64 extra op een bestand van
ruim 300, voor een overgang die op geen enkele weergavemaat te zien is (een
pictogram wordt overal verkleind; alleen op iOS staat het 1:1, en daar is
een trede een derde CSS-pixel). Een zeefdruk heeft trouwens ook geen
kleurverloop aan de rand van een vlak. Met palet erbij is de hele set
kleiner dan de oude vier.

Wijzigt `#i-glass`, draai dan `npm run pictogrammen`. Dat script leest de
paden uit `index.html`, tekent de vier platen en schrijft de base64 terug
op hun plek -- er valt dus niets over te typen en niets te vergeten. Twee
keer draaien geeft hetzelfde bestand.

Drie maten die vastliggen:

- **Volvlaks staat het teken op 80% van de tegel**, 10% marge boven en
  onder. Het stond op 90% en drukte daarmee tegen zijn eigen randen, waar
  elk pictogram ernaast op het beginscherm meer lucht houdt.
- **Maskable staat op 64%, en dat is meetkunde en geen slordigheid.** Het
  toestel legt daar zijn eigen masker overheen, dus alles moet binnen een
  cirkel van 80% blijven; met een zandloper van 66 bij 90 eenheden komt de
  halve diagonaal bij 64% op 39,7% en is de limiet 40. Kleiner hoeft niet,
  groter kan niet. Het stond op 61,3% tegen 90% volvlaks -- een gezin met
  een iPad en een Pixel keek naar twee verschillend zware versies van
  hetzelfde merk. Nu is dat 64 tegen 80.
- **Vierkante hoeken.** De ronding is van het toestel, niet van ons. Er zat
  er een van 15,5% in de plaat gebakken, met doorzichtige hoeken eromheen:
  de enige niet-ronde ronding in de hele app -- elke andere `border-radius`
  in `index.html` is `50%`, een echte cirkel -- en elk platform rondde daar
  vervolgens nog eens overheen.

Controleer een wijziging door te tellen en niet door te kijken: leg het
pictogram onder een ronde uitsnede en tel de tekenpixels die erbuiten
vallen. Op het oog is dat niet te doen -- een uitvergrote weergave gaf hier
de indruk dat de iOS-plaat werd afgesneden, en per pixel geteld was het
nul van 8936.

### De screenshots

Chrome op Android toont de grote installatiedialoog alleen als er
`screenshots` met `form_factor: "narrow"` in het manifest staan; zonder
blijft het de kleine balk onderaan. Dat is dezelfde afweging als bij de
iOS-weg hieronder: een aanwijzing te weinig kost de installatie.

Ze worden gerénderd en niet nagemaakt -- de echte app, in een echte
browser -- door `tools/schermen.js` (`npm run schermen`). De
palet-schrijver die in `pictogrammen.js` zat is daarvoor `tools/png.js`
geworden: hij kon vier kleuren, twee bits, vierkant, en dat is precies
genoeg voor een zeefdruk-plaat en te weinig voor een heel scherm. De
bitdiepte volgt nu uit het aantal kleuren, die uit `:root` gelezen worden
zodat ze niet kunnen afdrijven (15 stuks, dus vier bits).

Beide scripts zochten anders in hetzelfde bestand naar hetzelfde soort
blok. `pictogrammen.js` pakte élk base64-blok van 500+ tekens en eiste er
precies vier als vangrail -- en die vangrail breekt zodra er iets anders
met een `data:`-URI bijkomt. Elk script vindt zijn eigen blokken nu op
context: de platen aan hun `<link>` of hun `purpose`, de screenshots aan
hun `label`.

**Het spelscherm staat er niet bij, en dat is gemeten en niet gekozen.** Op
een kaart staat een emoji, en een emoji is vol kleur mét verlopen --
precies wat een palet-PNG niet kan. Op de 15 kleuren van de app werd een
tros druiven modder met magenta randen. En zodra je het palet groot genoeg
maakt om hem wél te dragen, valt de winst van een palet-PNG helemaal weg:
11 kB bij 16 kleuren, 98 kB bij 64, 139 kB bij 256, en Chromiums eigen PNG
232 kB. Voor één plaat, op een bestand van ruim 300 kB. De twee die
overblijven -- titel en overdracht -- zijn puur app-palet en quantiseren
zonder verlies, samen 32 kB.

**En let op het determinisme.** `newGame()` schudt de stapel én lóót welke
ploeg opent, dus zonder ingrijpen gaf elke draaibeurt een ander plaatje en
stond er bij elke commit een diff waarin niets gewijzigd was. `Math.random`
gaat daarom op een vaste reeks, en de platen worden geschoten met
`animations: 'disabled'` -- want de zandloper valt om bij binnenkomst en de
mascotte ademt, en wachten helpt niet tegen iets dat nooit ophoudt. Die
stilgezette plaat wijkt 0,08% van de pixels af van wat een speler na vier
seconden ziet. Twee keer draaien geeft hetzelfde bestand, net als bij
`pictogrammen`.

### De service worker windt niet op het netwerk

`sw.js` is **cache eerst, ververs erachter**: de app start meteen uit de
kast en haalt op de achtergrond een verse kopie voor de vólgende keer.

Hier stond network-first, met "wie online is krijgt altijd de nieuwste
versie" als reden. Dat klopt in de twee gevallen die je zelf uitprobeert --
online, en vliegtuigstand -- maar niet in het geval ertussenin, en dat is
op een telefoon in een woonkamer juist het gewone geval: verbonden met
wifi, geen route. `fetch()` faalt dan niet, hij hángt, tot de time-out van
het toestel. Nagemeten met een server die het document 20 seconden
vasthoudt: 20.074 ms tot het titelscherm stond, tegen 59 ms erna.

Twee dingen die daarbij vastzitten:

- **`res.ok` vóór `cache.put`.** Dat stond er niet, en het is een fout die
  je pas offline ziet: een 404 of de foutpagina van een deploy die nog
  liep, ging gewoon de kast in. Nagemeten haalde de oude worker het
  titelscherm daarna helemáál niet meer.
- **Verversen met `cache: "no-cache"`**, niet met een kale `fetch()`. Dat
  dwingt een gesprek met de server af maar staat een 304 toe, dus er komt
  alleen een body over de lijn als er echt iets gewijzigd is. Het is ook
  nodig: GitHub Pages zet `Cache-Control: max-age=600` op HTML, dus een
  kale `fetch()` werd tien minuten lang uit de HTTP-cache van de browser
  beantwoord en verifieerde niets -- met een verse HTTP-cache stálde zelfs
  de oude worker niet.

De prijs: de woonkamer loopt hoogstens één opstartbeurt achter op `main`.
`periodicsync` koopt die terug waar het toestel meewerkt (alleen Chromium
op Android, alleen geïnstalleerd, en de browser bepaalt zelf of hij wekt --
een meevaller dus, nooit een garantie). Er komt met opzet **geen** melding
over een nieuwe versie: dat zou tekst zijn op een scherm dat zonder tekst
moet kunnen, voor iets wat de eerstvolgende koude start vanzelf oplost. Een
stille `location.reload()` op de titel valt ook af -- die speelt de
zandloper-animatie zichtbaar opnieuw af, voor geen enkele winst.

### Installeren en doorgeven, vijf standen

Het veld op de instellingen heeft vijf standen en er staat er altijd
hoogstens één:

- **knop** -- het toestel biedt zelf een installatie aan
  (`beforeinstallprompt`).
- **zetop** -- iOS: de weg via het deelmenu, met het deel-teken (`#i-deel`)
  in de zin.
- **menu** -- de dialoog is weggetikt en de knop is opgebruikt.
- **delen** -- de app draait geïnstalleerd; dan valt er niets te
  installeren en juist wel iets door te geven.
- **weg** -- het veld dicht.

Die stand heette eerst **deel**, naar het deelmenu waar de iOS-weg
doorheen loopt. Dat werd onhoudbaar zodra er echt gedeeld kon worden: de
ene "deel" zet de app op je eigen beginscherm, de andere stuurt hem naar
iemand anders.

**Delen is geen knop erbij maar een stand erbij**, en dat onderscheid is de
hele kwestie. Een losse deelknop zou naast de installatieknop komen te
staan; nu vervangt hij hem, dus de dichtheid van het scherm groeit niet.

Hier stond daarbij dat het veld "geen blijvend meubilair" wordt, omdat
installeren eenmalig is en zichzelf afsluit. Dat geldt maar voor één van de
vier zichtbare standen. `knop` sluit zichzelf inderdaad af, en `menu` blijft
de sessie staan. Maar `zetop` staat er op iOS-in-Safari voorgoed -- de code
kan van buiten de geïnstalleerde app niet zien of hij er al staat, en dat is
met opzet zo geraden -- en `delen` staat er in de geïnstalleerde app
voorgoed, want delen sluit zichzelf nooit af: volgende maand is er een
andere ouder. Twee van de vier zijn dus wél blijvend meubilair, en het zijn
net de twee die de gewone huishoudens dekken: de iPad in Safari, en het
gezin dat de app leuk genoeg vond om hem te installeren. Wie de plek van dit
veld weegt, weegt dus een blok dat er elke avond staat.

Waaróm hij er hoort, is scherper dan "handig": **in een geïnstalleerde app
is er geen adresbalk en geen deelmenu van de browser meer.** Wie de app
leuk genoeg vond om hem te installeren -- precies de ouder die hem zou
doorgeven -- heeft daarna geen enkele weg meer. In een tabblad bestaat die
weg wél, en dan hoort de app niets te doen. De regel is dus: **de app
levert alleen de weg die het platform heeft weggenomen.**

Let op `inAppModus()`: die werd precies één keer gelezen, bij het laden.
Onschuldig zolang het veld alleen "installeren" kon zeggen -- daarna ging
het toch dicht -- maar niet meer nu het ook "delen" zegt. Wie installeert
terwijl dit scherm openstaat, hield anders de rest van de sessie de
installatieknop. Er luistert nu een `matchMedia` op `display-mode`.

**De knop verdwijnt pas als er écht geïnstalleerd is.** Zo stond het hier
niet: het veld ging dicht vóór `prompt()`, "want een prompt is maar één
keer te gebruiken". Dat laatste klopt, het gevolg deugde niet. De pagina
sprong 97 px omhoog op het moment van de tik -- dus nog voordat de dialoog
er stond -- en wie die dialoog wegtikte was de knop kwijt voor de rest van
het bezoek, zonder dat er iets achterbleef dat vertelde waar hij heen was.
`beforeinstallprompt` vuurt na een afwijzing namelijk niet opnieuw, en deze
app navigeert nooit. Nu beslist de uitkomst wat er daarna staat, en een
afwijzing levert de weg via het menu op -- die werkt namelijk nog.

**iOS kreeg niets.** Het `apple-touch-icon` en de meta-tags stonden er en
doen hun werk, maar niets in de app wees de ouder ooit de weg naar "Zet op
beginscherm", en op een tablet in huis is dat de helft van de toestellen.
Herkenning gaat op de user-agent plus `maxTouchPoints`: iPadOS meldt zich
sinds 13 als "Macintosh", dus alleen aan de aanraakpunten te onderscheiden
van een echte Mac. Draait de app al in app-modus, dan blijft alles dicht --
`display-mode` dekt Android en desktop, `navigator.standalone` is de
iOS-variant, en je hebt ze allebei nodig. Wat iOS níet vertelt, is of de app
al op het beginscherm staat terwijl je in Safari kijkt -- `navigator.standalone`
is daar alleen waar bínnen de geïnstalleerde app. Wie hem op iOS al heeft,
ziet de aanwijzing dus staan. Dat is de goede kant om op te raden: een
aanwijzing te veel kost één regel op het scherm van de volwassene, een
aanwijzing te weinig kost de installatie. Zet er dus geen vlag in
`localStorage` voor -- die weet niet of de app er nog staat, en dan
verdwijnt de weg voorgoed voor wie hem van zijn beginscherm veegt.

De knop draagt de plaat zelf, en dat is geen versiering: dít vlak komt na
een tik op het beginscherm te staan. Het was de enige knop in het hele
bestand met alleen tekst erop, op het scherm waar elk ander vlak een
tekening draagt. De plaat krijgt géén eigen schaduw en géén contour -- ze
ligt ín een knop die haar lift al draagt, en reliëf op reliëf leest als een
knop op een knop.

### Het veld staat onderaan, als vierde groep

Het stond bovenaan, als eerste blok onder de titel, met een eigen marge van
48 om het van de regeluitleg los te maken -- "een eenmalige handeling is
geen instelling". De reden om het daar te zetten was dat vooraan het moment
is dat het er het meest toe doet: de eerste keer dat dit scherm opengaat.
Dat klopt voor die ene keer en voor niets daarna, en de vorige alinea zegt
waarom dat uitmaakt -- op de twee gewone huishoudens staat dit blok er élke
avond.

Wie het tandwiel aantikt komt de moeilijkheid of de tijd bijstellen, of een
kaart wegleggen. Installeren is nooit de boodschap en delen al helemaal
niet. Het is nu de vierde `.field-group`, met `DEZE APP` als kop, ná
Voorkeuren. Er verhuist verder niets: de drie groepen erboven staan precies
zoals ze stonden.

Gemeten op 390x844 met de regels dichtgeklapt -- de gewone avond -- stond de
eerste keuzeknop op 38% van het eerste scherm en staat hij nu op 22%. Met de
regels open (het allereerste bezoek) van 66% naar 49%. Liggend op 844x390
van 87% naar 56%. En het geval dat het ergst was: op een kleine telefoon van
320x568 stond bij dat eerste bezoek de eerste spelinstelling op 121% --
er stond dan geen enkele instelling in beeld zonder te scrollen. Nu 95%.

Belangrijker dan al die getallen is dat ze niet meer van de stand afhangen.
Het veld verschoof de eerste keuzeknop met 121 px zodra het er stond; nu
staat die knop in alle vijf de standen op dezelfde plek.

Drie dingen die eraan vastzitten:

- **De kop hoort ín de groep, niet ernaast.** Er zijn standen waarin hier
  niets staat, en `toonInstall()` verbergt daarom `#appGroup` en niet
  `#installField`. Anders blijft `DEZE APP` met haar streep als lege regel
  onder Voorkeuren hangen. (Dat `hidden` het wint van `display: flex` van
  `.field-group` komt door de `[hidden] { display: none !important }`
  bovenaan het bestand -- de regel die er staat omdat deze val hier al drie
  keer eerder toesloeg.)
- **De eigen marge van 48 moest weg.** Die verzon een groepsgrens die er
  toen niet was; nu levert `.field-group + .field-group` dezelfde 48 al, en
  allebei geeft 72.
- **Verplaats het óf verzwak het, nooit allebei.** De prijs van de plek
  onderaan is dat je ervoor moet scrollen -- op 390x844 zo'n 299 van de 332
  px die het scherm te scrollen heeft, dus één veeg. Juist daarom blijft de
  knop een knop en blijft de plaat staan: die plaat is met 32 bij 32 px het
  enige volvlakse inkt-vlak op het hele instellingenscherm, en dat is wat
  het blok aan het eind van de rol nog vindbaar maakt. Het was ook precies
  wat het bovenaan te zwaar maakte. Eén van de twee degradaties is genoeg.

Meegenomen, en gemeten: onderaan is de laatste aanraakbare rechthoek nu de
knop op (16, 58) in plaats van twee keuzeknoppen op (16, 32), en de
rechteronderhoek blijft helemaal leeg. Met de boog getekend op straal 60
raakt op dit scherm niets de bocht, in geen van de standen -- op de
plakkende titelband na, en die is met opzet een papieren band die tot de
schermrand doorbloedt.

### Wat er op de knoppen staat

`Installeren` en `Delen`, niet `App installeren` en `App delen`: de kop
erboven zegt al welke app. Dat scheelt niet alleen de herhaling -- het maakt
ook de zin in de `menu`-stand zichtbaar een citaat van de browser
("kies daar **App installeren**") in plaats van ons eigen woord.

De hint onder de knop is voor `knop` en `zetop` één en dezelfde zin
geworden. Er stonden er twee die hetzelfde zeiden in andere woorden, terwijl
alleen de wég erheen verschilt -- en die staat al in de knop of in de zin
erboven. De hint zegt wat je eraan hebt, en dat is op beide platforms
hetzelfde.

Bij `delen` stond "Stuur hem door aan iemand die hem ook wil", terwijl de
app twee regels hoger `ze` heet. Nu staat er geen voornaamwoord meer. En
"sturen", niet "doorgeven": doorgeven is in deze app het toestel over tafel
aanreiken.

En: `.handmatig` staat in dezelfde twee lijsten als `.hint` -- de regel die
tekst uit de kolom van het zwevende huisje houdt, en de plakkende band die
hem weer opheft. Op het moment van schrijven paste die zin er toevallig
sowieso naast; dat is geen reden om hem eruit te laten.

De standen zijn niet af te dwingen in een test -- `beforeinstallprompt`
vuurt alleen in een echte browser met een echt profiel, en iOS al helemaal
niet. `toonInstall` staat daarom onder `?debug` in `window.__tijd`, zodat je
ze allemaal kunt fotograferen zonder opstartvlaggen.

## Kaarten

`DECKS` bovenaan `index.html`, één regel per kaart. Drie tiers, en ze spelen
niet los van elkaar: `poolFor()` geeft een tier **alle kaarten tot en met zijn
eigen moeilijkheid**. Klein speelt met 90 kaarten, midden met 183, groot met
alle 275.

Een tier is dus een plafond en geen band -- precies wat deze notitie altijd al
beweerde ("de tier zegt tot en met zo moeilijk in plaats van alleen deze
band"). De code deed dat niet. Ze nam één band mee omlaag en liet de rest
vallen, en de reden daarvoor klopte: zonder venster trekt een tafel van
negenjarigen ook peuterkaarten. Die prijs wordt nu betaald -- van een greep
van 24 komen er bij groot zo'n acht uit de makkelijkste band, waar dat er nul
waren, en de stap van Medium naar Moeilijk is daarmee kleiner.

Wat zwaarder woog: het venster zei iets anders dan de knoppen. "Makkelijk /
Medium / Moeilijk" met "3+ / 6+ / 9+ jaar" beschrijft een plafond, en op het
scherm was het verschil alleen te zien aan een telling die van 183 naar 185
sprong: twee kaarten erbij, terwijl de halve bak omwisselde. Wie voor een
gemengde tafel een stap hoger deed, haalde ongemerkt precies de kaarten weg
die de jongste aankon. En die fout is duurder dan saai -- te veel makkelijke
kaarten verveelt, geen enkele makkelijke kaart zet een kind een derde van de
avond vast.

De rest van de oude redenering blijft staan en verklaart waarom dit werkt: de
moeilijkheid van een avond komt maar half uit de kaart. De andere helft komt
uit de ronde, en die is voor iedereen gelijk -- omschrijven, één woord,
zwijgend uitbeelden. Een makkelijke kaart is in ronde 3 nog steeds werk.

Wordt die stap naar Moeilijk te klein, stuur dan bij met kaarten en niet met
code: een grotere moeilijke band trekt het gemiddelde vanzelf omhoog. Trek
**nooit** scheef uit een volle bak -- dan staat er "275 in het spel" boven een
greep die dat niet is, en dat is precies het verschil tussen wat je ziet en
wat je krijgt dat de kaartenbak onmogelijk gemaakt heeft.

Drie regels bij het toevoegen:

- **één betekenis los van context** (geen ⭐, niets cultureel gebonden). Geen
  test ziet dit; dit is mensenwerk;
- **geen dubbele emoji of woorden over de tiers heen**, niet alleen binnen
  één tier. Een kaart die in twee tiers staat komt twee keer in hetzelfde
  potje. Zo bleven `hamer` (klein + midden) en `slapen` (midden + groot) lang
  onzichtbaar: per tier klopte het. Sinds een tier een plafond is, is de pool
  van groot de hele verzameling, dus de controle in `test/deck.test.js` dekt
  in één keer alle 275 kaarten. Diezelfde test bewaakt ook dat elke tier
  alles bevat wat eronder zit en met precies zijn eigen band groeit;
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

## De bak en de greep

Twee dingen, en ze zijn één keer voor elkaar aangezien. De **bak** is alles
waar ooit uit getrokken kan worden: 90, 183 of 275 kaarten, afhankelijk van
de stand. De **greep** is wat één potje daaruit meekrijgt: 16, 24 of 32.

Op het instellingenscherm stond de greep, als raster onder de kop "Jullie
kaarten". Dat werd gelezen als de bak -- en dan klopt er van alles niet:
"boom zit wel in het spel maar niet in de instellingen" (natuurlijk, het
waren 24 van de 90), en "wat ik daar zie is niet wat ik krijg" (ook waar:
elk nieuw potje trok stilletjes opnieuw, dus wie ná een potje ging kijken
zag een andere 24 dan hij net gespeeld had). Een tik op zo'n kaartje ruilde
hem om, maar alleen voor dat ene potje -- de volgende keer stond hij er
gewoon weer.

Nu staat de bak er, en de greep bestaat pas op het moment dat je op
Beginnen tikt (`drawDeck` in `newGame`, nergens anders). Er ís dus geen
getoonde greep meer die verouderen kan. **Trek nooit opnieuw vooruit** --
zodra er weer ergens een greep klaarligt vóór het potje, is die hele klasse
fouten terug.

Wat er te kiezen valt zit in de bak, en die keuze blijft staan:
`settings.hidden`, op het wóórd en niet op de emoji, want een tekening kan
ooit door een betere vervangen worden voor hetzelfde woord. Eén lijst voor
alle drie de standen -- dit hangt aan de kaart, niet aan de moeilijkheid.
Elke kaart zit in precies één band, en dus in hoogstens twee standen (een
makkelijke in Makkelijk en Medium, een moeilijke in Medium en Moeilijk).
Wie van Makkelijk naar Moeilijk springt ziet zijn weggelegde kaarten dus
uit de lijst verdwijnen. Daar zijn twee dingen op geprobeerd die allebei
niet deugden, en de les eronder is dezelfde.

Eerst een regel die het uitlegde ("2 weggelegde kaarten horen niet bij deze
stand") -- een zin die een afwezigheid verklaart, in beeld bij iedereen die
één kaart weglegt en daarna van stand wisselt. Daarna het getal op de knop,
dat de hele lijst telde: "Alles terugleggen (2)" boven een lijst zonder één
weggelegde kaart. Dat is erger dan ruis. Het is een knop waarvan je het
effect niet kunt zien, en een getal dat een vraag oproept die het scherm
niet kan beantwoorden ("welke twee dan?").

**Alles op dit paneel gaat over de stand die je voor je hebt** -- de
telling, de zin over trekken, de lijst, en dus ook de knop: hij verschijnt
alleen als er in dít lijstje iets weg ligt, en hij legt ook alleen dít
lijstje terug. Zou hij de hele lijst legen, dan haalde één tik op Makkelijk
ook stilletjes de kaarten terug die op Moeilijk weggelegd zijn.

Dat er in een andere stand nog iets ligt, hoeft nergens te staan: zet die
stand terug en het staat er weer. **Zet daar geen uitleg voor terug** --
niet als zin en niet als getal.

Vier keuzes in de lijst die er anders uitzien dan ze bedoeld zijn:

- **Weggelegde kaarten blijven op hun plek in het alfabet**, verbleekt en
  met een streep door het woord. Ze verhuizen níet naar een groepje
  bovenaan -- dat stond wel in het voorstel, maar dan springt de tegel weg
  onder de vinger die haar net aantikte, en moet je scrollen om te zien
  waar ze heen ging. `buildCards()` bouwt daarom alleen opnieuw op bij een
  andere stand; wegleggen en terugleggen zetten één klasse om.
- **Alfabetisch**, niet in de volgorde van `DECKS`. Die volgorde is er een
  van het schrijven (dieren, dan eten, dan spullen) en kent niemand die de
  app gebruikt. Je komt hier voor één kaart, en de letter is de enige
  manier om haar te vinden -- heen én terug.
- **Eén tik, geen lange druk.** Vasthouden is in deze app het teken voor
  het onomkeerbare, en dit is juist het tegenovergestelde: dezelfde tik
  zet de kaart terug.
- **Een tegel is minstens 96 px breed.** Op de 74 van de oude
  voorvertoning gaf dat vier kolommen van 84 px, en daar past het woord van
  24 van de 275 kaarten niet op één regel: "bouwvakker" brak af als
  BOUWVAKKE / R. Drie kolommen van 114 px laten er drie over. En let op met
  `overflow-wrap: break-word` -- alleen `anywhere` telt mee in de kleinst
  mogelijke breedte, dus met `break-word` groeit het woord dwars over zijn
  buurtegels heen in plaats van af te breken.

De ondergrens (`MIN_BAK`, 40) wordt gecontroleerd over **alle drie de
standen**, ook de stand waar je niet in staat. Anders leeg je vanuit Medium
(183 kaarten, ruim zat) de bak van Makkelijk (90) zonder dat er ooit iets
tegenhoudt, en sta je twee avonden later voor een stand die elk potje
dezelfde kaarten trekt. De weigering is de gewone `nudge()`, met een regel
erbij die zegt waarom -- een schud alleen laat de app stuk lijken in plaats
van vol.

Eén ding om te zien en niet uit te rekenen: de telling in de vouwregel
stond eerst rechts uitgelijnd, en dat is precies de kolom waar het zwevende
huisje hangt. "89 in het spel · 1 weggelegd" verdween er half achter zodra
je dat veld in beeld scrollde. Alles op dit scherm lijnt links uit, en dat
is niet toevallig: rechtsboven is van de uitgang.

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
