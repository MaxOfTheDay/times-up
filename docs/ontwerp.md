# Tijd is Om -- ontwerpnotities

De volledige redenering achter de regels in `CLAUDE.md`: waarom iets zo is,
wat er geprobeerd is, en wat er gemeten werd. `CLAUDE.md` is de korte
versie die bij elke wijziging geldt; dit is waar je kijkt vóór je zo'n
regel verandert.

Wat hier staat beschrijft de app zoals ze is. Hoe ze zo geworden is staat in
git en in de pull requests; een "hier stond eerst ..." hoort daar, niet hier,
tenzij de oude toestand nodig is om de regel te begrijpen. Klopt iets niet
meer met de code, pas het dan hier aan in dezelfde pull request.

## Het speelbord

Na een reeks losse verbeteringen (de rastergrond, één grond, één pen, één
taal voor een druk) is de hele vormtaal in één keer naast elkaar gelegd:
elk scherm gerenderd op drie maten, en geteld wat er aan kleuren, curves,
lengtes en lettermaten in `index.html` staat. Het bleek al grotendeels één
taal; ze was alleen niet als één opgeschreven, maar als dertig losse regels
van het type "één X". Daarom staat er nu een thema boven: een gedrukt
bordspel waarop alleen Vos en Uil leven, in vier regels (materiaal,
stukken, krachten, stem; zie `CLAUDE.md`).

Wat er bij die audit niet bij het thema paste, en is aangepast:

