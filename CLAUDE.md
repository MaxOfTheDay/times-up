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

## Kleur betekent één ding

Rood is Vos en blauw is Uil, en verder niets. Wie een kleur nodig heeft voor
een toestand pakt er een uit `:root`: `--go` (goud) voor verdergaan,
`--good` voor geraden, `--danger` voor stoppen, `--time-3/2/1` voor de klok.
Nooit een ploegkleur lenen — dan betekent rood op het ene scherm "de vossen"
en op het volgende "haast je", en daarmee niets meer.

Kleur staat ook nooit alleen: elke toestand heeft er een tweede kanaal bij
(een vorm, een teken, een woord, een beweging).

## Wat je moet vasthouden, zegt dat

Een lange druk is alleen voor wat echt niet ongedaan te maken is: starten
(de klok mag niet lopen terwijl het toestel nog van hand wisselt), stoppen
en opnieuw beginnen (allebei een lopend potje weg). Alle drie lopen via
`holdButton()` en dragen dezelfde gestippelde rand. Die functie tekent de
voortgang zelf, per frame: een CSS-overgang zou bij `prefers-reduced-motion`
meteen op vol springen, en het toetsenbord zou de druk overslaan.

Het tandwiel kreeg deze behandeling ooit ook, maar instellingen openen is
niets onomkeerbaars en het tandwiel bestaat alleen op het titelscherm --
geen risico dat een lange druk moest afdekken. Hij is nu een gewone tik,
zoals alles wat niets kost om ongedaan te maken.

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
