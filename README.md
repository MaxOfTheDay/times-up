# Tijd is Om

Time's Up voor kinderen die nog niet kunnen lezen. Eén zelfstandig
HTML-bestand: open `index.html` en het speelt — geen build, geen server,
geen internet.

## De regel waar alles aan hangt

Geen enkele speler hoeft ooit een woord te lezen. Niet op de kaarten, niet op
de knoppen, niet op het scorebord. Tekst staat op precies één scherm: de
instellingen, en die zijn voor de volwassene.

Daarom staat er op een kaart alleen een emoji, groot genoeg om door de kamer
te zien. De kaarten zijn zo gekozen dat elk beeld maar één ding kan
betekenen.

Het spelscherm houdt de blik op die ene kaart. De kaart is het grootste
vierkant dat op het scherm past en het teken erin is zo groot als de kaart
toelaat -- op een tablet vult dat bijna het hele beeld. De klok loopt als een
rand om de kaart heen in plaats van in een wijzerplaat ernaast, dus de tijd
zit in dezelfde blik als het beeld; hij verkleurt van goud naar wijnrood en
de laatste seconden klopt de kaart mee. De kaart ligt op een stapel waarvan de randen verdwijnen naarmate
je opschiet — leegspelen levert tijd op voor de volgende ronde, dus dat is
het zien waard, en bij de laatste kaart ligt er niets meer onder.
Linksboven, naast de mascotte, staat een groen "+N": wat deze beurt al binnen
is. Datzelfde label komt straks op de stand terecht, in dezelfde kleur en op
dezelfde plek naast diezelfde mascotte, dus je ziet wat je verzamelde
overgaan in wat erbij komt.

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
eerste beurt van de volgende ronde, voor dezelfde ploeg.

De instellingen (het knopje rechtsboven) regelen de
moeilijkheid, het aantal kaarten, de tijd per beurt en het geluid. Je ziet
daar ook het deck van vanavond; tik een kaart aan om ze te vervangen. Het is
het enige scherm met tekst, en meteen de korte uitleg voor wie Time's Up niet
kent. Die uitleg staat open tot je één keer een spel gestart hebt en klapt
daarna dicht tot één regel — terug te vinden, maar niet meer het eerste wat je
elke avond ziet.

De moeilijkheid werkt als een bovengrens, niet als een band: elke stand
speelt met zijn eigen kaarten én die van de stand eronder. Aan een tafel met
een zesjarige en een negenjarige houdt de jongste zo kaarten die hij kan
winnen, terwijl de oudste er af en toe een krijgt om over na te denken. Dat
kan omdat de helft van de moeilijkheid uit de ronde komt en niet uit de
kaart: "hond" zwijgend uitbeelden is op elke leeftijd werk.

Rechtsboven staat op elk scherm een knopje op dezelfde plek en in dezelfde
maat: op de titel een tandwiel, tijdens het spelen een pauzeteken, tussen de
beurten een huisje (daar loopt geen klok, dus valt er niets te pauzeren).
Achter de laatste twee zit hetzelfde paneel: de bevroren klok, de stand met
de kroon bij wie voorstaat en de opgetilde tegel bij wie aan zet is, en
daaronder de twee keuzes naast elkaar — verdergaan is een tik, stoppen een
lange druk. Passen staat altijd linksonder en geraden altijd rechtsonder,
ook als je het toestel draait.

Tijdens het spelen staat linksboven altijd wie aan de beurt is én wat de
opdracht van deze ronde is — praten, één woord of uitbeelden — zodat wie het
toestel aangereikt krijgt niet hoeft te vragen. Wordt de app weggeklikt of
het scherm vergrendeld, dan bevriest de klok tot je terug bent.

## Kaarten aanpassen

De decks staan bovenaan `index.html` als `DECKS`, één regel per kaart:

```js
klein: [ ["🐘","olifant"], ["🍎","appel"], … ]
```

Twee regels bij het toevoegen:

- **Eén betekenis, los van context.** Geen ⭐ (ster? licht? mooi?), niets
  waarvan de lezing van cultuur afhangt.
- **Alleen emoji tot en met Unicode 9.0 (2016).** Nieuwere tekens ontbreken op
  oudere tablets en verschijnen dan als ▯ — en dat is onspeelbaar. De test
  hieronder valt daarover.

## Tests

```
npm install
npm test
```

`test/deck.test.js` bewaakt de kaartregels (aantal, dubbels, en of elke emoji
echt tekent). `test/game.test.js` speelt een volledig potje in een echte
browser: de drie rondes, passen, de klok die afloopt, de ploegwissel, de
overgedragen tijd en dat een herlaadbeurt midden in een beurt niets laat
terugkomen. Die laatste duurt ruim een halve minuut, omdat één beurt echt
moet uitlopen.

Beide draaien ook op elke pull request, via `.github/workflows/test.yml`.
