# Tijd is Om

## Werkwijze

Werk af op een feature branch, open een pull request en merge die zelf zodra
de tests groen zijn. Niet eerst om toestemming vragen — dat is de standaard
voor deze repo. Alleen wachten als er expliciet om een plan of een controle
vooraf gevraagd wordt.

De site draait op GitHub Pages vanaf `main`, dus wat niet gemerged is, staat
niet in de woonkamer.

## De harde eis

Geen enkele speler hoeft ooit een woord te lezen: niet op de kaarten, niet op
de knoppen, niet op het scorebord. Tekst hoort op het instellingenscherm, dat
voor de volwassene is. Waar tekst elders toch helpt, staat ze náást een beeld
dat hetzelfde vertelt — nooit in plaats daarvan.

Alles staat in `index.html`: geen build, geen externe assets, werkt met de
wifi uit. Houd dat zo.

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
