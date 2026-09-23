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
zit in dezelfde blik als het beeld; hij verkleurt van goud naar wijnrood en
de laatste seconden klopt de kaart mee. De kaart ligt op een stapel waarvan de randen verdwijnen naarmate
je opschiet — leegspelen levert tijd op voor de volgende ronde, dus dat is
het zien waard, en bij de laatste kaart ligt er niets meer onder.
Linksboven, naast de mascotte, staat een groen "+N": wat deze beurt al binnen
is. Bij elke geraden kaart vliegt er een "+1" van de kaart naar dat label, en
het geluid gaat per kaart een halve toon omhoog. Op het overdrachtscherm
staat het daarna niet nog eens: daar staat alleen de stand.

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
de opdracht en één knop. Een tik telt af van drie — genoeg om je klaar te
zetten, en genoeg om een strijkende vinger tijdens het doorgeven op te
vangen. Tik tijdens het aftellen om terug te gaan. De kaart blijft tot nul
toe verborgen.

Geraden kaart is een punt en meteen de volgende. Passen mag, zonder straf:
de kaart gaat onderaan terug. Loopt de stapel leeg, dan stopt de ronde
meteen — ook midden in een beurt — en gaat de resterende tijd mee naar de
eerste beurt van de volgende ronde, voor dezelfde ploeg. Minstens drie
seconden: minder is na het aftellen geen beurt meer.

De instellingen (het knopje rechtsboven op de titel) regelen de
moeilijkheid, het aantal kaarten per potje, de tijd per beurt, het geluid en
— waar het toestel het kan — het trillen. Onder "Alle kaarten" staat de hele
bak waaruit getrokken wordt, op alfabet. Tik een kaart aan om haar weg te
leggen (zolang er in elke stand minstens 40 overblijven), en nog eens om haar
terug te leggen; die keuze blijft staan. Welke kaarten een potje krijgt, wordt
pas getrokken als het begint.

Het is ook het scherm met de korte uitleg voor wie Time's Up niet kent. Die
uitleg staat open tot je één keer een spel gestart hebt en klapt daarna dicht
tot één regel — terug te vinden, maar niet meer het eerste wat je elke avond
ziet.

De moeilijkheid van de kaarten (makkelijk, medium, moeilijk) werkt als een
bovengrens, niet als een band: elke stand speelt met zijn eigen kaarten én
alle kaarten van de standen eronder (90, 183 of 275). Aan een tafel met
een zesjarige en een negenjarige houdt de jongste zo kaarten die hij kan
winnen, terwijl de oudste er af en toe een krijgt om over na te denken. Dat
kan omdat de helft van de moeilijkheid uit de ronde komt en niet uit de
kaart: "hond" zwijgend uitbeelden is op elke leeftijd werk.

Rechtsboven staat op elk scherm een knopje op dezelfde plek en in dezelfde
maat: op de titel een tandwiel, tijdens het spelen een pauzeteken, tussen de
beurten een huisje (daar loopt geen klok, dus valt er niets te pauzeren).
Achter de laatste twee zit hetzelfde paneel: de bevroren klok (alleen tijdens
een beurt), de stand met de grote mascotte bij wie aan zet is, en daaronder de
twee keuzes naast elkaar — verdergaan is een tik, stoppen een lange druk. De
kroon staat alleen op het winnaarsscherm. Passen staat altijd linksonder en
geraden altijd rechtsonder, ook als je het toestel draait.

Tijdens het spelen staat bovenaan altijd wie aan de beurt is én wat de
opdracht van deze ronde is — praten, één woord of uitbeelden — zodat wie het
toestel aangereikt krijgt niet hoeft te vragen. Wordt de app weggeklikt of
het scherm vergrendeld, dan gaat het pauzepaneel open: de klok staat stil tot
iemand op verder tikt. Gebeurt het tijdens het aftellen, dan is er nog geen
beurt begonnen en sta je terug op het overdrachtscherm.

Een lopend potje wordt op elk overdrachtscherm bewaard. Wordt de app herladen
of door het toestel gesloten, dan kom je daar terug, tot twee uur later; een
beurt die half gespeeld was, wordt overgespeeld, met dezelfde kaarten en
zonder de punten die er half in stonden. Stoppen via het paneel gooit het
potje wél weg.

De app werkt zonder internet en is te installeren op het beginscherm: de
service worker (`sw.js`) bewaart het ene bestand en haalt op de achtergrond
een nieuwe versie op voor de volgende keer dat je opstart.

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

`test/deck.test.js` bewaakt de kaartregels: het aantal, dubbels over alle
standen heen, dat elke stand alles eronder bevat, en of elke emoji tekent.
`test/game.test.js` speelt een volledig potje in een echte browser: de drie
rondes, passen, de klok die afloopt, de ploegwissel, de overgedragen tijd, dat
een herlaadbeurt midden in een beurt terugkomt op de overdracht ervoor, de
terugveeg, pauzeren en stoppen, de laatste kaart op de bel, en wegklikken
tijdens een beurt of het aftellen. Die duurt ruim anderhalve minuut, omdat
één beurt echt moet uitlopen.

Beide draaien ook op elke pull request, via `.github/workflows/test.yml`.

Twee scripts maken ingebakken beelden opnieuw: `npm run pictogrammen` voor de
app-pictogrammen (na een wijziging aan de zandloper) en `npm run schermen`
voor de screenshots in het manifest.
