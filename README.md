# Tijd is Om

Time's Up voor kinderen — ook voor wie nog niet kan lezen. Eén zelfstandig
HTML-bestand: open `index.html` en het speelt — geen build, geen server,
geen internet.

## De regel waar alles aan hangt

Geen enkele speler hoeft ooit een woord te lezen. Niet op de kaarten, niet op
de knoppen, niet op het scorebord. Uitleg staat op de instellingen, en die
zijn voor de volwassene. Waar elders tekst staat, staat ze náást een beeld
dat hetzelfde zegt, nooit in plaats ervan: wie niet leest, mist niets.

Daarom draagt een kaart een emoji, groot genoeg om door de kamer te zien, met
het woord klein eronder. Het beeld is de kaart; het woord beslecht alleen of
dat beertje een luiaard was. De kaarten zijn zo gekozen dat elk beeld maar
één ding kan betekenen.

Het spelscherm houdt de blik op die ene kaart. De kaart is het grootste
vierkant dat op het scherm past en het teken erin is zo groot als de kaart
toelaat -- op een tablet vult dat bijna het hele beeld. De klok loopt als een
rand om de kaart heen in plaats van in een wijzerplaat ernaast, dus de tijd
zit in dezelfde blik als het beeld; de band windt af vanaf twaalf uur,
verkleurt van goud naar paars, en de laatste vijf tellen wiebelt de kaart op
de tik. De kaart ligt op een stapel waarvan de randen verdwijnen naarmate je
opschiet -- leegspelen levert tijd op voor de volgende ronde, dus dat is het
zien waard, en bij de laatste kaart ligt er niets meer onder. Bovenaan, naast
de mascotte, staat een groen "+N": wat deze beurt al binnen is. Een geraden
kaart vliegt zelf naar dat label, en het geluid gaat per kaart een halve toon
omhoog. Op het overdrachtscherm staat het daarna niet nog eens: daar staat
alleen de stand.

Alleen de klok is een meter. Alles wat langzaam leegloopt leest als tijd, dus
de stapel is een voorwerp en de punten zijn een label — geen tweede en derde
balkje ernaast.

Geraden en gepast voelen ook anders: een geraden kaart wordt van de stapel
gedeeld, een gepaste zakt eerst weg onder de stapel. Zonder te kijken weet je
welke knop het deed.

## Spelen

Twee ploegen, drie rondes over hetzelfde deck:

1. **Omschrijven** — gebruik zoveel woorden als je wilt, behalve het woord zelf.
2. **Eén woord** — geef één woord als hint.
3. **Uitbeelden** — niet praten, alleen uitbeelden.

Dat je dezelfde kaarten drie keer ziet is de bedoeling: tegen ronde drie kent
iedereen ze half uit het hoofd, en beginnen de jongsten te winnen.

Tussen twee beurten krijg je het toestel aangereikt op één scherm: de stand,
de opdracht en één knop. De opdrachtkaart is de achterkant van de
speelkaart: een tik draait haar om en telt af van drie -- genoeg om je klaar
te zetten, en genoeg om een strijkende vinger tijdens het doorgeven op te
vangen. Terug kan tijdens het aftellen met de tegel rechtsboven. De kaart
blijft tot nul toe verborgen.

Geraden kaart is een punt en meteen de volgende. Passen mag, zonder straf:
de kaart gaat onderaan terug. Loopt de stapel leeg, dan stopt de ronde
meteen, en dezelfde ploeg speelt door in de volgende ronde met de tijd die
ze nog had (minstens vijf tellen). Te vroeg op goed getikt? Tik binnen drie
tellen op het groene +-getal bovenaan: het punt gaat eraf en de kaart komt
terug.

De instellingen (het knopje rechtsboven op de titel) zijn voor de
volwassene: het aantal kaarten per potje, de tijd per beurt, welke kaarten
erin kunnen, geluid en trilling, installeren, en "Zo speel je" met de korte
uitleg. Onder Kaarten staan twee lijsten. Gewone: de moeilijkheid en de hele
bak waaruit getrokken wordt; tik een kaart aan om haar weg te leggen
(zolang er in elke stand minstens 40 overblijven), en nog eens om haar terug
te leggen. Eigen: kaarten die je zelf maakt, met een foto of een tekening en
het woord dat telt, en hoeveel daarvan er in elk potje gaan. Welke kaarten
een potje krijgt, wordt pas getrokken als het begint, de langst niet
gespeelde eerst.

De moeilijkheid van de kaarten (makkelijk, medium, moeilijk) werkt als een
bovengrens, niet als een band: elke stand speelt met zijn eigen kaarten én
alle kaarten van de standen eronder (90, 183 of 275). Aan een tafel met
een zesjarige en een negenjarige houdt de jongste zo kaarten die hij kan
winnen, terwijl de oudste er af en toe een krijgt om over na te denken. Dat
kan omdat de helft van de moeilijkheid uit de ronde komt en niet uit de
kaart: "hond" zwijgend uitbeelden is op elke leeftijd werk.