- op de overdracht bewogen vier dingen uit zichzelf (zie "De grond beweegt
  alleen als iets hem indrukt");
- wijnrood las als een derde rood (zie "Stoppen heeft geen eigen kleur");
- de regel voor goud beschreef iets anders dan goud deed (zie "Goud is
  'dit, nu'");
- de beweging had naast de vier tokens vijf losse curves, vijf namen
  (`ease-out` en verwanten) en zo'n twintig lengtes (zie "Vier lengtes,
  vier curves");
- acht lettermaten op het grote scherm stonden buiten de trap.

Wat erbij paste en bleef: de sluier van 82% bij pauze (een gedrukt
raster in plaats daarvan was druk en trok het oog weg van het paneel), de
papieren tegel om de mascotte op het aftellen (blauw op blauw verdwijnt),
en de hitte van de klok als enige eigen kleurtrap.

### Vier lengtes, vier curves

Elke animatie pakt een lengte uit `--t-press` (60 ms, indrukken),
`--t-los` (160 ms, terugveren en kleine wissels), `--t-kom` (280 ms, iets
komt binnen) of `--t-groot` (450 ms, een groot moment), en een curve uit
`--e-uit` (indrukken, binnenkomen, tot rust komen), `--e-los` (veren),
`--e-weg` (vertrekken) of `--e-vloei` (heen en weer: vliegen, ademen).
`linear` blijft voor wat stroomt: de klokband, de stralen, de snippers.
Web Animations lezen geen `var()`, dus halen ze hun curve met `curve()` uit
`:root`.

Buiten de trap blijven, met reden: `--t-card` (180 ms) en `--t-fly`
(220 ms), gemeten voor een speellus waarin een snelle ploeg om de twee
tellen scoort; `telDruk` (220 ms, precies één druk plus terugveren); en
de lussen die leven of een gevoel dragen (ademen, juichen, de zandloper,
de stralen, de val snippers), die hun eigen, lange tijd hebben. De
`--e-pop` van vroeger is opgegaan in `--e-los`; het verschil was niet te
zien.

Op het grote scherm (700 bij 700 en meer) zijn de lettermaten naar de trap
geschoven: 18 en 19 px naar `--fs-4`, 24 naar `--fs-5`, 34 tot 46 naar
`--fs-6`. Het rondewoord op de overdracht wordt daarmee iets kleiner (46
naar 40 px) en blijft het grootste woord op het scherm; een eigen trede van
56 px was niet nodig.

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
een toestand pakt er een uit `:root`: `--go` (goud) voor "dit, nu",
`--good` voor geraden, `--time-3/2/1` voor de hitte van de klok.
Nooit een ploegkleur lenen — dan betekent rood op het ene scherm "de vossen"
en op het volgende "haast je", en daarmee niets meer.

Dat geldt net zo goed voor goud, en daar is het één keer misgegaan: op het
overdrachtscherm stond goud tegelijk voor de kroon (staat voor), het
"+N"-label (net verdiend), de ronde-schijf (dit is de ronde nu), de rand om
de overgedragen tijd én de startknop. Vijf betekenissen op één scherm.

Het label groen maken haalde er één weg en liet er vier staan, en dát is de
les die overblijft: **één instantie repareren brengt de telling niet omlaag.**
Er staan er nu twee — de ronde-schijf en de startknop — doordat de kroon en de overgedragen tijd om hun eigen
redenen van dit scherm verdwenen zijn. Tel bij een nieuw element dus niet of
díe kleur al iets betekent, maar hoe vaak ze op datzelfde scherm al staat.

Kleur staat ook nooit alleen: elke toestand heeft er een tweede kanaal bij
(een vorm, een teken, een woord, een beweging).

### Goud is "dit, nu"

De regel zei eerst dat goud "verdergaan" betekent, maar goud stond ook op de
gekozen keuzeknop, de ronde waarin je zit, de kroon en
de plaat onder het merk. Bij de audit van de hele vormtaal bleek dat geen
verwarring maar één betekenis: goud is wat nu geldt, het ene uit een rij.
De regel is herschreven naar wat er al stond; er is geen pixel veranderd.

### Stoppen heeft geen eigen kleur

Wijnrood (`--danger`) stond op de vloed van de stopknop, zijn stippellijn,
de streep door de ballon van ronde 3 en de rand bij een weigering. Op een
telefoon las het naast vermiljoen als een vuile Vos: een derde rood. De
stopknop zei al drie keer wat hij is (huisje, stippellijn, vloed), dus
vloeit hij nu in inkt met het huisje in papier (15,9:1), is de streep door de
ballon inkt, en krijgt een geweigerde knop heel even een tweede inktring
(het stilstaande signaal naast de schud, voor beperkte beweging). Het palet
is daarmee: papier, inkt, Vos, Uil, goud, groen voor geraden, en de hitte
van de klok.

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

Er is één voortgangsmeter in deze app: de rand om de kaart. De aftelschijf
had er ook een (`#cdArc`); die is weg, zie "Eén taal voor een druk". En het
pauzepaneel had een stilstaande wijzerplaat (`#pauseRect`); die is weg sinds
de pauze de kaart omdraait en haar eigen band overneemt (zie "Pauze draait
de kaart om"). De band rekent met `perim * (1 - p)`, en dat betekent
dat de inkt aan haar beginpunt vast blijft zitten terwijl het vrije uiteinde
zich terugtrekt. De band windt dus af, tegen de wijzers in, zoals een
keukenwekker die je hebt opgedraaid.

Dat is één keer omgedraaid met "een klok loopt nu eenmaal met de wijzers
mee" als reden, en dat is een regel van buiten deze app: hij zou de kaartrand
de enige van drie maken die de andere kant op gaat. Aflopende tijd wíndt af.

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
- **Diepte.** `--lift-2` (6 px) is de hoofdhandeling, `--lift-1` (4 px) al
  het andere. Dit stond ooit als "5 staat stil, 8 kun je indrukken"
  genoteerd en dat is nooit waar geweest: de pauzeknop, "terug", de chips
  en de kaarttegels in de bak liggen allemaal op `--lift-1` en zijn allemaal
  indrukbaar, op dezelfde hoogte als de kaart en de opdracht, die het niet
  zijn. Reken dus niet uit de schaduw af of iets een knop is.
- **Beweging.** Dát is waar indrukbaarheid staat: elke knop zakt bij
  `:active` precies zijn eigen schaduw in, een stilstaand vlak beweegt
  nooit. In en uit zijn twee bewegingen: in in `--t-press` (60 ms) zonder
  veer, zodat ook een vluchtige tik te zien is; uit in `--t-los` (160 ms)
  met `--e-los`, die even voorbij de rust veert. Allebei gelijk op 90 ms las
  als een knipper, en een snelle tik zag je soms helemaal niet. Safari zet
  `:active` op een aanraking alleen als er naar `touchstart` geluisterd
  wordt; daarom staat er een lege, passieve luisteraar op `document`.

Hoe groot de twee hoogtes zijn, is op het oog bijgesteld. Op 5 en 8 px hing
er onder elke grote cirkel een zware zwarte sikkel, en op de sluiter van
72 px was de schaduw ruim een tiende van de knop. Op 4 en 6 px liggen kaarten
en tegels nog zichtbaar op het bord en blijven de twee gewichten te
onderscheiden. Lager kan niet: op 3 px is de schaduw van een kaart dunner dan
haar eigen rand van 4 px (`--line`), en dan leest hij niet meer als diepte
maar als een scheve, dikke rand. Houd `--lift-1` dus minstens op `--line`.

De sluiter in de maker droeg als enige cirkel geen teken maar een dunne
binnenring, en die las als een doelwit of een munt. Nu draagt hij het
fototoestel, zoals spelen het driehoekje en goed het vinkje. Een papieren
kern in een gouden ring (de sluiter van een telefoon) viel af: dat zijn drie
randen.

Zet een primaire knop nooit met alleen `min()` op maat. De knop in het
pauzepaneel kromp liggend mee met de schermhoogte tot 68 px — even groot als
de stopknop ernaast — en dan wegen de hoofdhandeling en de onomkeerbare even
zwaar. Er hoort een `max()` met een ondergrens omheen. Ook 96 tegen 68 woog
liggend nog bijna gelijk; de ondergrens is nu 112 px waar de hoogte het
toelaat (`min(112px, 29vh)`), met 96 als bodem. Onder elkaar was het
pauzepaneel zo'n 400 px hoog en viel het op 568 bij 320 onderaan van het
scherm; dat los je op met de opbouw, niet met een kleinere knop. Liggend tot
430 px hoog staan klok en stand daarom links en de twee deuren rechts
(192 px hoog op 568 bij 320).

`--tap` (48 px) geldt ook liggend. De hulpknoppen gingen op een laag scherm
naar 44 px om hoogte te sparen, en dat waren de pauzeknop en het huisje: de
knoppen die een volwassene snel moet raken.

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

Hoever 32 px reikt is gemeten en niet geschat: met de slagschaduw van 4 px
erbij ligt zo'n hoek feitelijk op (28, 28), en die blijft binnen een straal
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
rust, de inkt die van onder naar boven volloopt tijdens het houden, en het
teken dat halverwege omkeert naar papier zodra die vloed het inhaalt. Dat
omslagpunt is het enige ijkpunt onderweg. Wat de eerste poging mankeerde was
contrast en maat — volle dekking, volle breedte — niet de plek (de kleur is
later inkt geworden, zie "Stoppen heeft geen eigen kleur").

Starten hoorde daar ooit ook bij, maar dat was het niet waard. De klok
starten is niet onomkeerbaar — pauze zet 'm zo weer stil — en de rekening
kwam bij de speler die deze knop élke beurt indrukt: een kind van vier, voor
wie 700 ms volhouden het lastigste gebaar in de app is. Wat de lange druk
écht afdekte was een strijkende vinger tijdens het doorgeven, en dat vangt
het **aftellen** nu op: tikken, drie tellen, dan pas de kaart en de klok. Een
misser kost drie tellen in plaats van een beurt, en er is meteen een tel om
je klaar te zetten. Afbreken kan, via de tegel rechtsboven — zonder die
uitweg zou een losse aanraking alsnog een beurt starten, alleen later.

Dat afbreken ging eerst via het hele vlak, en daar brak precies het kind af
dat op "drie, twee, een" enthousiast op het scherm tikt: het meest
natuurlijke wat je bij een aftellend cijfer doet. Een strijkende vinger
tijdens het doorgeven is met de tik op start en de drie tellen al twee keer
opgevangen, dus het vlak hoeft dat niet ook nog te doen. Afbreken is een
echte `.btn-icon`, dezelfde tegel op dezelfde plek als de pauzeknop die er
een tel later staat, en met hetzelfde teken: die hoek betekent de hele beurt
"wacht even". Er stond eerst de pas-pijl omgekeerd, en die las als
terugspoelen, of als familie van de pasknop eronder.

**Het teken op stoppen is het huisje, geen kruis.** Een kruis op een paneel
betekent overal "sluit dit", en wie dat dacht, wilde juist verder spelen: de
betekenis was precies omgekeerd. Het huisje zegt waar je heen gaat, en het is
het huisje dat op de overdracht dit paneel opende. Dat het iets kost, zegt
de stippellijn en de lange druk, niet het teken.

**Een tik is een vraag, geen fout.** Wie er alleen op tikt, wil weten wat de
knop doet. Een schud en een nee-trilling vertelden alleen dát het niet
mocht. Nu doet de knop de druk voor: de vloed loopt een kwart op, een vinger
drukt op het huisje, en dan loopt het weer leeg (`holdButton()`, korter dan
250 ms telt als tik). Wie wél hield en te vroeg losliet, ziet het rood in
0,3 s weglopen in plaats van in één beeld te verdwijnen, en een nieuwe druk
gaat verder waar de vloed stond. Twee keer tikken als alternatief is bekeken
en afgewezen: een kleuter die twee keer port, stopt dan het spel, en dat is
precies wat de lange druk tegenhoudt.

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

Minder is meer op die kaart. Twee dingen stonden er elke beurt terwijl ze
niets nieuws zeiden:

- **De seconden** (`#hoSecs`) waren een hele avond dezelfde 30. Ze staan er
  nu alleen als een onderbroken beurt met haar resttijd verdergaat
  (`G.pendingMs` kleiner dan een volle beurt): dan zeggen ze iets.
- **De regel van de ronde** (een zin onder het rondewoord) staat er niet
  meer. De tekening zegt de regel al (veel woorden, één woord, geen
  woorden), en het woord noemt de ronde voor wie voorleest; de zin herhaalde
  dat in een vorm die de spelers niet kunnen lezen, en liep in ronde 1 over
  twee regels. Zo zijn beurt- en rondewissel ook dezelfde kaart; alleen de
  schijf die doorschuift onderscheidt ze. De volledige regels staan bij de
  instellingen ("Zo speel je"), en `ROUND_HOW` blijft in de aria-label.

De eerste twee zitten inmiddels op hetzelfde vlak. De stand stond ernaast, in
een eigen omrand kaartje op de ploegkleur, en dat gaf het scherm drie vlakken
waar twee genoeg zijn. `buildTally()` hangt haar met `prepend` in de
opdrachtkaart; daarmee staat alle tekst op hetzelfde papier -- op ploegkleur
haalt `--ink-2` maar 1,5:1 -- en houdt het scherm nog de kaart en de knop
over.

De twee wissels vragen het tegenovergestelde, en dát is wat het verschil
tussen de twee standen moet dragen. Bij een **beurtwissel** gaat het toestel
écht van hand: `turnEnd()` draait `G.team` om, en "wie krijgt hem" is dan het
enige waar het scherm voor bestaat. Bij een **rondewissel** gaat het toestel
ook van hand -- de andere ploeg opent de nieuwe ronde (zie "Een nieuwe ronde
opent de andere ploeg") -- maar is de nieuwe regel het grootste nieuws.

Het verschil zat lang in de **dichtheid van vak 2**: compact bij een
beurtwissel, uitgeklapt bij een rondewissel. Dat kanaal zegt over de handeling
niets -- een tafel die de overdracht eenmaal geleerd heeft, geeft het toestel
bij ronde 2 aan de verkeerde ploeg door, want het scherm ziet eruit als "geef
door". De compacte variant bestond wel om een goede reden -- de kaart
overstemde het antwoord op "wie is er nu" met 39.372 px2 tegen 4.484 -- maar
het was een symptoom repareren. Twee dingen vochten om dezelfde blik omdat het
twee vlakken wáren. Zet de stand ín de kaart en die strijd is voorbij: wie aan
zet is, is de grote mascotte in de kop van de kaart zelf.

Daarmee heeft de kaart nog maar één maat, in allebei de standen, en zijn de
twee wissels meetkundig gelijk: gemeten op 390 bij 844 een kaart van 343 bij
372 en een knop op y 557, wat het ook is. Wat de twee onderscheidt is
**beweging en één merkteken**, niet de opmaak:

- **beurtwissel** -- de mascotte in de stand komt op en ademt daarna; het
  opdrachtblok staat stil;
- **rondewissel** -- de tekening en het woord komen op; de stand staat stil,
  en de gouden schijf schuift door naar de volgende ronde in de rij.

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
en de tekening met het woord. Ze werden op drie plekken los bijgewerkt en
lazen alle drie dezelfde rijtjes zelf uit; één plek die je vergeet en de
ronde staat op twee opeenvolgende schermen anders. `paintRound(ico, size,
host)` doet ze nu alle drie, met `size` op `"teken"`, `"chip"` of `"kaart"`.
`ROUND_HOW` staat alleen in de aria-label van de `"kaart"`-tak.

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
verteld, en luider: het label in de balk telt per kaart op, de geraden kaart
vliegt erin, en `Snd.goed()` gaat er een halve toon bij omhoog. Wie scoorde
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

De hoeveelste ronde staat als één rij van de drie rondes (`.ronderij`),
in allebei de standen: de ronde van nu is de gouden schijf met haar tekening,
de twee andere zijn kleine papieren tegels met hun eigen ballon. Er stonden
drie vierkantjes onder de tekening (verbruikt inkt, nu goud, nog te komen
leeg), en die lazen niet: een code die je moet leren, die naar geen enkele
ronde wees, en waarvan in ronde 3 het zwart het luidst was -- het oog ging
naar wat voorbij was in plaats van naar nu.

De rij gebruikt het verhaal dat de tekeningen al vertellen (veel woorden, één
woord, geen woorden), en voegt niets toe: ze vervangt de tekening en de
vierkantjes allebei, en elke ronde staat één keer in beeld. Daarom is het geen
routekaart (zie hierboven): die noemde de ronde van nu een tweede keer.

Geweest en nog te komen hebben dezelfde huid. Een inkt-tegel voor "geweest"
is geprobeerd in de mockup, en gaf in ronde 2 drie looks naast elkaar (zwart,
goud, papier). Dat is niet nodig: de plek links of rechts van de schijf zegt
het al. De rij is zo hoog als de schijf, zodat de kaart niet verspringt.

Bij een rondewissel vanuit het spel staat eerst de vorige ronde als schijf;
als de omgedraaide kaart geland is (`RIJ_WACHT`), krimpt ze tot tegel en
groeit de volgende tot schijf, die dan haar regel twee keer voorspeelt. Dat
doorschuiven is het teken dat er een ronde afgesloten is. Een hersteld potje,
een afgebroken aftelling en beperkte beweging krijgen meteen de stand van nu.
De gouden schijf zit daarom niet meer in `RI_ART`: ze is het vak zelf, anders
kan een tegel niet tot schijf groeien.

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

De schijf heeft een ondergrens (`max(120px, ...)`): liggend kromp ze op
24vh tot 94 px, kleiner dan de knop waar ze uit kwam. Elke tel klopt ze één
keer naar binnen (`.klop`, 0,88 naar 1 met `--e-pop`) en vertrekt de ring
(`#cdGolf`) van haar rand in plaats van uit het midden; uit het midden liep
hij het eerste vijfde van de tel onzichtbaar onder de schijf, en kwam hij
pas na het tikje te voorschijn. Naar buiten kloppen raakte de inktboog
eromheen, die 6 px vrij ligt.

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

De grond blijft nu neutraal zolang er geloot wordt, en de kleur komt binnen
op het moment dat de worp landt. De kleur ís het antwoord, dus
ze hoort met het antwoord te komen. `landToss()` zet haar goed bij een
afgebroken worp en bij beperkte beweging, waar `tossTeams()` meteen
terugkeert; `tossTeams()` zet daarna opzettelijk weer neutraal en zet de
echte kleur pas in de laatste stap.

Wat hier níet moet: de achtergrond mee laten flikkeren met de worp. Dat is
veel spannender en het is de eerlijkste vertaling van "de kleur wordt
geloot", maar het zijn zeven volledige schermwisselingen in een seconde,
waarvan de eerste paar 50 ms uit elkaar -- dat zet je niet voor kinderen neer.

### Tussen de knop en de worp gaat de grond niet uit

Neutraal was eerst `--paper-2`, met de papieren punten van de ploeggrond
erop. Die punten zie je op beige niet, dus het begin van een potje las als
aan, uit, aan: de inkten punten van de titel, een seconde een kale beige
grond met de worp, dan de ploegkleur met punten. De knop die je net
indrukte sprong bovendien 80 px omlaag, en de kaart verscheen uit het niets.
Frame voor frame gefilmd, met een live mock-up ernaast; Max koos deze
versie.

- De worp loopt op de grond van de titel: papier met inkten punten op 11%
  (`veldHo.inkt(true)`). Ook bij Nog een keer.
- De knop glijdt van waar je hem indrukte naar zijn plek op de overdracht
  (`rimpelDoor()`, met `--e-los`), zoals de startknop overgaat in de schijf
  van het aftellen. De kaart komt eronder vandaan 24 px omhoog.
- Als de worp landt, groeit de ploegkleur als een cirkel uit de startknop
  (`veldHo.onthul()`, 450 ms), en worden de punten papier waar de cirkel
  langskomt. Daarna staat de kleur op het scherm zelf, zonder overgang, anders
  begint die weer vanaf papier.

De regel daaronder: een druk die de grond verandert, laat de nieuwe grond
uit de ingedrukte knop groeien. Waar de klok de grond verandert (tijd om,
ronde om) stroomt de kleur, zoals hieronder bij "De grond stroomt".

### Naar huis groeit uit de knop

Stoppen (het huisje vasthouden in de pauze) en naar huis vanaf de eindstand
deden allebei hetzelfde: het gekleurde scherm weg, één beeld kaal papier,
dan kwam de titel binnen via grijs (`screenIn` op een leeg scherm). Het was
de enige druk in de app die niet vanuit je vinger begon. Frame voor frame
gefilmd met een mock-up ernaast; Max koos deze versie.

`naarTitel(k, sluier)` laat de titel, met haar papier en inkten punten, als
cirkel groeien uit de knop die je indrukte (450 ms, `--e-uit`), over het
scherm dat je verlaat. Dat scherm blijft eronder staan (`.blijft`, zonder
pointer-events), en bij stoppen ook de sluier met het paneel. De knop wordt
gemeten vóór het paneel verdwijnt; daarna meet hij nul. De titel heeft
geen `screenIn` (zie "Het titelscherm heeft twee dingen"), dus na de cirkel
vervaagt er niets meer. Vos en Uil gluren daarna op zoals altijd.

### Afbreken zet de grond niet uit

Wie tijdens het aftellen op de tegel in de hoek tikt, ging van de
ploegkleur naar kaal papier en daarna weer naar dezelfde ploegkleur:
`handoff()` dacht dat het van een ander scherm kwam (`current` is dan
`"play"`) en liet de kleur vanaf papier stromen. Nu krijgt het
`zelfdeGrond` mee, en glijdt de schijf terug in de startknop
(`rimpelDoor()` met de gemeten schijf), zoals ze eruit kwam.

## De grond stroomt, het scherm vervaagt niet

Die vloed was er alleen voor de worp. Ze geldt nu voor elke overdracht, en
daarmee is `#s-handoff` het enige scherm zonder `screenIn`. Dat is geen
vergeten regel maar de hele maatregel, en de reden staat in beeld.

`screenIn` vervaagt het hele scherm -- grond én inhoud -- boven het papier
van het scherm eronder. Op elk ander scherm is dat onschuldig, want daar is
de grond ook papier. Hier is de grond het antwoord op "van wie is dit
toestel nu", en die kwam dus binnen via grijs. Gefilmd op vijf keer traag en
teruggerekend: de grond stond op 47 ms op `170,191,208` en pas op 231 ms op
ploegkleur, en de regeltekst op de kaart haalde 1,1 : 1 op 3 ms, 2,2 op 47
en 4,8 op 93 -- het luidste kanaal van de app en de enige tekst die een
volwassene moet lezen, allebei een derde van de binnenkomst lang
onleesbaar. Bij een niet-lezer aan tafel is dat precies de verkeerde helft
om te laten wachten.

Nu staat de kaart vanaf het eerste beeld op 15,8 : 1 en doet de grond het
werk alleen: papier op 3 ms, ploegkleur op 360. Je ziet het papier waar je
net vandaan komt vollopen met de kleur van de ploeg die hem krijgt.

**De vervaging verhuist niet, ze vervalt.** Dat is de les die het proberen
waard was: er zijn drie varianten gebouwd die de grond een eigen laag gaven
zodat de inhoud haar `screenIn` kon houden. Met de inhoud 120 ms achter de
grond stond er ruim een tiende seconde een leeg gekleurd scherm; met 40 ms
achter kwam het grijs gewoon terug (1,1 - 2,2 - 4,7 : 1), want inhoud die
vervaagt bóven een grond die zelf nog beweegt is precies waar de regel "een
vlak in een keten vervaagt maar op één plek" over gaat. Krijgt de grond zijn
eigen tijd, dan moet de vervaging weg.

En er hoeft geen laag bij. `#s-handoff` had de `transition:
background-color` al staan, voor de worp. `handoff()` zet `--team` op
`var(--paper)` vóór `show()` en na twee beeldjes op de echte kleur -- twee,
want het eerste zet `display` op flex en pas het tweede heeft een
beginwaarde om vandaan te lopen.

Bij beperkte beweging niet: daar staat `transition: none !important`, dus
papier zou geen begin van een vloed zijn maar één beeld flikkering. Dat is
dezelfde uitzondering die `landFly()` en `holdButton()` al maken, en om
dezelfde reden.

Bij het filmen kwam er iets anders boven dat hier los van staat:
`#s-handoff.on > #hoTally` raakte niets meer, want `buildTally()` hangt de
stand ín de opdrachtkaart. De golf van drie vakken was dus een golf van twee
die op haar tweede tel begon -- niets op nul, de kaart op zeventig. Een
selector die niets raakt zegt dat niet, en geen test kijkt ernaar. De
vertragingen zijn een tel opgeschoven; de kaart begint weer op nul.

### En het spelscherm precies andersom

`#s-play` heeft er ook geen, en om de spiegelbeeldige reden: **daar
verandert de grond hélemaal niet.** Dit scherm komt altijd binnen achter
het aftellen -- `show("play")` staat maar op één plek, in `startTurn()`, en
die roept `countdown()` aan -- en dat aftelvlak is rand-tot-rand dezelfde
ploegkleur als de overdracht waar je net vandaan komt. De vervaging voerde
dus een verandering op die er niet was: op t+0 een bleke crème-roze wasem
met een spookschijf erin, en pas na ruim 200 ms de kleur die er al stond.

Erger was wat ze brak. De gouden schijf wordt op de gemeten rechthoek van
de startknop gelegd, zodat de cirkel die je indrukte de cirkel is die
begint te tellen. Maar die knop was dekkend en de schijf begon op nul, dus
je zag geen "de knop wordt de schijf" maar "de knop verdween en er
verscheen een schim". Nagemeten na de wijziging: knop op (106, 557) van
177 px, schijf op het eerste beeld op (106, 557) van 177 px, dekking 1,00.
Dezelfde cirkel, geen overgang nodig -- die was er al, ze was alleen niet
te zien.

Meegenomen: zonder die animatie heeft `#s-play` tijdens het aftellen geen
transform meer, en daarmee vervalt de coördinatenval bij `.cd-round` en
`.cd-team` (zie hierboven) helemaal. De gemeten rechthoeken kloppen nu
zonder dat je op transform-invariantie hoeft te vertrouwen, en `sizeCard()`
meet een kaart die stilstaat.

### Het spelscherm in de ploegkleur

Lang was de grond van `#s-play` papier, terwijl de overdracht en het
aftellen in de ploegkleur stonden. De schijf ging dus open op crème, en op
het enige scherm waar de tafel echt moet zien wie er speelt, stond de ploeg
alleen nog in een mascotte van 48 px. De zin hierboven ("daar verandert de
grond helemaal niet") klopte daardoor niet meer. Nu is de grond
`var(--team)`, vlak (zie "Rasterpunten op de grond" voor waarom zonder
punten), en is die zin weer waar: door het gat van de schijf zie je dezelfde
kleur, met alleen de kaart erbij.

Het einde moest daarvoor mee. De overdracht stroomt vol vanaf papier; vanaf
een rode grond zou ze in één beeld naar papier springen. Rechtstreeks van
rood naar blauw laten lopen is bekeken en afgewezen: de tussentint is paars,
en paars (`--time-1`) betekent al "nog vijf tellen". Daarom trekt de kleur
weg zodra het stempel valt (`#s-play.over` bij tijd om, `.leeg` bij een lege
stapel): `--t-groot` lang, binnen de adem van `BEURT_ADEM`, en dan draait de
kaart om zoals altijd. Het geeft de ploeg die klaar is ook haar eigen
moment: de hele tafel ziet het vel leeglopen, ook wie niet naar de kaart
kijkt. De overgang staat alleen op die eindtoestand; terug naar de
ploegkleur gaat in één beeld, onder het aftellen. Bij beperkte beweging
meteen papier.

Een omdraai bij elke nieuwe kaart is ook bekeken en afgewezen: omdraaien
betekent "dit is voorbij" (zie "Elke kaart draait om"), en per kaart zou de
tekening tien tot twintig keer per beurt 140 ms weg zijn.

### Rasterpunten op de grond

De ploegkleur op de overdracht was één vlak, en las daardoor als een
achtergrondkleur in plaats van als "deze kant van het bord". Nu liggen er
rasterpunten op, zoals op gedrukt karton: `#s-handoff::before`, papier op
16% dekking in een raster van 12 px. Op 20% en 14 px was het te veel: de
punten werden een patroon om naar te kijken in plaats van een grond.

Eerst waren ze inkt. Dat maakte de ploegkleur donker en een beetje vuil;
papier licht hem op, zoals de witte punten op gedrukt karton, en het is
geen nieuwe kleur: papier staat al overal op het scherm, en een
donkerder ploegtint zou een derde "rood" of "blauw" zijn. Ze lopen van
rand tot rand (zie "Een vol bord" hieronder).

Het raster staat stil. Het schoof eerst traag, maar dan liepen de
opzwellende punten van de deining en de rimpel (een tweede laag op een
eigen raster) er schuin naast, en zag je de grond dubbel. Nu delen alle
lagen hetzelfde raster (`--stip`, `--stip-op`, gecentreerd), en zwelt een
punt op over zijn eigen plek.

Daarbovenop twee bewegingen, gekozen uit vier die naast elkaar zijn
gezet (een golf bij binnenkomst, ademende punten, deining, een rimpel):

- **Deining**: om de elf tellen trekt er een brede band schuin over de
  grond, als wind over een veld, waarin de punten opzwellen
  (`#s-handoff::after`, een tweede laag grotere punten met een
  bandmasker, `--band` via `@property`). Sfeer vanuit de ooghoek. De
  golf bij binnenkomst deed hetzelfde werk één keer en is vervallen.
- **Rimpel**: een tik op de grond (niet op de kaart of de knoppen) stuurt
  een ring vanaf de vinger (`#hoRimpel`). Speelgoed, zoals Vos en Uil op
  de titel; het doet verder niets.

Ademende punten vielen af: als alles op het scherm tegelijk klopt, voelt
het onrustig. Beide lagen liggen achter de kaart en de knop, en staan
stil bij beperkte beweging.

Ook op het aftellen, dat dezelfde ploeggrond heeft (`#countdown::before`),
Daar gaat bij elke tel één ring vanuit
de schijf naar buiten (`#cdGolf`, `telGolf()`), op de maat van het tikje:
drie, twee, een, ook te zien voor wie het geluid niet hoort.

Na de eerste versie op een telefoon was het een tik te veel: de opgezwollen
punten stonden op het dubbele van de grond, en de ring van het aftellen
kwam drie keer op volle sterkte voorbij. Nu zwellen de punten minder op
(27% tegen 16%), komt de deining om de elf tellen, en staat de ring van het
aftellen op 60% van de rimpel die je zelf met een tik maakt.

Het einde van beide bewegingen bleef hangen. De deining liep op
`ease-in-out`, dus remde ze af vlak voor ze uit beeld ging; de ring liep
op een sterke uitloop en stopte op 460 px, zodat hij aan het eind kroop en
nog half in een hoek stond toen hij verdween. Nu loopt de deining op
gelijke snelheid, als wind, van buiten beeld naar buiten beeld. De ring
remt maar zacht af, loopt door tot 560 px (verder dan de hoek van een
staand scherm) en vervaagt vanaf de helft terwijl hij nog groeit. Op het
aftellen duurt hij 0,95 s, zodat hij weg is vóór de volgende tel.

### Eén grond, van knop tot kaart

Uit drie live versies (alleen een rimpel; één grond; één grond plus de weg
terug) koos Max de middelste. Elke schermwissel komt nu voort uit wat je net
aanraakte:

- **De druk** stuurt een rimpel vanaf de knop door het veld van het
  aftellen (sterkte 1,2, vanaf de rand van de knop). Dat is de ring van de
  eerste tel.
- **De opdrachtkaart zakt in de grond**: een kopie op haar gemeten plek
  (`.cd-kaart`, in de klik-handler gemaakt, want een tel later is de kaart
  weg) zakt 10 px en krimpt naar 94% terwijl ze in 0,42 s verdwijnt. De
  punten lagen er al die tijd onder, dus de grond springt niet.
- **Op nul gaat de schijf open** (`.countdown.open`): een gat zo groot als
  de schijf groeit in 0,45 s uit tot het hele scherm, met een laatste ring.
  Door het gat ligt het spelscherm al klaar; `done()` draait meteen, dus er
  wacht niets.

De weg terug (de ploegkleur die bij tijd om uit de kaart groeit) viel af:
die beweging kwam precies op het moment dat het toestel doorgegeven wordt.
Bij beperkte beweging is er geen kopie, geen vloeien en geen gat; dan blijft
het `cdOut`.

### Eén taal voor een druk

Max vroeg of het aftellen "nog klopte" en wilde daarna één taal voor alle
knoppen. Wat niet klopte: de inktring om de schijf liep vloeiend af over drie
tellen, terwijl het cijfer, de piep, de klop en de ring door de punten per
tel sprongen. Twee ritmes tegelijk, en de ring hing los van de schijf met
een strook ploegkleur ertussen.

Getoond (live): de ring in drie stukken die per tel wegspringen, de rand van
de schijf zelf als meter, geen ring, en zonder ring met een schijf die per
tel knijpt (rek en klets) of springt. Knijpen viel af om een regel van
binnen deze app: vervormen is wat Vos en Uil doen als ze juichen of
schrikken. Een knijpende schijf leest als een dier, niet als een knop.

Wat bleef is de knop zelf. De schijf begint op de gemeten plek van de
startknop; ze ís die knop. Dus houdt ze zijn `--lift-2`, en elke tel drukt de
klok haar in zoals een vinger dat doet: 60 ms zonder veer erin, met
`--e-los` terug (`telDruk`, 0,22 s). De ring door de punten vertrekt 60 ms
later, bij het terugveren. Na een tik op de knop is de eerste tel de druk van
de vinger zelf, met zijn rimpel vanaf de knop.

Bij het nalopen van alle knoppen tegen die taal:

- elke cirkel heeft `--lift-2` en elk vierkant `--lift-1`, en ze zakken allemaal
  hun volle lift in;
- het kaartentegeltje op de overdracht en de letters A-Z in de instellingen
  zakten wel in, maar stonden niet in de selectorlijst en sprongen dus terug
  zonder veer; nu wel;
- alleen de startknop van de overdracht gaf een rimpel. Spelen op de titel
  en Nog een keer op de eindstand nu ook (`knopRimpel()`). Die wisselen
  meteen van scherm, dus loopt hun rimpel door op de grond van de
  overdracht vanaf de plek van de knop (`rimpelDoor()`);
- de rimpel zelf was te zwak om als antwoord op een tik te lezen: 4,5 px
  opzij en 1,3 px groei. Nu 12 px, een punt tot ruim het dubbele en 0,45
  lichter, een bredere golf (32 px) die trager uitdempt (2,1 s). De deining
  houdt haar oude, zachte maat.

De titel kreeg dezelfde grond, maar niet in een ploegkleur: hij is van
allebei de ploegen, en rood is Vos. Inkt op papier, 11% (eerst 7%: op
armlengte las de doos als kaal beige, en een tik op de grond gaf een rimpel
die je nauwelijks zag). De eindstand kreeg
vuurwerk in de punten: vier rimpels bij de hoeken op de vier noten van de
fanfare, 130 ms uit elkaar, en een ring uit de kaart op de slotnoot. De
snippers vallen nu één keer in plaats van twee: het feest is de grond.

### Rastertoon op een canvas

De lagen hierboven (`::before`, `::after`, `#hoRimpel`, `#cdGolf`) konden
een punt alleen laten oplichten: een tweede laag grotere punten die door
een masker zichtbaar werd. Naast elkaar gezet met twee alternatieven (een
live mock-up, gekozen door Max): **rastertoon**, waarin de punt zelf groeit
en krimpt zoals in drukwerk, en een tik de punten als een steentje in water
naar buiten duwt en terug laat veren; en **wind**, een veld dat overal
traag ademt en bij een tik uiteenspat. Wind was het speelst maar druk,
terwijl de grond achter de kaart rustig moet blijven. Rastertoon is
gekozen.

Dat kan niet met CSS-verlopen: elke punt krijgt een eigen maat en een eigen
verschuiving. Het is nu één canvas per grond (`.stipveld`, `stipveld()`),
met dezelfde maten als ervoor: raster 12 px op het midden, straal 2 px op
16%, aanzwellend tot 3,3 px op 28%, van rand tot rand.

- **Rimpel**: een golfpakket (een gaussische omhullende maal een cosinus)
  dat met 360 px/s uitloopt en uitdempt. De positieve kant laat de punten
  groeien; het hele pakket duwt ze tot 4,5 px opzij, dus naar buiten en
  daarna terug. Op het aftellen sterkte 0,6, vanaf de rand van de schijf.
- **Zuinig**: er loopt alleen een `requestAnimationFrame`-lus zolang er een
  rimpel onderweg is (of een onthulling loopt) en de grond in
  beeld is. Daarbuiten staat er één getekend beeld. Bij beperkte beweging
  alleen dat beeld, zonder rimpel.

Op het spelscherm en de instellingen liggen geen punten: het spelscherm
moet rustig blijven, en de instellingen zijn voor de volwassene. Op het
spelscherm is dat gemeten en niet alleen gevoeld: in een live mock-up met
punten in de ploegkleur rimpelde elke geraden kaart (de regel voor een
cirkel op een stippengrond), en een rimpel duurt 2,1 s terwijl een goede
ploeg elke 1 à 2 s tikt. In een reeks golfde de grond dus aan één stuk door
naast de kaart, en het canvas tekende elk beeld opnieuw terwijl de kaart
naar de teller vloog. Max koos de vlakke grond. Op de
titel staan ze wel, als inkt op 11% (zie "Eén taal voor een druk"); een
eerdere poging met papieren punten op papier las daar als vuil.

### De grond beweegt alleen als iets hem indrukt

Bij de audit van de hele vormtaal bewogen er op de overdracht vier dingen
uit zichzelf tegelijk: de deining, de ademende mascotte, het rondeteken dat
eindeloos zijn regel voordeed, en het knipperen. Het thema van de app is
een gedrukt bordspel waarop alleen Vos en Uil leven, dus mag alleen wat
leeft uit zichzelf bewegen. De rest beweegt als er gedrukt wordt: door een
vinger, door de klok (het aftellen, de zandloper op de titel) of door de
fanfare.

Daarom is de deining weg, op alle gronden. Een rimpel heeft nu altijd een
oorzaak die je net zag of voelde. Het rondeteken op de overdracht speelt
zijn regel twee keer voor als het scherm binnenkomt (`paintRound()` zet het
opnieuw neer) en staat daarna stil. Vergeleken in een live mock-up naast de
oude versie; Max koos deze.

### Een vol bord

De punten vervaagden naar het midden: één ellips (75% bij 60% op 45% van de
hoogte), gemaakt voor de opdrachtkaart en ongewijzigd overgenomen op de
titel en de eindstand; op het aftellen een vaste ring van 110 tot 260 px om
het midden van het scherm. Geen van die uitsparingen volgde wat er op het
scherm lag, en daarom oogde de lege plek willekeurig. Liggend was het het
duidelijkst: op de overdracht een lege band tussen kaart en knop, op het
aftellen bleven er twee stroken punten over aan de zijkanten. Bij beperkte
beweging staat de schijf op de plek van de startknop, en lag het gat naast
haar.

De uitsparing kwam uit de tijd van de deining: achter de kaart mocht niets
onrustigs bewegen. De deining is weg, en de kaart is ondoorzichtig papier;
een rimpel die eronder doorloopt verdwijnt gewoon. Drie versies naast elkaar
gezet, op echte opnames staand en liggend: de ellips, een vol bord, en een
harde uitsparing van 18 px om elk stuk. Die laatste tekent een derde rand
om elke kaart (zie "Papier heeft twee randen") en moet bij elke draai
opnieuw gemeten worden. Max koos het volle bord. Daarmee verviel ook het
vloeien van het ene masker naar het andere op het aftellen.

`stipveld()` neemt nog een `masker` (0 tot 1 per punt) als iemand later
toch een verloop wil; geen enkele grond gebruikt hem nu. Past dat ooit, dan
als rastertoon: een punt die groter wordt, niet een die vervaagt.

### Rastertoon, afgewerkt

Bij het nalopen van het volle bord, live naast elkaar gezet:

- **Rood en blauw even zichtbaar.** Papier op 16% haalde op rood 1,17:1 en
  op blauw 1,28:1: Vos had een vlakker bord dan Uil. Nu 23% op rood
  (1,27:1) en 16% op blauw (`STIP_PAPIER`); de titel van 11 naar 12% inkt
  (1,28:1). Alles blijft onder 1,3:1, dus een textuur en geen patroon.
- **Een rimpel met een dal.** Alleen de kam was te zien: punten die groeien
  en oplichten, zodat een tik een ring van kralen tekende, een los ding op
  de grond. Nu krimpen de punten ook in het dal achter de kam (tot 80% van
  hun straal), en leest de tik als een duw door het bord. Sterkte en
  snelheid zijn gelijk gebleven.
- **De stralen in de punten.** De eindstand had bleke wiggen (een svg op
  16%) over de punten heen, die eindeloos draaiden: twee texturen op
  elkaar. Nu zijn de stralen rastertoon: binnen twaalf stralen vanuit het
  midden is een punt 1,75 keer zo groot en een kwart voller. Voorgesteld
  was dat ze één keer meedraaien met de fanfare en dan stilstaan; Max wilde
  het draaien houden, binnen de punten. Ze draaien dus in 26 s rond zolang
  het scherm in beeld is: het feest is het enige dat hier uit zichzelf
  loopt. Bij gelijkspel blijft de grond papier en worden het inkten punten,
  zoals op de titel (de gouden wiggen vielen weg met de svg). Bij beperkte
  beweging staan ze stil.
- **Scherp op 3x.** Het canvas stopte bij 2x, dus op de meeste telefoons van
  nu was elke punt zacht aan de rand. Nu tot 3x.

Bekeken en gehouden: de worp, de snelheid en maat van de rimpel, de ring per
tel op het aftellen, het vuurwerk, en het vlakke spelscherm.

### Een knop die glijdt, neemt zijn golf mee

Vier keer glijdt de gouden knop over de punten naar een nieuwe plek: van
Spelen op de titel, van Opnieuw op de eindstand en van `#cdBack` naar de
startknop van de overdracht (`rimpelDoor()`), en van die startknop naar de
schijf van het aftellen. Er was alleen de rimpel van de druk; onderweg en
bij aankomst deed de grond niets, alsof de knop boven het bord zweefde.

Bekeken in een live mock-up:

- **Een rimpel bij de landing.** Las als twee rimpels na elkaar, niet als
  één beweging. Afgewezen.
- **Een rasterschaduw** die met de knop meeschuift en bij aankomst sluit.
- **Een deuk die meeloopt**, met de knop ingedrukt tijdens de glijvlucht.
- **De golf meenemen.** Zolang de knop onderweg is, vertrekt er om de 34 ms
  een zwakke ring (0,28, tegen 1,2 voor de druk) vanaf zijn rand, waar hij
  op dat moment is. Voor de knop dringen de ringen samen, erachter waaieren
  ze uit, zoals de boeggolf van een bootje.

Max koos de golf (`golfMee()`), voorlopig. Bij beperkte beweging valt hij
weg, zoals elke rimpel. Wat in de lucht beweegt (sprongen, de vliegende
kaart, snippers) duwt de punten niet.

## Het titelscherm heeft twee dingen

Het merk en de knop. Vos en Uil stonden eerst klein naast de knop, op de
hoogte van zijn onderkant: drie losse dingen op een rij, met veel lege ruimte
boven en onder. Vergeleken zijn vier versies: zo, een waaier van drie
speelkaarten achter het merk, de mascottes bovenop het merk, en een rode en
een blauwe strook onderaan. De waaier vertelde het meest (plaatjes raden),
maar maakte het scherm vol; de stroken zetten de ploegkleur neer voor er
geloot is. Gekozen is de eenvoudigste: Vos en Uil zitten op de bovenrand van
het merk, als één logo, en daaronder alleen de knop.

Ze zijn kinderen van `.wordmark`, zodat ze meedraaien en meelanden, en staan
net boven de rand: hun inktlijn op de inkt van de plaat zou verdwijnen. Ze
zijn zo groot als een letter van de titel (`--gluur`), een beetje naar
binnen en elk een kant op gekanteld. Bij binnenkomst komen ze één na één van
achter de rand omhoog kijken (`gluurOp`); het stuk dat nog "achter" het merk
zit is weggeknipt, zodat ze uit de plaat lijken te komen in plaats van
eroverheen te schuiven.

**Ze mochten niet schokken.** Op een telefoon trilden ze een beetje, om drie
redenen. De knip schoof mee met de tekening: `clip-path` en `transform` in
één keyframe, maar alleen de transform loopt op de grafische kaart, dus de
rand liep een paar beelden achter. Nu staat de knip stil op het vak, en
schuift de tekening eronderdoor (`translate`). Ten tweede overschreef de
sprong bij aantikken (Web Animations op `transform`) de adem (een CSS-animatie
op dezelfde `transform`): bij het eind sprong de schaal van 1 terug naar
waar de adem net was, tot 6% in één beeld. Nu heeft elke beweging haar eigen
eigenschap: `rotate` de kanteling, `translate` het opkomen, `scale` de adem
(`gluurAdem`), en `transform` blijft voor `mascotte()`. Ten derde ademden ze
om hun onderkant, die onder de rand zit; dan schoof het stuk op de rand op
en neer. Alles draait nu om het punt waar de tekening de rand raakt (76%).

Aantikken is een hoge wip met het blije gezicht, geen juich: de salto werd
door de rand doorsneden, en wie achter een rand gluurt draait daar niet rond.
De knip is boven en opzij ruim, zodat een sprong nergens afknipt.

Ze zakken een kwart achter de rand (`--zak`) en blijven daar. Eerst stonden
ze er in rust bovenop, met hun onderkant net boven de plaat: dan gluurde er
niemand, en balanceerde de vos op de punt van zijn snuit, wat kleiner en
wankeler oogde dan de uil die op zijn ronde onderkant stond. Nu is de rand
van de plaat hun onderkant. De knip moet recht lopen, evenwijdig aan de
plaat; daarom kantelt alleen de tekening (`rotate` op de svg) en niet het
vak dat geknipt wordt, anders liep de knip schuin tegen de rand.

Het merk krijgt een marge bovenaan zo hoog als de mascottes, zodat de groep
als geheel in het midden staat en op 320x568 niet tegen het tandwiel komt.

### De doos komt gedrukt binnen, en de dieren spelen

Max vroeg om een beter titelscherm, en of de dieren ook een rimpel moeten
geven. Frame voor frame gefilmd naast een prototype in de echte app; hij koos
deze vier, binnen de regel van twee dingen.

- **Geen `screenIn`.** Bij openen en terug van de instellingen vervaagde de
  hele titel: de eerste beelden stonden de zwarte plaat en de gouden knop
  grijs en doorschijnend. Nu staat de doos er vanaf het eerste beeld, en
  schuiven merk en knop alleen op hun plek (`markIn`, `goIn`).
- **De punten op 11%.** Op 7% las de titel op armlengte als kaal beige, en
  gaf een tik op de grond een rimpel die je nauwelijks zag.
- **Ze antwoorden elkaar.** Wie Vos aantikt, laat hem wippen; 230 ms later
  wipt Uil kleiner terug, ook met een blij gezicht (en andersom).
- **Een getikte wip rimpelt.** Een rimpel betekent in deze app "er drukte
  iets op het bord". Een wip die een vinger begon, landt op de rand van het
  merk en drukt het bord in: `wipOpRand()` stuurt op de klets (265 ms, 78%
  van de wip) een rimpel vanaf onder de voeten, sterkte 0,7 voor de getikte
  en 0,45 voor het antwoord, kleiner dan een knop (1,2). Wat de dieren uit
  zichzelf doen -- opkomen, ademen, knipperen, juichen op de eindstand --
  rimpelt niet: dan ging de grond weer deinen, en die is er met opzet uit.

Niet gedaan: een derde ding (verder spelen, een ploegkeuze, tekst) en een
knop die uit zichzelf klopt. Alleen de vinger, de klok en de dieren laten
iets bewegen.

### Je vinger draait de zandloper

Max vroeg of een tik op het merk ook iets moet doen. De plaat was het enige
dode vlak op het scherm: een tik ernaast rimpelt de punten, een tik erop
deed niets, en voor een kind leest het grootste ding op het scherm dan als
kapot. Drie versies naast elkaar in een prototype: niets (zoals het was), de
zandloper draait om, en Vos en Uil wippen allebei. Gekozen is de zandloper.

- **De plaat blijft stil.** In deze app zegt een vlak dat onder je vinger
  inzakt "ik ben een knop", en de plaat is er geen. Alleen de zandloper erin
  beweegt.
- **De klok draait, en jij draait haar.** Alleen de vinger, de klok en de
  dieren laten iets bewegen; de zandloper is de klok. Ze draait al om de
  negen seconden uit zichzelf om; een tik doet die draai meteen, sneller en
  met vering (`draaiGlas()`, --t-groot, --e-los), en zet de wachttijd van de
  klok terug op nul, zodat er niet vlak daarna nog een draai volgt.
- **Vanaf waar ze staat.** Een tik midden in een draai, of in een vorige
  tik, draait verder vanaf die stand naar de volgende halve draai (minstens
  een kwart verder). De tik draait op `rotate`, de klok op `transform`, zodat
  ze elkaar niet overschrijven; het silhouet is puntsymmetrisch, dus na elke
  halve draai valt `rotate` weg zonder dat je iets ziet springen.
- **Geen rimpel en geen geluid.** Een rimpel betekent dat er iets op het bord
  drukte; de zandloper draait in de plaat en raakt de punten niet. Elke
  klank heeft al een betekenis.

Niet gedaan: de plaat laten inzakken (een knop die niets doet), het spel
laten starten (twee knoppen voor één ding, en een kind dat de telefoon
pakt start per ongeluk), de instellingen openen (die zijn voor de
volwassene, achter het tandwiel), en beide dieren laten wippen (dat doet een
tik op een dier al).

## Elke kaart draait om

Tussen twee beurten stond een harde knip: de gestempelde kaart bleef een
adem staan, en dan werd in één beeld het hele scherm verwisseld voor de
opdrachtkaart, die bijna op dezelfde plek ligt. Bij een rondewissel net zo,
en de eindstand kwam zelfs binnen via `screenIn` op leeg papier, zodat
alles even verbleekt stond. Frame voor frame gefilmd; Max koos deze versie.

Nu draait de kaart om. `draaiOm()` maakt de gestempelde kaart smal tot een
rand (`OMDRAAI`, 140 ms, `--e-weg`); `landOm()` laat op dezelfde plek de
achterkant breed worden (180 ms, `--e-uit`), vanaf de maat van de
speelkaart: de opdracht voor de volgende ploeg, de volgende ronde, of de
eindstand. Plat, zonder perspectief, zoals een kaart op tafel omgaan
eruitziet als je erboven hangt. De kleur stroomt intussen zoals ze deed.
Eén beweging voor alle drie de eindes, en de kaart waar het kind naar keek,
is de kaart die zegt wat er nu komt.

- Het spel wacht die eerste helft af: `turnEnd()` en `endRound()` doen hun
  werk in de terugroep van `draaiOm()`, en kijken daar opnieuw of het
  spelscherm er nog is. De staat verandert pas daarna, dus wie in die
  140 ms wegveegt, wordt bewaard zoals tijdens de adem.
- `#s-winner` heeft daarom geen `screenIn` meer en laat zijn grond stromen
  zoals de overdracht (`--wn-grond` eerst papier, twee beelden later de
  winnaar). Bij gelijkspel blijft het papier.
- Bij beperkte beweging gebeurt alles meteen.

## Pauze draait de kaart om

Het pauzepaneel lag als tweede vel papier midden op de kaart. Haar randen en
haar gouden band staken eromheen uit, en op 320 bij 568 vielen de twee bijna
samen, zodat het op een misdruk leek: drie randen waar er twee horen. Liggend
was het woord onder de tekening door de sluier van 82% nog te lezen, dus wie
pauzeerde kon spieken. Op het paneel stond een vierkante wijzerplaat, een
kleine kopie van de band die er pal achter lag, en twee pauzebalken naast
de pauzetegel die rechtsboven al staat. Drie versies in de echte app
gefotografeerd; Max koos deze.

Nu draait pauze de kaart om, met dezelfde twee helften als elk einde:
`draaiPauze()` maakt de kaart smal (`OMDRAAI`) en laat het paneel op
dezelfde plek breed worden (180 ms, `--e-uit`). Het paneel ligt op de
gemeten plek van de kaart (`legPaneel()`, `--kx/--ky/--kw/--kh`), met
dezelfde contour en schaduw, en zijn rand is een kopie van haar band: pad,
`viewBox`, streepjes en `data-time` worden overgenomen, dus ook de dikkere
band en het warme papier onder vijf tellen. Erop: de stand en de twee
deuren. Verder draait de kaart weer om (`kaartBoven()`): het paneel is
meteen weg, zoals altijd, en de kaart wordt op haar plek weer breed.

- **De maat komt uit de opmaak.** De kaart staat tijdens de pauze op
  `scaleX(0)`, dus `legPaneel()` neemt `offsetWidth`/`offsetHeight` en
  alleen het midden uit `getBoundingClientRect()`. Draaien met het paneel
  open legt het opnieuw (via `remeasure()`).
- **De haast gaat eraf.** `.cardslot.hurry` wiebelt de kaart in de laatste
  vijf tellen; onder een paneel dat precies op haar past, staken de hoeken
  dan om de beurt uit. `openPause()` haalt de klasse weg, `runClock()` zet
  hem bij verder terug.
- **Past het niet, dan een los paneel.** Liggend op 568 bij 320 is de kaart
  nog geen 60 px; dan meet `legPaneel()` overloop en valt terug op het
  paneel in het midden.
- **Op de overdracht draait de opdrachtkaart om** (`#hoRoundCard`), op
  Max' vraag om overal hetzelfde gedrag. Daar loopt geen klok, dus de
  achterkant heeft geen band (`#pauze.klok` staat alleen tijdens een beurt)
  en geen stand: die staat op de voorkant, en het paneel draagt alleen de
  twee deuren. De startknop blijft verborgen zolang het paneel openstaat,
  anders staan er twee gouden speeltekens.
- Bij beperkte beweging draait er niets; het paneel ligt er meteen.

## Vertrekken mag, als er niets achter wacht

De ladder in `index.html` zegt "geen vertrekanimaties", en de reden erbij is
scherper dan de regel: *"een uitloop houdt het volgende scherm tegen, en dat
wachten voel je in een spel dat je doorgeeft."* Lees die reden, niet alleen
de regel. Er zijn twee plekken waar geen volgend scherm staat te wachten, en
daar mag het dus wel.

`cdOut` was de eerste (nu `.countdown.open`, de schijf die opengaat, met
`cdOut` alleen nog bij beperkte beweging): de aftellaag lost op boven een kaart die al gedeeld
wordt, en `done()` draait meteen. De tweede is de pauzesluier. Het
spelscherm is nooit weggeweest -- het ligt eronder, met dezelfde kaart -- en
`closePause()` zet de klok meteen weer aan. Alleen de pixels blijven nog
0,18 s hangen. Zonder dat was hervatten de laatste harde knip in de app: één
beeld paneel, het volgende beeld kaart met een lopende klok, terwijl je nog
naar de knop keek die je net indrukte.

Drie dingen die daaraan vastzitten:

- **`hidden` gaat meteen aan.** `paused()` leest hem, en de klok, Escape en
  de tik naast het paneel hangen daaraan. De uitloop is daarom een klasse
  (`.uit`) die met een specifieker selector van
  `[hidden] { display: none !important }` wint, plus een `@media`-regel
  eronder die bij beperkte beweging weer `display: none` zet. Gemeten: 1,00
  - 0,95 - 0,81 - 0,62 - 0,39 - 0,12 en weg op 210 ms; bij beperkte beweging
  vanaf het eerste beeld weg.
- **`inert` pas ná het verzetten van de focus**, anders belandt de focus op
  de body in plaats van op de knop waar je vandaan kwam.
- **Alleen bij hervatten, niet bij stoppen.** De stopknop gaat naar de
  titel, die als cirkel over de sluier groeit (zie "Naar huis groeit uit de
  knop"). `openPause()` kapt een lopende uitloop af, anders gaat het paneel
  open in een sluier die nog aan het oplossen is.
- **Alleen de sluier vervaagt, het paneel niet.** De achtergrond stond op
  het overlay zelf, dus het paneel vervaagde mee en de kaart schemerde
  erdoor: de laatste doorkijk in de app. Nu is de sluier een eigen laag
  (`.overlay::before`); het paneel staat er bij openen meteen dekkend (en
  schaalt in), en is bij hervatten meteen weg.

De derde is de kopie van de kaart (`kaartSpook()`): de volgende kaart ligt
er vanaf het eerste beeld al onder. Die kopie blijft dekkend. Eerst vervaagde
ze terwijl ze bewoog, en dan lagen twee tekeningen over elkaar (een appel
door een paraplu, "APPEL" door "PARAPLU"); in slowmotion las het als vuil.
Bij goed vliegt ze versnellend naar de teller en lost pas op het laatste
derde op, als ze al klein is. Bij pas schuift ze ónder de stapel: ze wordt
vóór de randen in `.cardslot` gezet, dus achter de nieuwe kaart, en piept
nog even onder de onderrand uit. Een kopie die bóven de nieuwe kaart naar
beneden zakt, zei het omgekeerde van wat er gebeurt.

Terugnemen (`kaartTerug()`) is geraden achterstevoren: de kaart komt uit de
teller terug naar haar plek, en de kaart die er lag schuift onder de
stapel. Eerst werd ze opnieuw gedeeld zoals elke nieuwe kaart, en dan zag
je niet dat dít de kaart was die je net had weggegeven.

Twee meer, om dezelfde reden. De eerste helft van het omdraaien
(`draaiOm()`): het spel wacht die 140 ms af, maar er staat geen scherm te
wachten, alleen de achterkant van dezelfde kaart. En het scherm dat je
verlaat als je naar huis gaat (`naarTitel()`): het blijft liggen terwijl de
titel eroverheen groeit, en is weg als de cirkel rond is.

Wat er níet bij komt: een aftelling bij hervatten. Die is geopperd -- de
klok begint immers op de tik -- maar het aftellen bestaat om een strijkende
vinger tijdens het doorgeven op te vangen, en bij hervatten gaat het toestel
niet van hand. Je hebt het paneel zelf opengedaan en de stilstaande
band staat op de achterkant van de kaart; je weet waar je staat.

## Eén pen voor tekening en mascotte

Vos en Uil zijn vlakke kleur in een dikke inktlijn, zoals een sticker of een
zeefdruk, en de rest van de app is met dezelfde pen getekend: de kaartrand,
de tegels, de knoppen. Het teken op de kaart kwam van ergens anders: de
emoji van het toestel, met verloop, glans en schaduw en zonder lijn. Op het
spelscherm is dat het grootste ding in beeld, dus het zette de toon.

Daarom krijgt het teken de inktlijn, als contour om zijn silhouet. Vier
schaduwen zonder vervaging, elk één kant op, na elkaar: samen een gesloten
lijn. 4 px, de dikte van de kaartrand; op de kleine plaatjes van `#kijk`
2 px. Over alle 275 kaarten bekeken op Noto: de tekening blijft zichzelf,
alleen zachte gloed (de kaarsjes op de taart, de straal van de douche) wordt
een donkere vlek, en losse sterretjes krijgen elk een eigen randje. Dat is
klein genoeg om te laten.

Een SVG-filter met `feMorphology` gaf hetzelfde beeld, maar `filter: url()`
op HTML is in Safari niet te vertrouwen; de schaduwen werken overal.

**Niet vlakker maken.** Een filter dat de emoji tot een paar tinten
terugbrengt, maakt ze echt vlak als de mascottes, maar gezichten worden
modder en elke emoji-set breekt anders. Dezelfde les als bij de
manifest-screenshots (zie "App-pictogram en installeerbaarheid"). Zelf 275
kaarten tekenen is het meest consequent en kost een veelvoud aan bytes.

**De lijn van de mascotte.** Die stond als 5 van de 100 in het symbool,
dus hij schaalde mee: 4 px op de titel, 2,4 px in de balk, 1,3 px voor de
kleine Vos in de stand op de overdracht, een haarlijn op een kaart met een
rand van 4 px. De kleine tekens hadden hetzelfde: de rondetekens op de
eindstand (16 px, 1,1 px lijn) en het kaartenteken op de overdracht (18 px,
1,6 px) lazen als grijs potlood naast gedrukte inkt.

Nu zet `penLijn()` met een `ResizeObserver` op elke svg `--pen`: hoeveel
eenheden 2,3 px op het scherm zijn. Elke lijn in die symbolen neemt het
grootste van haar eigen dikte en `--pen`, met een plafond zodat een kleine
kop niet dichtloopt: `max(5px, min(var(--pen, 0px), 10px))` voor de
mascottes, 7 en 12 voor de rondetekens, 9 en 14 voor `#i-kaarten`. Op de
titel en de grote schijf verandert er dus niets. Een waarnemer omdat de
maat aan schermstand en scherm hangt, en een verborgen scherm nul meet.
Vaste svg's in de opmaak worden bij het opstarten aangemeld, de rest via
`svgUse()`.

Op de eindstand stonden de drie rondes bovendien op 55%: dat vervagen zegt
"dit is niet de ronde van nu", en na het laatste potje is geen ronde meer
nu. Daar staan ze in volle inkt.

## Beloning

De momenten die een kind onthoudt -- een kaart geraden, de bel, de stapel
leeg, de winnaar -- kregen alleen geluid. Nu reageren ook de mascottes, met
Web Animations en overgeslagen bij beperkte beweging: `mascotte(el, soort)`
laat ze wippen (elke geraden kaart, hoger in een reeks), juichen (stapel
leeg, aantikken op de titel) of schrikken (tijd om).

Bij juichen en schrikken wisselt ook het gezicht: elk dier heeft een blije
(ogen als boogjes) en een geschrokken versie (`#m-vos-blij`,
`#m-uil-schrik`, ...). De kop staat één keer getekend (`#m-vos-kop`,
`#m-uil-kop`); de varianten tekenen alleen andere ogen erop. Het gezicht
gaat terug zodra de beweging uit is, en zonder beweging wisselt het niet:
een gezicht zonder sprong eromheen leest als een fout. Op de eindstand lacht
wie won, de hele tijd.

**Rek en klets.** De sprongen waren een stijve verschuiving met een gelijke
schaal. Nu rekt de mascotte uit bij het opspringen en wordt ze plat bij de
landing, zoals een stuiterbal, en draait ze bij juichen één keer rond in de
lucht (om haar midden, niet om haar voeten). Dat is het verschil tussen een
plaatje dat beweegt en een dier dat springt. Rek en klets gebeuren wel op de
voeten: plat drukken om het midden tilde de voeten bij de landing van de
grond, en dan zweefde ze net als ze moest neerkomen. Daarom schuift juich bij
elke vorm zoveel omlaag als de voeten opkomen.

**Knipperen en glans.** Elke mascotte in beeld met het gewone gezicht doet om
de drie à zes tellen even haar ogen dicht (`#m-vos-dicht`, `#m-uil-dicht`),
elk op een eigen moment en soms twee keer kort. De ogen kregen een klein
papieren glansje. Allebei kosten ze bijna niets en maken ze van een teken een
figuurtje dat kijkt. Een blij of geschrokken gezicht laat het knipperen met
rust.

**Nee bij overslaan.** Overslaan deed niets met de mascotte. Nu schudt ze kort
nee met de ogen dicht: klein, want overslaan is geen fout. Een sip gezicht
voor wie verliest is bekeken en weggelaten: aan het eind van een potje met
kleuters juicht iedereen mee.

De oorpluimen van de uil liggen achter de kop, niet erop: getekend over de
cirkel liep er een zwarte lijn door zijn hoofd waar elke pluim begon.

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

**De stand ligt op papier.** Elk scherm tussen twee beurten is nu
hetzelfde: een papieren kaart op de grond, de gouden knop eronder. De
overdracht had dat al, de pauze ook; de eindstand stond als enige los op de
stralen, met de cijfers rechtstreeks op de ploegkleur -- tegen de harde eis.
Nu staat ze op `.wn-kaart`, even breed als de opdrachtkaart, met bovenaan
ruimte voor de kroon zodat die binnen de rand valt. De stralen en de confetti
blijven de grond.

**De grond is de ploegkleur van wie won.** De stralen waren een tint van 16%
van die kleur op papier: roze voor Vos, grijsblauw voor Uil. Dat waren de
enige kleuren in de app buiten het palet, en de winst las als een vale
kleur in plaats van als de ploeg. Nu krijgt het scherm dezelfde grond als de
overdracht van die ploeg: de volle ploegkleur met het stipveld (`#wnVeld`),
met de stralen in de punten (zie "Rastertoon, afgewerkt"). De stand blijft
op papier, dus er komt geen tekst op de ploegkleur. De confetti is papier en
goud, want snippers in de ploegkleur verdwijnen in de grond. Bij gelijkspel
is er geen ploeg: papier met inkten punten, zoals de titel.

Let op de klassenaam als je hier ooit tóch iets bijtekent: `.bar` bestond
al -- dat is de streep door de pas-knop als de stapel op is. Een tweede
`.bar` erbij zette meteen `display: flex` en een rand op dat SVG-pad. Grep
even voor je een korte naam pakt.

## Eén label voor "wat er bij komt", en nog maar één plek

Wat je tijdens een beurt verzamelt is een groen `+N` (`.gain`), als tweede
vak van de mascotte-tegel in de balk (zie "De balk heeft drie stukken"). Het waren ooit twee dingen --
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

Bij een goede tik vliegt de kaart zelf van haar plek naar de teller. Er
was niets dat díe kaart met díe teller verbond: twee gebeurtenissen op twee
plekken, alleen gelijktijdig — de kaart verdween en ergens ver linksboven
sprong een getal, en het kind moest zelf bedenken dat het ene het andere
veroorzaakte.

Eerst vlogen er twee dingen: de kaart (versnellend, `--e-weg`, krimpend tot
10%) en een groen `+1` in de huid van de teller (`--e-vloei`, van 1,9 naar
1), naar hetzelfde doel, even lang. Ze zeiden twee keer hetzelfde op twee
curves, en het label begon groot bovenop de tekening, net op het moment dat
de volgende kaart eronder verscheen. Uit een mock-up met beide, alleen de
kaart en alleen het label, koos Max alleen de kaart:

- **De kaart is wat je wint.** Een vliegend `+1` alleen zegt het getal maar
  niet wélke kaart het opleverde; de kaart zegt allebei, want het vak telt
  kaarten.
- **Terugnemen is het spiegelbeeld.** `kaartTerug()` haalde al alleen de
  kaart uit het vak terug, zonder `-1`. Raden en terugnemen zijn nu
  dezelfde vlucht, heen en terug.
- **Ze krimpt tot de hoogte van het vak**, niet tot 10%, en blijft dekkend
  tot 80% van de vlucht: ze lijkt het vak in te schuiven in plaats van
  ervoor te vervagen.

Drie dingen die daarbij vastzitten:

- **Het getal én de wip horen bij het aankomen**, niet bij het aantikken:
  de kaart komt het getal brengen. Bij de tik springen schuift de teller
  230 ms vóór de landing omhoog, en op de eerste kaart stonden er dan twee
  dingen voor één punt in beeld. Beide gebeuren in `landFly()`, aan het
  einde van de vlucht van de kopie (`vliegKaart()` hangt hem aan de
  animatie die `kaartSpook()` teruggeeft). Wat de meting nodig had staat
  apart: `meetTurnScore()` schildert vooruit, meet, en zet meteen terug. De
  volgorde bij aankomst is schilderen dan wippen, want `popTurnScore()` slaat
  een verborgen label over. Op de laatste kaart wacht `endRound()` op
  dezelfde landing.
- **Web Animations, geen CSS-animatie**, om dezelfde reden als
  `holdButton()`: bij `prefers-reduced-motion` ligt er een
  `animation: none !important` over alles heen, en dan zou de landing — en
  dus de wip — nooit afgaan. Bij beperkte beweging maakt `kaartSpook()` geen
  kopie, en zonder vlucht staat het getal meteen.
- **Een vlucht die nog loopt als het scherm wisselt, landt alsnog**
  (`landFly()` in `show()`): hij breekt de animatie af, en afbreken ruimt
  de kopie op. De kopie hangt aan de `body` en niet aan het spelscherm, want
  een transform op een voorouder laat een `position: fixed` nakomeling tegen
  dát vlak rekenen in plaats van tegen het venster; zonder de landing bleef
  ze over het overdrachtscherm heen vliegen.

Hetzelfde stijgt hoorbaar mee: `Snd.goed(i)` gaat een halve toon omhoog per
geraden kaart van deze beurt, tot zeven. Een reeks klinkt dan als klimmen,
ook voor het kind dat staat uit te beelden en niet naar het scherm kijkt. Na
zeven stopt het: een kwint hoger is nog vrolijk, een octaaf hoger is schel,
en een goede ploeg haalt er twaalf.

## De balk heeft drie stukken

Met de ploegkleur als grond kreeg alles in de balk een papieren tegel, en
toen stonden er vier losse vakjes van verschillende maat naast elkaar: de
mascotte op 68 px, de ronde en pauze op 48, de seconden ertussen, en het
`+N` los tussen mascotte en ronde. Uit vijf mock-ups (zonder seconden, vier
gelijke tegels, de ronde als hoekteken op de kaart, ronde en seconden op één
plaatje, en deze) koos Max de indeling naar betekenis:

| Stuk       | Zegt                         | Werkt op      |
|------------|------------------------------|---------------|
| mascotte   | wie er speelt                | de ploeg      |
| `+N`       | wat die ploeg binnenhaalde   | de ploeg      |
| rondeteken | hoe je mag uitleggen         | wie uitlegt   |
| seconden   | hoe lang nog                 | de klok       |
| pauze      | zet de klok stil             | de klok       |

Dat geeft drie stukken, links naar rechts in de volgorde waarin je ze leest:
**wie** (`.who`: mascotte, inktlijn, groen vak), **hoe** (het rondeteken,
alleen) en **de klok** (`.klokknop`: seconden, inktlijn, pauzeteken). De
seconden staan dus in de knop die de klok stilzet, niet bij de ronde: lezen
en stilzetten gaan over dezelfde klok.

- **Twee vakken, één stuk.** De buit was een sticker op de hoek van de
  mascotte-tegel, en dat was het enige stuk in de app dat over een ander lag:
  het dekte de kin van de vos af en gaf de tegel een trapje in het silhouet.
  Nu is het het tweede vak van dezelfde tegel, net als de seconden in de
  klokknop. Het pijltje voor terugnemen staat achter het getal en de lont
  loopt in inkt langs de onderrand van het groen: in donkergroen op de
  ploegkleur verdween ze.
- **Het vak gaat open bij de eerste geraden kaart.** Een `+0` vanaf het
  begin is overwogen, zodat de tegel nooit van breedte verandert, maar dat
  is een getal zonder nieuws op een plek waar het kind kijkt. De wip van de
  landing (`gainPop`, vanaf de linkerrand) is nu het opengaan van het vak.
- **De buit aan het eind groeit als hele tegel** (`buit` op `.who`, vanuit
  de linkerbovenhoek). Groeide alleen het groene vak, dan stak het boven en
  onder uit zijn tegel.
- **Het aftellen ligt eronder.** `.cd-team` krijgt de gemeten rechthoek van
  `.who` (waar de buit dan op nul staat), `.cd-round` die van het
  rondeteken, en `#cdBack` staat op de hoek waar het pauzeteken van de
  klokknop uitkomt. Als de schijf opengaat blijft alles liggen; alleen de
  seconden verschijnen.
- **Alleen de klokknop heeft lift**, dus alleen hij leest als knop. Het
  cijfer houdt zijn vaste vak (`--digit-w`), zodat de knop niet versmalt als
  10 naar 9 gaat.
- **Op 320 px** past het breedste geval (`+12` met pijltje) niet naast een
  rondeteken dat precies in het midden staat. Daar verdeelt `flex` de ruimte
  gelijk en schuift het rondeteken een paar pixels als het vak opengaat.
- Liggend krimpen de tegels niet meer tot 40 px: de klokknop is een knop en
  houdt `--tap`, en de andere twee horen even hoog te zijn.

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

## Geluid en trilling

**Gemeten, niet gehoord.** Elke cue is weergegeven uit het echte `Snd`-blok in
Chromium met een `OfflineAudioContext`, na de opwarmtoon van `unlock()`, met
de piek en het luidste RMS-venster van 20 ms. Een telefoonluidspreker is
nagebootst met een hoogdoorlaat van 600 Hz, 24 dB per octaaf. Dat is een
model, geen luidspreker: de getallen zeggen hoe cues zich tot elkaar
verhouden, niet hoe luid het in de kamer is.

**Overslaan en weigeren vielen weg op een telefoon.** Het waren sinussen van
200 en 220 Hz. Over het volle bereik even luid als "goed", in het
telefoonmodel 32 en 25 dB zachter: op een telefoon was overslaan stil. Nu
zijn het triangles rond 500 Hz, nog steeds lager en doffer dan `goed()`, en
in het model 7 en 9 dB eronder.

**Luider.** Met de bus op .9 piekte de luidste cue (fanfare, timeUp) op
-11,7 dBFS en zat "goed" rond -22 dBFS RMS. Op 1.6 piekt het zwaarste
stapelen (fanfare met de optel-tikken eronder) op -4,7 dBFS.

**De stilteschakelaar van een iPhone.** Web Audio volgt hem standaard, en
`navigator.vibrate` bestaat op iOS niet: met de schakelaar op stil eindigde
een beurt alleen op het scherm. `navigator.audioSession.type = "playback"`
(Safari 16.4 en later) laat het geluid door; de app heeft zelf een aan/uit.
De prijs: muziek die op hetzelfde toestel speelt, stopt. Safari zet de
context ook op `"interrupted"` na een telefoongesprek; `ac()` hervat bij
elke stand behalve `"running"` en `"closed"`.

**De ploeg klinkt.** Kleur en vorm zeiden al wie er aan zet is, het geluid
niet, en de worp landde stil. Vos is helder en vlug (twee korte noten
omhoog), Uil rond en laag (een kleine terts omlaag). Drie plekken: de worp
landt, de overdracht opent (na de buit, met de mascotte die opkomt), en na de
fanfare voor wie won, bij gelijkspel allebei. Niet in `handoff()`: dat opent
ook na een afgebroken aftelling en na herladen, waar niets nieuws te melden
is, en bij herladen is er nog geen aanraking geweest die geluid toelaat.

**De ronde klinkt.** Een rondewissel verandert de regels, maar opende stil na
`leeg()`. Nu zoveel klokjes als het rondenummer, samen met de tekening die
opkomt, en daarna de ploeg die de ronde opent.

**Hervatten en stoppen.** Hervatten met meer dan tien seconden over was stil:
de tik op `lastTickAt = 0` valt pas in de laatste tien. Nu `verder()`, het
startsein 6 dB zachter, met `Tril.go()`. Stoppen voltooid had alleen een
trilling, en op iOS dus niets; nu `dicht()`, één lage noot die valt.

**Trilling.** Pulsen van 8 tot 12 ms voelde je op een oudere trilmotor niet:
die heeft zo'n 20 ms nodig om aan te lopen. Twintig is de ondergrens; `pas`
is 40, zodat hij naast `tik` een eigen gewicht houdt, en de dubbele tik is
trager dan de weigering (`[20, 110, 20]` tegen `[20, 40, 20]`). De trilling
voor een lege stapel komt ook in de laatste ronde: wie het toestel
vasthoudt, voelt het, en de fanfare heeft er geen last van. Het feestritme
valt niet meer weg bij beperkte beweging: trillen is geen beweging op het
scherm, en er is een eigen aan/uit voor. Het ritme loopt gelijk met het
vuurwerk: een puls van 40 ms op elk van de vier uitbarstingen (0, 130, 260,
390 ms, de noten van de fanfare) en een van 120 ms op de slotring (550 ms).
Eerder was het in 0,3 s voorbij, terwijl het feest tot 0,55 s doorliep.

**Een rimpel trilt niet.** Een trilling hoort bij een gebeurtenis, niet bij
het beeld van een druk. Waar een rimpel een gebeurtenis draagt, trilt die al,
op hetzelfde moment: elke tel van het aftellen (`Tril.tel()` met
`telGolf()`), de schijf die opengaat (`Tril.go()`), het vuurwerk
(`Tril.feest()`). De rest is spel: een tik op de grond, de landing van een
dier op de titel, de golf achter een glijdende knop. Kinderen tikken daar
twintig keer achter elkaar, en trillen kent alleen duur en ritme, met 20 ms
als ondergrens; elke extra trilling maakt `tik` en `tel` minder te
onderscheiden.

**Geen muziek.** De raders moeten de uitbeelder horen, en de klok bouwt de
spanning al op in de laatste tien seconden.

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
ruim 250, voor een overgang die op geen enkele weergavemaat te zien is (een
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
232 kB. Voor één plaat, op een bestand van ruim 250 kB. De twee die
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
moet kunnen, voor iets wat de eerstvolgende koude start vanzelf oplost.

"Eén opstartbeurt" bleek op Android lang te duren: een geïnstalleerde app
wordt uit de recente apps hervat, niet opnieuw gestart, soms dagen achter
elkaar. Een gemergede fix kwam dan pas aan na het wegvegen van de app. Daarom
stuurt de worker een stil seintje (`meldNieuw()`) als hij een andere versie
in de kast zet dan er stond, en herlaadt de pagina zichzelf op het enige
moment dat niets kost: ze raakt verborgen, staat op de titel, en er is geen
bewaard potje. Een herlaadbeurt in beeld blijft afvallen, want die speelt de
zandloper zichtbaar opnieuw af; uit beeld ziet niemand hem. Nagemeten in
Chromium met een tweede versie op de server: de verborgen titel herlaadt naar
de nieuwe versie, een pagina met een lopend potje niet. Op een echt toestel
nog niet bekeken.

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

### Het veld staat in Deze telefoon

Het stond bovenaan, als eerste blok onder de titel, met een eigen marge van
48 om het van de regeluitleg los te maken -- "een eenmalige handeling is
geen instelling". De reden om het daar te zetten was dat vooraan het moment
is dat het er het meest toe doet: de eerste keer dat dit scherm opengaat.
Dat klopt voor die ene keer en voor niets daarna, en de vorige alinea zegt
waarom dat uitmaakt -- op de twee gewone huishoudens staat dit blok er élke
avond.

Wie het tandwiel aantikt komt de moeilijkheid of de tijd bijstellen, of een
kaart wegleggen. Installeren is nooit de boodschap en delen al helemaal
niet. Het staat in `DEZE TELEFOON`, onder Geluid en Trilling (zie "Het
instellingenscherm").

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

- **Verberg het veld, niet de groep.** In de stand `weg` staat hier niets,
  en `toonInstall()` verbergt dan `#installField`. De kop blijft, want
  Geluid staat er altijd. (Dat `hidden` het wint van `display: flex` komt
  door de `[hidden] { display: none !important }` bovenaan het bestand --
  de regel die er staat omdat deze val hier al drie keer eerder toesloeg.)
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

## Een nieuwe ronde opent de andere ploeg

De resterende tijd ging bij een lege stapel mee naar dezelfde ploeg, zoals in
het bordspel. Aan een tafel met kleine kinderen pakte dat slecht uit: wie de
stapel leeg speelde, opende ook de volgende ronde, en in een gespeeld potje op
de telefoon begon Vos alle drie de rondes en won met 43 tegen 5, terwijl Uil
één korte beurt had. Stilzitten is voor een kind van vijf de snelste manier
om af te haken.

Nu draait `Spel.rondeEinde()` de ploeg om en geeft een volle beurt; de rest
van de tijd vervalt. Dat haalt ook `MIN_CARRY` weg, de ondergrens van drie
tellen voor een beurt die anders na het aftellen al om was. De overdracht
toont bij elke wissel dezelfde volle seconden.

## Een geraden kaart kun je terugnemen

Met een kleuter aan het toestel is een te vroege tik op "goed" de meest
gemaakte fout, en de volwassene kon hem alleen wegwuiven. `Spel.terug()`
haalt het laatste punt eraf en legt de kaart weer in beeld; de kaart die er
lag gaat bovenop de stapel. Eén stap, niet meer (`G.vorige`), en niet na tijd
om, een lege stapel of een nieuwe beurt.

Geen eigen knop en geen tekst: je tikt op het groene `+N` in de balk, het
label dat het punt kreeg neemt het ook weer af. Dát het kan, en hoe lang nog,
staat eronder: een pijltje dat omkeert met een lont die in `TERUG_MS`
opbrandt (`.kan-terug`). Zonder dat wist alleen wie de regels had gelezen
dat het label een knop was. Eronder en niet ernaast: op 320 px breed staat
"+10" al op 2 px van het rondetegeltje. De tikzone is groter dan het
label (`::after`). Het venster is `TERUG_MS` (3 s) na de laatste tik op goed,
zodat een ploeg aan het eind van haar beurt geen buit kan terugdraaien; hoe
lang beslist het hoofdscript, niet de spelkern. Uitgelegd staat het alleen
in de regels op het instellingenscherm, voor de volwassene.

## Terugkijken naar de kaarten

Ronde 2 en 3 werken alleen als je de kaarten van ronde 1 nog weet, en kleine
kinderen vergeten de helft. Vanaf ronde 2 is de kaartenteller op de
overdracht (`#hoCards`) daarom een knop: een tegeltje met lift, dat de
kaarten die nog liggen als plaatjes toont (`#kijk`), met het woord eronder
zoals op de kaart. Een tik waar dan ook sluit het weer, net als Escape en de
terugveeg.

- **Op alfabet, niet in stapelvolgorde.** De stapel is geschud; zijn
  volgorde tonen zou verklappen wat er komt.
- **Niet in ronde 1.** Dan heeft niemand de kaarten nog gezien, en is
  kijken spieken. De knop staat er dan uit (`disabled`) en ziet eruit als
  het gewone getal.
- **Geen kaders om de plaatjes.** Het zijn geen knoppen; met een rand om
  elk plaatje kwamen er tientallen rechthoeken op één paneel.

## Het instellingenscherm

Wie het tandwiel aantikt komt iets bijstellen voor het volgende potje. Vier
groepen, elk één vraag:

- **Potje**: hoe één potje gedeeld wordt. Kaarten (met de strook), Waarvan
  eigen, Tijd per beurt.
- **Kaarten**: welke kaarten er bestaan. Moeilijkheid, met de kaartenbak
  (Gewone, Eigen) eronder.
- **Deze telefoon**: Geluid, Trilling, installeren.
- **Zo speel je**.

**Bak of potje.** Alles stond eerst onder één kop, Spel, en daarna als
Kaarten boven Potje. De toets die het oploste: verandert een veld wat er in
de bak zit, of wat er in het potje van vanavond komt? Moeilijkheid filtert
de bak (het plafond van de gewone kaarten), dus staat ze boven de stapel die
ze verandert: tik Medium en Gewone wordt 183. "Waarvan eigen" haalt
geen kaart weg en legt er geen bij; het is de menging van de greep, net als
24 kaarten, en staat onder de strook die ze tekent. Potje gaat voor: het
heeft een vaste hoogte, en de lange laden van de bak liggen zo onderaan en
duwen alleen Deze telefoon weg. Moeilijkheid staat op 390x844 nog in het
eerste scherm.

Ook gewogen: Moeilijkheid in de lade van Gewone, met het niveau op de
stapel. Logisch, maar een keuze die per avond verandert (wie speelt er mee)
moet één tik zijn en als keuze te zien; achter een stapel leest "Gewone 90"
als een telling, en elke wissel rolt 90 tot 275 kaarten uit. Waarvan eigen
in de eigen lade: dan toont de strook een menging die je daar niet kunt
veranderen.

**Drie regels minder.** De telling van het potje staat op de regel van
"Kaarten" in plaats van eronder. De bak heeft geen eigen veldnaam:
de groepskop zegt Kaarten en de stapels noemen zichzelf. Geluid en Trilling
zijn twee schakelaars op één rij (`role="switch"`, goud met een vinkje is
aan) in plaats van twee regels met Aan en Uit; Installeren staat eronder als
gewone knop, en alleen als er iets te installeren is. Voorkeuren en Deze app
waren allebei over het toestel en stonden aan weerskanten van de regels.

**Elk woord zegt iets nieuws.** "Kaarten" stond vier keer op het scherm, en
onder de kop POTJE herhaalde "Kaarten per potje" de kop. Nu: Kaarten,
Waarvan eigen, Tijd per beurt. "Waarvan eigen" hangt de tweede rij getallen
aan de eerste; als "Eigen kaarten erin" las 0 3 6 12 onder 16 24 32 als een
tweede maat. Geluid en Trilling dragen een teken (luidspreker, trillende
telefoon) en verbleken als ze uit staan: twee gouden knoppen naast elkaar
zijn op dit scherm wat "deze is gekozen" eruitziet, en dan las de rij als
een keuze tussen de twee. De strook is één dunne rij van 26 px in plaats van
twee rijen kaartjes (zo'n 80 px): ze toont de menging, niet wie erop staat.
Gewone kaartjes zijn vlak en licht, zonder inktrand; een leeg vakje met een
zwarte rand las als iets om in te vullen. Op 390x844 staan Potje,
Moeilijkheid en beide stapels zo in het eerste scherm.

Eerder stonden de regels bovenaan, open bij het eerste bezoek, en waren de
spelknoppen verdeeld over "Welke kaarten" en "Hoe lang". Die grens ("wat
verandert de knop") was juist, maar las als twee keer hetzelfde: allebei
bepalen ze hoe het volgende potje loopt. Op 390x844 met de regels open stond
de eerste keuzeknop op 49% van het scherm; nu, open of dicht, op 22% en staan daar
alle drie de spelknoppen in het eerste scherm.

De regels blijven open tot het eerste gestarte spel: de oppas die ze nooit
zag vindt ze onder de knoppen, met een groepskop die openklapt. De vouwregel
ís die kop (zelfde maat als `.group-head`, met de plus ervoor);
een kop plus een vouwregel eronder zou twee keer hetzelfde zeggen.

**Drie lagen tekst, niet vier.** Titel, groepskop, veldnaam en vouwregel
stonden alle vier in vette hoofdletters met spatiëring, alleen in maat
verschillend; het oog vond geen orde. Nu zijn alleen de titel en de
groepskoppen in hoofdletters. Veldnamen, de vouwregel van de bak en de
keuzeknoppen zijn zin-tekst in inkt, 16 px. Dat haalde ook een fout weg: op
320 px sprong "MOEILIJK" naar een eigen regel; in zin-tekst en met gelijke
delen (`flex: 1 1 0`) passen er drie naast elkaar.

**Aan/uit weegt minder dan een keuze.** Geluid en trilling waren twee rijen
volle-breedte knoppen, zwaarder dan de moeilijkheid. Nu is elk één regel
(`.field.rij`): de naam links, twee knoppen van 76 px rechts. De `legend`
zweeft (`float: left`), anders tekent de browser hem als randonderschrift en
lukt de flex-regel niet.

**Minder is meer: geen uitleg onder een knop die zichzelf uitlegt.** Onder
moeilijkheid, kaarten per potje en tijd stond elk een zin ("Elke stand bevat
ook alle kaarten van de standen eronder", "Elk potje trekt pas bij de start
24 nieuwe kaarten uit die 90", "30 seconden werkt goed voor de meeste
groepen"). Ze zijn weg, net als "Kort/Normaal/Lang" onder 16, 24 en 32: het
getal zegt het al, en de telling van de bak loopt zichtbaar op als je een
stand hoger kiest. Wat bleef: de leeftijd onder de moeilijkheid (die zegt
iets wat het woord niet zegt) en de zin in de bak over wegleggen (die zie je
pas als je hem openklapt). De regels zijn drie zinnen korter.

**Geen strepen onder de koppen.** Onder de titel, onder elke groepskop en
onder de vouwregel van de regels stond een streep: vier strepen voor vier
groepen, waarvan de eerste twee vlak boven elkaar ("INSTELLINGEN", dan
"SPEL"). Een kop in hoofdletters met lucht erboven scheidt al; de streep
zei het een tweede keer. De plakkende titelband houdt zijn streep alleen
zodra er iets onder schuift (`.geschoven`, een schaduw zodat er niets
verspringt): dan scheidt hij wel iets.

**Hiërarchie door maat en kleur, niet door strepen.** Groepskop, veldnaam
en de vouwregel van de bak stonden alle drie op 16 px in inkt; alleen de
hoofdletters scheidden een kop van een veld. Nu:

- groepskoppen (en de vouwregel van de regels) zijn klein, 14 px, in
  hoofdletters en in `--ink-2`: een etiket boven de groep, niet een regel die
  met de velden wedijvert;
- veldnamen blijven 16 px in inkt, het luidste na de titel;
- keuzeknoppen dragen `--line-2` (3 px) in plaats van de primaire contour,
  en zijn 52 px hoog: op dit scherm is geen enkele knop de hoofdhandeling;
- de tijd is een rij van vier keuzeknoppen (20, 30, 45, 60 s), net als
  kaarten per potje (zie hieronder);
- ritme: 24 px tussen velden, 40 tussen groepen. Op 390x844 is het scherm 1013 px hoog (was 1228 vanochtend). Het scherm werd
op 390x844 151 px korter (1228 naar 1077).

**Drie keer dezelfde knop.** De tijd per beurt was een schuif van 20 tot 60
in stappen van 5: het enige op dit scherm dat geen tegel was, met een ronde
gouden duim op een scherm zonder hoofdhandeling, en een slepende vinger met
negen standen waar elke andere keuze één tik is. De lege strook onder de baan
zette Voorkeuren ook 64 px verder in plaats van de 48 tussen de andere
groepen. Nu zijn het vier knoppen (`TIJDEN`: 20, 30, 45, 60), dezelfde als
kaarten per potje: goud met een vinkje is gekozen, zoals overal. Een bewaarde
waarde ertussenin gaat in `load()` naar de dichtstbijzijnde knop (35 wordt
30, 50 wordt 45).

**Eén vet in de systeemletter.** Veldnamen, keuzeknoppen en de vouwregel
van de bak stonden op 800, de vette woorden in de regels op 700. 800 is op een iPhone SF
Heavy, maar Roboto had vóór Android 12 geen 800, en dan valt de browser door
naar Black (900): dezelfde veldnaam was per toestel anders zwaar, en altijd
zwaarder dan het vet in de regels. Alles staat nu op 700, die elk toestel
heeft. De uitlegzinnen (`.hint`, `.handmatig`) gingen van 13 naar 14 px
(`--fs-2`), de maat van de regeltekst eronder; 13 stond als enige op dit
scherm buiten de trap.

## Eén letter voor cijfers en koppen

De app tekende alles in de systeemletter: SF Pro op een iPhone, Roboto op
Android. Net de grootste dingen op het scherm, de klok en de totalen, zagen
er daardoor op elk toestel anders uit, en nergens leek het op de ronde,
dikke lijn van de mascottes. Vijf kandidaten zijn naast elkaar gezet op
dezelfde stukjes app (woordmerk, stand, aftelschijf, rondenaam, labels,
kaartwoord): de systeemletter, Fredoka, Rubik, Baloo 2 en Lilita One.
Fredoka won: de 1 en de 7 verschillen ook voor een kleuter duidelijk, de
ronde vormen passen bij de uil en de inktranden, en hij blijft rustig in
lange woorden zoals OMSCHRIJVEN. Baloo 2 had een te hoge regel voor
cijfers in een vak, Lilita One maar één dikte.

**Waar hij staat.** Op wat je in één blik ziet: cijfers, koppen, het woord
op de kaart, de rondenaam en knoppen in hoofdletters. Ook de getallen in een
keuzeknop (`.chips.getal`: kaarten per potje en tijd per beurt), zodat 16,
24 en 32 dezelfde letter hebben als elk ander getal in de app. Eén selectorlijst
direct na `:root`, zodat je ziet wat erin zit. Niet op zin-tekst voor de
volwassene (veldnamen, keuzeknoppen, uitleg): die leest beter in de letter
van het toestel, en zou anders met de koppen wedijveren.

**Hoe hij erin zit.** Als base64 in een `@font-face`, net als de
pictogrammen: geen extern bestand, werkt met de wifi uit. `tools/letter.py`
maakt hem uit `@fontsource-variable/fredoka`:

- vast op 700, één stand van 14 KB; de variabele as zou het dubbele zijn
  en de app gebruikt één dikte. De `@font-face` meldt `600 900`, zodat een
  regel met `font-weight: 900` hem pakt zonder namaak-vet;
- alleen Latijn (ASCII, Latin-1, een paar leestekens);
- cijfers allemaal even breed, het glyph gecentreerd in het bredere vak.
  Fredoka heeft geen `tnum`, dus `font-variant-numeric: tabular-nums` deed
  niets: de klok sprong bij elke tel en de eindstand bij het optellen. De
  1 is van zichzelf twee derde zo breed als de 0;
- deterministisch: de tijdstempel van de bron blijft staan.

`font-display: block`: de letter zit in de pagina zelf, er valt niets te
wachten, en zo knippert er bij het openen geen systeemletter voorbij.

**De trap.** Er stonden twintig verschillende vaste maten in de stijlen,
van 12 tot 30 px, vaak een pixel uit elkaar (15, 16, 17; 19, 20, 22). Nu
zes stappen, `--fs-1` tot `--fs-6`: 12, 14, 16, 20, 28, 40. Wat met het
scherm meeschaalt (klok, totalen, woordmerk, aftelcijfer) houdt zijn eigen
`min()`/`max()`, maar neemt zijn ondergrens van de trap. `--type-label` en
`--type-note` blijven de bodems voor tekst die meeschaalt. Letterspatiëring
was er in vijf maten (.01 tot .1em); nu twee: 0 voor zin-tekst en
`--track-caps` (.06em) voor hoofdletters.

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

### Die knop verschijnt, maar duwt niets

Hij stond ónder de hint en kwam erbij op de eerste tik, en dat kostte 60 px
(48 knop plus 12 marge): het hele raster zakte, en de tegel waar je vinger
nog op lag zakte mee -- negentig procent van haar eigen hoogte van 67. Bij
het terugleggen van de laatste kaart sprong diezelfde 60 px terug omhoog.
Precies de fout waar `buildCards()` al voor oppast ("dan springt de kaart
weg onder je hand"), alleen langs een andere weg.

Twee dingen aan die fout zijn het onthouden waard. Chrome's **scroll
anchoring** vangt hem op zodra de kop van de bak boven het venster uit
staat -- daar is de verschuiving gemeten nul. Hij valt dus juist in het
geval dat telt: je klapt de bak open en tikt je eerste kaart weg met die
kop nog in beeld. En de knop is met zijn `.btn-plain`-huid het op één na
zwaarste vlak van het paneel, terwijl de code er zelf al bij zei dat het
"het zeldzaamste is wat je hier doet".

De hint en de knop delen nu één rastervak (`.cb-slot`), zodat de sleuf
altijd zo hoog is als de hoogste van de twee. Gemeten op 320, 360, 390,
412, 844 en 768 breed, over vier overgangen (eerste kaart weg, twaalf erbij,
alles terug): nul verschuiving, en één sleufhoogte per breedte.

Dat de hint mag wijken is de kern en geen bezuiniging: **hij belóóft dat het
terug kan, de knop dóét dat.** Wie één kaart terug wil tikt haar tegel --
die staat bleek, doorgestreept en met "weggelegd, tik om terug te leggen"
in haar aria-label.

Wat er níet moest komen: een gereserveerde lege sleuf. Getekend is dat 60 px
niets tussen de hint en de letterbalk, méér dan de 24 tot 48 waarmee dit
scherm zijn velden scheidt, en het leest dus als een ontbrekend element. Een
knop die blijft staan maar dood is, is dat ook -- die zegt niets wat de hint
niet al zei. En in de letterbalk (waar hij zonder één pixel hoogte in past)
draagt hij dezelfde huid als de lettertoetsen, dus las hij als nóg een
letter, en zakte de balk van acht zichtbare letters naar vier -- weg is dan
het teken dat er meer is.

Twee dingen om niet stuk te maken:

- **`visibility`, nooit `hidden` of `display: none`.** Die halen het vak uit
  het raster, en dan zakt de sleuf terug naar de hoogte van de ander --
  gemeten −13 px bij het terugleggen. `visibility` houdt allebei de vakken
  staan én haalt het onzichtbare uit de tabvolgorde en de
  toegankelijkheidsboom. Dat is de vierde keer dat de `[hidden]`-val hier
  toeslaat, en de eerste waar `hidden` niet de oplossing maar de fout is.
- **`#cbVol` blijft erbuiten.** Dat is de weigering bij `MIN_BAK`, en die
  hoort zichzelf juist wél aan te kondigen -- je bereikt hem pas na een tik
  of vijftig.

De prijs, en die is gemeten: op 390 is de sleuf 48 px waar een hint van twee
regels er 35 haalt, dus 13 px erbij als er niets weg ligt. Ligt er wél iets
weg, dan scheelt het 47 (60 tegen 107). Op 320, waar de hint drie regels
haalt, is het nul tegen zestig.

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

**Twee stapels, één lade.** Welke kaarten er kunnen komen werd op drie
manieren beantwoord: keuzeknoppen (Moeilijkheid), een kleine vouwregel met
een plus ("Alle kaarten · 90 in het spel") en een rij tegels met een
gestippelde plus (Eigen kaarten). Drie vormen voor één vraag lazen als drie
losse instellingen, en de twee getallen telden niet op: de 90 liet de eigen
kaarten weg en stond op een andere plek dan hun aantal. Nu is er één veld,
**Kaartenbak**, met twee gelijke stapels naast elkaar: Gewone en Eigen,
elk met haar bovenste kaart en haar getal in Fredoka. Zo is elke rij in
Spel een rij gelijke stukken (keuzeknoppen, stapels, keuzeknoppen,
keuzeknoppen), en wie Moeilijkheid omzet ziet de stapel eronder meegaan
(90, 183, 275, met de eerste kaart van die stand bovenop).

- Een tik op een stapel laat hem inzakken (`aria-expanded`, op
  `--paper-2`, zonder schaduw) en legt zijn kaarten in de lade eronder; een
  tik op de andere wisselt, nog een tik sluit. Eén lade tegelijk
  (`settings.lade`): twee open laden duwden Kaarten per potje een scherm of
  drie weg. Geen goud: dat is hier "gekozen", en een open lade kiest niets.
- Zonder eigen kaarten is Eigen een lege plek: gestippeld en plat, zoals de
  plus, met één lege kaart en het getal 0. Een tik opent meteen de maker;
  een lade met alleen een plus erin is een tik voor niets. Na bewaren gaat
  de lade open op de nieuwe kaart.
- In de eigen lade staat alleen de zin dat ze op deze telefoon blijven,
  dan de kaarten. Hoeveel er meedoen staat bij Potje; bij 0 zegt "uit" het
  op de stapel, en wijkt de waaier terug.
- Ook getest: twee gelijke vouwregels onder elkaar (dezelfde vorm, maar een
  formulier zonder beeld), en alles in één rij die opzij schuift (de stapel
  gewone kaarten leek er één kaart meer tussen, en Aan/Uit kwam en ging nog).

## Eigen kaarten

Er stond één zelfgemaakte kaart in `DECKS` (🦸 "Max H"), met de hand in de
code gezet. Dat het spel van jullie is, is wat kinderen het hardst laat
gieren: oma uitbeelden, of de hond. Eigen kaarten maken dat mogelijk zonder
code: een foto of tekening en het woord, in Instellingen.

- **Een deel van het potje, de langst niet getrokken eerst.** Je kiest 0,
  ⅛, ¼ of ½ ("Waarvan eigen"), standaard ¼. Een deel en geen vast
  aantal: 4 van 16 is een kwart, 4 van 32 een achtste, en dan komt oma bij
  het grote potje half zo vaak. Op de knoppen staat wel het aantal dat er
  echt in gaat (24 met tien eigen: 0, 3, 6, 10; met vijf: 0, 3, 5 en een
  verzonken 12), en de strook erboven toont het. Stond er het aantal dat het
  deel vraagt, dan was de gouden knop 6 terwijl de strook en de telling 5
  zeiden. Een knop die meer vraagt dan er zijn ligt verzonken, behalve de
  eerste die ze allemaal neemt; die verzonken knop houdt zijn eigen getal,
  anders stonden er twee keer 5. Niet hoger dan de helft: met de
  helft zat na drie avonden steeds hetzelfde gezicht in elk potje en was oma
  geen verrassing meer. Los erdoor schudden was het andere uiterste: bij 275
  kaarten komt een eigen kaart dan bijna nooit, en daar maakte je haar niet
  voor. `laatst` wordt gezet als de kaart getrokken wordt (`newGame`), dus
  elke kaart komt aan de beurt.
- **Nul is uit.** "Bobby" zegt een vriendje niets, en in ronde 2 en 3 kan
  het die kaart niet raden. Dit is de enige plek waar het spel de regel
  "één betekenis los van context" bewust loslaat, dus moet je die keuze
  kunnen terugdraaien: 0 bij "Waarvan eigen". Een aparte Aan/Uit
  stond in de lade, ver van de vraag die er echt toe doet (hoeveel), en een
  oude Uit wordt bij het laden 0. Bij 0 wijken de beelden in de tegels en op
  de stapel terug, en staat "uit" bij het getal. Dat de kaarten op de
  telefoon blijven, staat in de eigen lade, bij de kaarten zelf.
- **Het woord wint van een gewone kaart.** Een foto van je eigen hond heet
  "hond"; weigeren voelde als een fout van de app. De gewone kaart met dat
  woord blijft uit het potje zolang de eigen bestaat. Twee eigen kaarten met
  hetzelfde woord blijven geweigerd: dan weet niemand welke telt.
- **Een kaart zonder beeld bestaat niet.** Een kaart met alleen een woord is
  voor wie niet leest een lege kaart (de harde eis). Is een beeld weg, dan
  gaat de kaart uit de lijst bij de start en uit de stapel van een bewaard
  potje.
- **De foto in kleur, zonder kader.** Emoji zijn al kleur, en een kind
  herkent oma op een foto sneller dan op een gestileerde. De inktlijn van
  `.glyph` legt om een vierkante foto een kader van 4 px, en dat is op de
  kaart een derde rand (kaart, gouden band, kader) en in de tegel een kader
  in een kader; op de telefoon las het als een fout. Een foto ligt daarom kaal
  op het papier (`.kaal`), ook in de maker, de tegels en `#kijk`. Gedrukt in
  rasterpunten paste beter bij het bord, maar op kaartmaat herken je er geen
  gezicht meer in.
- **Hetzelfde raster als de gewone kaarten, met één lege kaart vooraan.**
  Een rij die opzij schoof verstopte bij tien kaarten de meeste uit beeld;
  in de lade lopen veertig tegels gewoon naar beneden door, en de lade is
  dicht als je haar niet nodig hebt (zie Het instellingenscherm). Vooraan
  staat een lege kaart met een stippelrand en een plus, ook als de rij leeg is: ze
  leest als "kaart erbij" en staat altijd op dezelfde plek. Ze ligt plat,
  zonder schaduw: stippelrand en slagschaduw samen zeiden "lege plek" en
  "stuk dat hier ligt" tegelijk. Een druk kleurt haar `--paper-2`, zoals een
  putje. Een volle tegel met een plus verloor de lege plek, een tegel in de
  stippelrand gaf een rechthoek in een rechthoek. Twee tegels
  (camera en potlood) zonder naam stonden tussen de kaarten, zagen eruit als
  kaarten, en lieten je in de maker vastzitten in de soort waarop je had
  getikt; een derde voor toveren zou niemand meer raden.
- **Foto of tekening kies je in de maker.** In de kop staan Foto en Tekenen
  als keuzeknoppen, zoals de keuzes in Instellingen (goud met een vinkje).
  Wisselen houdt het woord, en wat er al gemaakt was blijft als klad liggen:
  terugwisselen brengt het terug. Een nieuwe kaart opent in de soort van de
  vorige keer, de eerste keer op de foto. Een bestaande kaart heeft de keuze
  niet: wisselen zou haar beeld weggooien. Twee knoppen in het veld ("+ Foto",
  "+ Tekening") zeiden meteen welke soorten er zijn, maar herhaalden die
  keuze en stonden los van de kaarten.
- **Het paneel is de kaart.** Het beeld in het vierkant, het woord eronder,
  op de plek waar het in het spel komt. Schuiven met één vinger, knijpen met
  twee, en − en + voor wie dat niet doet. Het kruis staat rechtsboven op het
  paneel en niet in de hoek van het scherm: daar viel het op 320 px over de
  kaart. Liggend staat de kaart links en de rest rechts; onder elkaar past
  het niet in 390 px hoog.
- **Bewaren wijst de weg.** Bewaren is goud zodra er een beeld is. Een
  grijze knop die pas met een woord oplicht, zei niet waarom hij niets deed;
  met het toetsenbord weg viel de woordregel niet op. Nu laat een tik zonder
  woord de woordregel schudden en opent het toetsenbord, zoals elders een
  losse tik voordoet in plaats van te weigeren.
- **Niets gaat verloren.** Wie per ongeluk op het kruis tikt of terugveegt,
  vindt de niet bewaarde kaart terug bij de volgende tik op de plus
  (een klad per soort). Geen
  "weet je het zeker?": dat is een vraag in tekst. Weggooien kost twee tikken
  (de knop wordt inkt en vraagt het), geen lange druk, want die is alleen
  voor stoppen.
- **Opslag.** De lijst in `localStorage`, de beelden als JPEG van 512 px
  (zo'n 50 kB) in IndexedDB, hoogstens veertig. Safari wist de gegevens van
  een site in een tabblad na zeven dagen zonder bezoek; daarom vraagt de
  eerste bewaarbeurt `navigator.storage.persist()`. Een geïnstalleerde app
  heeft daar geen last van. Zonder IndexedDB (een privévenster) staat het
  veld er niet.
- **De camera zit in de kaart.** Een nieuwe kaart opent op de zoeker: het
  vierkant toont de camera precies zoals de foto op de kaart komt, en eronder
  liggen het album, de sluiter en omdraaien. De keuze van de telefoon zelf
  (`<input type="file">`) haalde je uit de app naar een ander scherm met
  andere knoppen; zo blijft alles op de kaart. De sluiter is de enige cirkel
  op het paneel: 80 px, met het fototoestel van de Foto-chip erin, en
  `--lift-2`, want afdrukken is zolang de camera
  loopt waar het paneel voor is; een tik op de zoeker zelf drukt ook af.
  Omdraaien staat er alleen als er twee camera's zijn, en houdt dan zijn
  plek (`visibility`), zodat de sluiter in het midden blijft.
- **Een spiegel in de zoeker, niet op de kaart.** De voorcamera spiegelt in
  de zoeker, zoals je jezelf verwacht te zien; de foto wordt ongespiegeld
  bewaard, zoals de camera van de telefoon dat doet.
- **Zonder camera het album.** Geen `getUserMedia`, geen toestemming of geen
  camera: dan is het vierkant leeg met het albumteken, en een tik opent de
  keuze van de telefoon, die daar ook zijn eigen camera aanbiedt. Een nee
  wordt onthouden tot de app sluit, zodat niet elke kaart opnieuw vraagt.
  Een iPhone vraagt in een geïnstalleerde app bij elke start opnieuw; dat is
  WebKit en niet te omzeilen. Wat de browser niet kan lezen (HEIC op
  Android) wordt geweigerd zoals overal: het vierkant schudt.
- **De camera gaat uit** bij afdrukken, sluiten, `visibilitychange` en
  `pagehide`, anders blijft het lampje branden. Komt de app terug terwijl de
  zoeker openstond, dan gaat hij weer aan.
- **Of je tekent haar.** Niet elk ding heeft een foto, en een kind tekent
  zelf graag. De potloodtegel opent de maker op een vel van 512 bij 512 in
  hetzelfde vierkant. Eén pen
  die met een tweede tik dik of dun wordt, een emmer, een gum, een stap terug
  en alles weg: genoeg voor een kind van vier, zonder menu. Wie de gum pakt,
  heeft geen kleur meer gekozen; een tik op een kleur pakt de pen weer.
- **Zes tekenkleuren zijn inhoud, geen betekenis.** Inkt, rood, blauw, goud,
  groen en bruin. "Kleur betekent één ding" gaat over de stukken van het
  bord; wat er op een kaart staat is inhoud, net als de kleuren van een
  emoji. De knoppen zelf houden de regel: gekozen is goud.
- **Een tekening is doorzichtig en krijgt de pen.** Bewaard als PNG zonder
  achtergrond, zodat het papier van de kaart erdoor komt en de vier
  `drop-shadow`s van `.glyph` om elke lijn een inktrand leggen, zoals om een
  emoji. Om een vrije vorm is dat een lijn, geen kader. Aanpassen
  tekent verder op het bewaarde beeld; een stap terug haalt alleen wat er in
  deze beurt bij kwam.

## Toveren

Een tekening uit een woord: typ "kameel", tik op de toverstaf, en een
tekening in de stijl van de app landt op het doek van de tekenmaker. Gekozen
op 4 november 2026, na drie mockups (Tover een kaart, Foto tekenen of
toveren); de afwegingen staan hieronder.

- **Een Cloudflare Worker, geen sleutel in de app.** `worker/tover.mjs`
  roept Workers AI aan via een binding; `index.html` kent alleen het adres.
  Uitgerold door `.github/workflows/worker.yml` met het geheim
  `CLOUDFLARE_API_TOKEN` (sjabloon "Edit Cloudflare Workers"), los van
  GitHub Pages. Vanaf de ontwikkelmachine zijn `api.cloudflare.com` en
  `workers.dev` niet bereikbaar; daarom rolt GitHub uit en tekent GitHub het
  proefvel (`workflow_dispatch` met `proef`, op de branch `tover-proef`).
- **Twee stappen.** Een klein taalmodel (Llama 3.1 8B) zet het woord om naar
  Engels en keurt het: FLUX begrijpt Engels het best, en het taalmodel is het
  slot voor wat niet op een kinderkaart hoort. Daarna tekent FLUX.1 schnell
  in vier stappen een sticker met een dikke zwarte lijn op effen crème.
- **Alleen het woord gaat de deur uit.** Geen foto, geen naam, geen adres.
  Cloudflare traint niet op wat Workers AI verwerkt en bewaart niets na het
  antwoord, zolang er geen logging aan staat (`observability` uit).
- **Begrensd.** Alleen `https://maxoftheday.github.io` mag hem aanroepen
  (CORS, `text/plain` zodat er geen preflight is), per adres twaalf per
  minuut (rate-limit-binding), en per dag het gratis budget van 10.000
  neurons: zo'n honderdvijftig tekeningen. Daarna weigert Workers AI tot
  middernacht UTC; op het gratis plan kost het nooit geld.
- **Antwoorden.** `{ beeld }` als data-URL, of `{ fout }`: `nee` (verboden
  of afgekeurd woord), `druk` (de limiet per minuut), `op` (het dagbudget),
  `stuk` (iets anders). De app maakt van elke fout dezelfde schudbeweging;
  alleen `op` krijgt een eigen teken.
- **Getoetst** in `test/tover.test.js` met een nagebootste Workers AI. Of de
  tekening mooi is, ziet alleen een mens: daarvoor is het proefvel.
- **De staf zit in Tekenen, niet in een derde soort.** Een getoverde kaart ís
  een tekening: daarna kun je bijkleuren en gummen. Een derde knop "Toveren"
  naast Foto en Tekenen was een weg te veel. Een gouden tegel naast het
  woord las als "OK"; midden op het lege vel zegt de staf "hier komt het",
  zoals het album in het lege fotovak. Grijs en gestippeld zonder woord (een
  tik wijst de woordregel aan), goud met woord; "Klaar" op het toetsenbord
  tovert ook. Staat er iets op het vel, dan staat de staf in het gereedschap,
  voor nog een.
- **Een getoverde tekening is een stap.** Ze komt als één actie in
  `mk.acties` die het vel vervangt; stap terug haalt de vorige terug, de
  prullenbak alles. De crème achtergrond knipt de telefoon weg (`knipUit()`,
  vanaf de randen, met een halve rand), zodat ze doorzichtig is zoals een
  getekende en de pen van `.glyph` krijgt.
- **Wachten is rastertoon.** Terwijl Workers AI tekent (twee tot vijf tellen)
  zwellen de punten van het vel, geen draaiend wieltje. Zonder net een
  wifi-teken op de staf, met het dagbudget op de zandloper (`#i-glass`);
  een afgekeurd woord of een andere fout laat de staf schudden.

## Weggaan kost niets

Android sluit de app bij de tweede terugveeg als er tussen de twee vegen
niet getikt is, wat de app ook in de geschiedenis zet. Dat is Chrome's
[history manipulation intervention](https://chromium.googlesource.com/chromium/src/+/127.0.6533.99/docs/history_manipulation_intervention.md):
een document dat zonder tik een invoer toevoegt, wordt bij de terugknop en
het terug-gebaar in zijn geheel overgeslagen. Een veeg is geen tik, dus de
invoer die na de eerste veeg terugkomt, telt niet. Alle invoeren van één
document delen die vlag, dus een voorraad invoeren (PR #85) helpt niet, en
`history.back()` uit een test valt er buiten -- daarom zag Playwright het nooit.
`CloseWatcher` heeft dezelfde regel.

Het vangnet blijft (één invoer, de eerste veeg opent het pauzepaneel, en na
een tik vangt het weer). Wat veranderde is dat weggaan niets meer kost:
`bewaarBeurt()` bewaart bij `visibilitychange` en `pagehide` de lopende beurt,
afgerond via `Spel.onderbreek()`. De punten blijven, de kaart in beeld komt
bovenop de stapel, en dezelfde ploeg gaat op de overdracht verder met haar
resttijd (minstens `MIN_REST`, vijf tellen; de zandloper op de opdrachtkaart
toont die resttijd). Dat dekt ook herladen, vergrendelen en een toestel dat
de app opruimt. Voorheen werd een onderbroken beurt overgespeeld, met
kaarten die de ploeg al gezien had.

Na een herlaadbeurt ligt onze invoer nog in de geschiedenis; `backGuard`
wordt bij de start uit `history.state` gelezen, anders kwam er een tweede
bij en deed de eerste veeg op de titel niets.

Ook de eindstand overleeft het: `winner()` bewaart het uitgespeelde potje
als `"uit"`, en de app opent daarop weer op de eindstand tot je dat scherm
verlaat (huisje, terug of "nog een keer"). Trillen wacht dan op een eerste
tik, want zonder tik weigert de browser `navigator.vibrate` met een
waarschuwing.
