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

Het spelscherm houdt de blik op die ene kaart. De klok loopt als een rand om
de kaart heen in plaats van in een wijzerplaat ernaast, dus de tijd zit in
dezelfde blik als het beeld; de laatste seconden kleurt hij rood en klopt de
kaart mee. De kaart ligt op een stapel waarvan de randen verdwijnen naarmate
je opschiet — leegspelen levert tijd op voor de volgende ronde, dus dat is
het zien waard, en bij de laatste kaart ligt er niets meer onder.
Rechtsboven groeit een rij fiches: wat deze beurt al binnen is.

Alleen de klok is een meter. Alles wat langzaam leegloopt leest als tijd, dus
de stapel is een voorwerp en de punten zijn fiches — geen tweede en derde
balkje ernaast.

Geraden en gepast voelen ook anders: een geraden kaart wordt van de stapel
gedeeld, een gepaste zakt eerst weg onder de stapel. Zonder te kijken weet je
welke knop het deed.

## Spelen

Twee ploegen, drie rondes over hetzelfde deck:

1. **Uitleggen** — omschrijven met woorden, behalve het woord zelf.
2. **Eén woord** — één woord, meer niet.
3. **Uitbeelden** — alleen mimen, geen geluid.

Dat je dezelfde kaarten drie keer ziet is de bedoeling: tegen ronde drie kent
iedereen ze half uit het hoofd, en beginnen de jongsten te winnen.

Geraden kaart is een punt en meteen de volgende. Passen mag, zonder straf:
de kaart gaat onderaan terug. Loopt de stapel leeg, dan stopt de ronde
meteen — ook midden in een beurt — en gaat de resterende tijd mee naar de
eerste beurt van de volgende ronde, voor dezelfde ploeg.

De instellingen (houd het knopje rechtsonder ingedrukt) regelen de
moeilijkheid, het aantal kaarten, de tijd per beurt en het geluid. Je ziet
daar ook het deck van vanavond; tik een kaart aan om ze te vervangen. Het is
het enige scherm met tekst, en meteen de korte uitleg voor wie Time's Up niet
kent.

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
overgedragen tijd en een herstart midden in een beurt. Die laatste duurt
ruim een halve minuut, omdat één beurt echt moet uitlopen.

Beide draaien ook op elke pull request, via `.github/workflows/test.yml`.