Rechtsboven staat op elk scherm de uitgang. Op de titel is dat het tandwiel.
Tijdens een beurt is het de klokknop (seconden en pauzeteken): pauze draait
de kaart om, en op haar achterkant liggen de ronde, verder en het huisje.
Op de overdracht is het huisje zelf de uitgang, want daar loopt geen klok.
Naar huis is het enige wat je moet vasthouden: de titel groeit uit het
huisje zolang je drukt, en loslaten zet alles terug. Passen staat altijd
links en geraden rechts, ook als je het toestel draait.

Tijdens het spelen staat bovenaan altijd wie aan de beurt is én wat de
opdracht van deze ronde is -- praten, één woord of uitbeelden -- zodat wie het
toestel aangereikt krijgt niet hoeft te vragen.

Weggaan kost niets. Een lopend potje wordt op elke overdracht bewaard, en ook
als de app midden in een beurt wegraakt (weggeveegd, vergrendeld, herladen):
dan kom je terug op de overdracht van dezelfde ploeg, met de punten die al
binnen waren, de kaart van daarnet bovenop en de tijd die nog over was. Dat
geldt tot twee uur later. Stoppen via het huisje gooit het potje wél weg.

De app werkt zonder internet en is te installeren op het beginscherm: de
service worker (`sw.js`) bewaart het ene bestand en haalt op de achtergrond
een nieuwe versie op voor de volgende keer dat je opstart. Eigen kaarten
blijven op de telefoon (IndexedDB). Het net op gaat alleen een scriptfout
(de melding, het scherm, de versie en de browser, naar `worker/fout.mjs`),
zodat de maker ziet wat er op een andere telefoon misgaat.

## Kaarten aanpassen

De decks staan bovenaan `index.html` als `DECKS`, één regel per kaart:

```js
klein: [ ["🐘","olifant"], ["🍎","appel"], … ]
```

Drie regels bij het toevoegen:

- **Eén betekenis, los van context.** Geen ⭐ (ster? licht? mooi?), niets
  waarvan de lezing van cultuur afhangt. Dat ziet geen test; dat is
  mensenwerk.
- **Geen dubbele emoji of woorden, ook niet over de standen heen.** Moeilijk
  speelt met alle kaarten, dus een dubbele kaart komt twee keer in hetzelfde
  potje. De test hieronder valt daarover.
- **Geen ZWJ-reeksen en geen huidskleuren.** Die vallen op een oud toestel
  uiteen in losse tekens.

Hoe nieuw een emoji mag zijn, is een keuze en geen hek. De test meet of een
teken tekent op de machine die de test draait, en die heeft verse
lettertypes; op een oude tablet kan een nieuwe emoji alsnog als ▯
verschijnen. Kijk bij twijfel één keer op het oudste toestel dat meespeelt.

## Tests

```
npm install
npm test
```

`npm test` draait tien suites, in drie groepen (`test:kort`, `test:zwaar`,
`test:spel`):

- `test/kern.test.js` toetst de spelregels zelf, zonder browser en in
  milliseconden (`npm run test:kern`).
- `test/regels.test.js` toetst de huisregels uit `CLAUDE.md` die je aan de
  tekst van `index.html` kunt zien, ook in milliseconden.
- `test/tover.test.js` toetst de toverstaf-Worker met een nagebootste
  Workers AI.
- `test/fout.test.js` toetst de foutenbak-Worker, met een nagebootste opslag.
- `test/deck.test.js` bewaakt de kaartregels: het aantal, dubbels over alle
  standen heen, dat elke stand alles eronder bevat, en of elke emoji tekent.
- `test/stip.test.js` legt het stippenveld op de grafische kaart en op het
  2D-canvas over elkaar.
- `test/toestel.test.js` bootst per regel een stand van het toestel na (wifi
  met inlogpagina, gedwongen donker, een kapotte release, ...).
- `test/zintuigen.test.js` toetst het woordenboek van geluid en trilling.
- `test/snel.test.js` geeft de start, elke tik en rust een budget, met de CPU
  vier keer vertraagd.
- `test/game.test.js` speelt een volledig potje in een echte browser; dat
  duurt anderhalve tot twee minuten, omdat één beurt echt moet uitlopen.

Ze draaien ook op elke pull request, via `.github/workflows/test.yml`, de
drie groepen naast elkaar. Op `main` zet dezelfde workflow daarna de site op
GitHub Pages, alleen als alles groen is.
Daarnaast: `npm run test:chaos` tikt willekeurig op een vaste reeks, en
`npm run foto` zet elke stand op zeven schermmaten op een contactblad.

Twee scripts maken ingebakken beelden opnieuw: `npm run pictogrammen` voor de
app-pictogrammen (na een wijziging aan de zandloper) en `npm run schermen`
voor de screenshots in het manifest.
