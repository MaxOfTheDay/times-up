/*
 * Test-suite voor de spelkern: de spelregels zonder browser.
 *
 * Knipt <script id="spelkern"> uit index.html en draait dat blok in een
 * lege Node-context -- er is dus geen kopie van de regels die uit de pas
 * kan lopen met wat de app echt draait. Duurt milliseconden; draai hem bij
 * elke wijziging aan de regels.
 *
 * Draaien: npm run test:kern     (of npm test voor alles)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/<script id="spelkern">([\s\S]*?)<\/script>/);
if (!m) throw new Error('geen <script id="spelkern"> in index.html');
// In deze realm en niet in een eigen context: dan zijn de objecten die
// eruit komen gewone objecten, en vergelijkt deepEqual ze zonder gedoe.
const Spel = vm.runInThisContext('(function () {' + m[1] + '\nreturn Spel;\n})()');

// Een vaste reeks in plaats van Math.random: elke run hetzelfde potje.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Een klein, herkenbaar deck: per stand 50 kaarten, woorden uniek.
const DECKS = {
  klein: Array.from({ length: 50 }, (_, i) => ['k' + i, 'klein' + i]),
  midden: Array.from({ length: 50 }, (_, i) => ['m' + i, 'midden' + i]),
  groot: Array.from({ length: 50 }, (_, i) => ['g' + i, 'groot' + i])
};
const deckVan = n => Array.from({ length: n }, (_, i) => ['e' + i, 'w' + i]);

// Een potje met een bekende beginploeg en een volle stapel.
function potje(n = 6, secs = 30, seed = 1) {
  const G = Spel.nieuw(deckVan(n), secs, rng(seed));
  Spel.beurtKlaar(G);
  return G;
}
// Alle kaarten die in het spel zijn: stapel plus de kaart in beeld.
const inSpel = G => G.pile.concat(G.card === null ? [] : [G.card]).sort((a, b) => a - b);

test('schudden: een permutatie, herhaalbaar met dezelfde reeks', () => {
  const a = Array.from({ length: 20 }, (_, i) => i);
  const s1 = Spel.shuffle(a, rng(7)), s2 = Spel.shuffle(a, rng(7));
  assert.deepEqual(s1, s2);
  assert.deepEqual([...s1].sort((x, y) => x - y), a);
  assert.notDeepEqual(s1, a);
  assert.deepEqual(a, Array.from({ length: 20 }, (_, i) => i), 'het origineel blijft staan');
});

test('poolFor: een stand is een plafond', () => {
  assert.equal(Spel.poolFor(DECKS, 'klein').length, 50);
  assert.equal(Spel.poolFor(DECKS, 'midden').length, 100);
  assert.equal(Spel.poolFor(DECKS, 'groot').length, 150);
  assert.equal(Spel.poolFor(DECKS, 'onzin').length, 50, 'onbekend valt terug op klein');
});

test('bakFor en drawDeck: weggelegde kaarten komen niet in het potje', () => {
  const weg = ['klein0', 'klein1', 'midden3'];
  const bak = Spel.bakFor(DECKS, 'midden', weg);
  assert.equal(bak.length, 97);
  assert.ok(!bak.some(c => weg.includes(c[1])));
  const greep = Spel.drawDeck(DECKS, 'midden', 24, weg, rng(3));
  assert.equal(greep.length, 24);
  assert.equal(new Set(greep.map(c => c[1])).size, 24, 'geen dubbele kaarten');
  assert.ok(!greep.some(c => weg.includes(c[1])));
});

test('canHide: de ondergrens geldt over alle standen', () => {
  // Klein heeft 50 kaarten; tien weg mag (40 over), de elfde niet.
  const tien = Array.from({ length: 10 }, (_, i) => 'klein' + i);
  assert.equal(Spel.canHide(DECKS, tien.slice(0, 9), 'klein9'), true);
  assert.equal(Spel.canHide(DECKS, tien, 'klein10'), false);
  // Ook vanuit een andere stand bekeken: de bak van klein telt mee.
  assert.equal(Spel.canHide(DECKS, tien, 'midden0'), true);
});

test('nieuw: de beginstand', () => {
  const G = Spel.nieuw(deckVan(8), 45, rng(11));
  assert.equal(G.round, 1);
  assert.ok(G.team === 0 || G.team === 1);
  assert.deepEqual(G.scores, [[0, 0, 0], [0, 0, 0]]);
  assert.equal(G.card, null);
  assert.equal(G.pendingMs, 45000);
  assert.equal(Spel.beurtMs(G), 45000);
  assert.deepEqual(inSpel(G), [0, 1, 2, 3, 4, 5, 6, 7]);
  // De worp hangt aan de reeks: allebei de ploegen komen voor.
  const teams = new Set(Array.from({ length: 20 }, (_, s) => Spel.nieuw(deckVan(4), 30, rng(s)).team));
  assert.deepEqual([...teams].sort(), [0, 1]);
});

test('geraden: een punt voor de ploeg aan zet, in de ronde van nu', () => {
  const G = potje(6);
  G.round = 2; G.team = 1;
  Spel.trek(G);
  const eerste = G.card;
  assert.deepEqual(Spel.geraden(G), { leeg: false });
  assert.equal(G.scores[1][1], 1);
  assert.equal(G.scores[0][1], 0);
  assert.equal(G.gained, 1);
  assert.notEqual(G.card, eerste);
  assert.equal(Spel.over(G), 5);
});

test('geraden op de laatste kaart: de ronde is om', () => {
  const G = potje(2);
  Spel.trek(G);
  assert.deepEqual(Spel.geraden(G), { leeg: false });
  assert.deepEqual(Spel.geraden(G), { leeg: true });
  assert.equal(G.card, null);
  assert.equal(Spel.over(G), 0);
  assert.equal(Spel.total(G, G.team), 2);
});

test('passen: onderop, zonder straf; de laatste kaart niet', () => {
  const G = potje(3);
  Spel.trek(G);
  const kaart = G.card;
  assert.equal(Spel.passen(G), true);
  assert.equal(G.pile[G.pile.length - 1], kaart);
  assert.deepEqual(G.scores, [[0, 0, 0], [0, 0, 0]]);
  assert.deepEqual(inSpel(G), [0, 1, 2]);
  Spel.geraden(G); Spel.geraden(G);         // nog één over
  assert.equal(G.pile.length, 0);
  const laatste = G.card;
  assert.equal(Spel.passen(G), false);
  assert.equal(G.card, laatste);
});

test('tijd om: de onafgemaakte kaart gaat terug, niets gaat verloren', () => {
  const G = potje(5);
  G.pendingMs = 12000;
  Spel.trek(G); Spel.geraden(G);
  Spel.tijdOm(G);
  assert.equal(G.card, null);
  assert.equal(G.pendingMs, 0);
  assert.equal(G.pile.length, 4);
  assert.equal(new Set(G.pile).size, 4);
});

test('beurtwissel: de andere ploeg, een volle beurt', () => {
  const G = potje(5);
  G.team = 0; G.pendingMs = 0;
  Spel.trek(G); Spel.geraden(G); Spel.geraden(G);
  Spel.tijdOm(G);
  assert.deepEqual(Spel.beurtWissel(G), [2, 0]);
  assert.equal(G.team, 1);
  assert.equal(Spel.beurtMs(G), 30000);
});

test('ronde-einde: de rest gaat mee naar dezelfde ploeg, minstens drie tellen', () => {
  const G = potje(2);
  G.team = 1;
  Spel.trek(G); Spel.geraden(G); Spel.geraden(G);
  const r = Spel.rondeEinde(G, 1200.4, rng(5));
  assert.deepEqual(r, { uit: false, vers: [0, 2] });
  assert.equal(G.round, 2);
  assert.equal(G.team, 1, 'geen ploegwissel bij een rondewissel');
  assert.equal(G.pendingMs, Spel.MIN_CARRY);
  assert.equal(Spel.beurtMs(G), Spel.MIN_CARRY);
  assert.deepEqual(inSpel(G), [0, 1], 'de hele greep ligt weer op de stapel');

  const H = potje(2);
  Spel.trek(H); Spel.geraden(H); Spel.geraden(H);
  Spel.rondeEinde(H, 17654.6);
  assert.equal(H.pendingMs, 17655);
  const K = potje(2);
  Spel.rondeEinde(K, 0);
  assert.equal(K.pendingMs, 0);
  assert.equal(Spel.beurtMs(K), 30000);
});

test('na ronde 3 is het potje uit', () => {
  const G = potje(1);
  G.round = Spel.ROUNDS;
  Spel.trek(G); Spel.geraden(G);
  assert.equal(Spel.rondeEinde(G, 5000).uit, true);
  assert.equal(G.round, Spel.ROUNDS);
});

test('winnaar en gespeelde rondes', () => {
  const G = potje(4);
  G.scores = [[3, 2, 0], [1, 1, 0]];
  assert.equal(Spel.winnaar(G), 0);
  G.scores = [[1, 1, 0], [3, 2, 0]];
  assert.equal(Spel.winnaar(G), 1);
  G.scores = [[2, 2, 0], [3, 1, 0]];
  assert.equal(Spel.winnaar(G), null);
  G.round = 2;
  assert.equal(Spel.gespeeld(G, 1), true);
  assert.equal(Spel.gespeeld(G, 2), true);
  assert.equal(Spel.gespeeld(G, 3), false);
});

test('herstel: een bewaard potje komt terug, met verse vluchtige velden', () => {
  const G = potje(4);
  G.round = 2; G.scores = [[3, 1, 0], [2, 0, 0]];
  G.card = 1; G.gained = 3; G.pendingMs = 4000;
  const t = 1_000_000;
  const opslag = JSON.parse(JSON.stringify({ t, mode: 'round', G }));
  const h = Spel.herstel(opslag, t + 1000);
  assert.equal(h.mode, 'round');
  assert.equal(h.G.card, null);
  assert.equal(h.G.gained, 0);
  assert.equal(h.G.round, 2);
  assert.equal(h.G.pendingMs, 4000);
  assert.deepEqual(h.G.scores, [[3, 1, 0], [2, 0, 0]]);
  assert.equal(Spel.herstel({ ...opslag, mode: 'iets' }, t).mode, 'turn');
});

test('herstel: bij de minste twijfel geen spel', () => {
  const G = potje(4);
  const t = 1_000_000;
  const goed = () => JSON.parse(JSON.stringify({ t, mode: 'turn', G }));
  const stuk = [
    null, 'tekst', {}, { t: 'gisteren', G },
    (() => { const s = goed(); s.G.deck = []; return s; })(),
    (() => { const s = goed(); s.G.deck[0] = ['x']; return s; })(),
    (() => { const s = goed(); s.G.pile = [0, 9]; return s; })(),
    (() => { const s = goed(); s.G.pile = [0.5]; return s; })(),
    (() => { const s = goed(); s.G.scores = [[0, 0], [0, 0]]; return s; })(),
    (() => { const s = goed(); s.G.scores[0][0] = -1; return s; })(),
    (() => { const s = goed(); s.G.round = 4; return s; })(),
    (() => { const s = goed(); s.G.team = 2; return s; })(),
    (() => { const s = goed(); s.G.secs = 0; return s; })(),
    (() => { const s = goed(); s.G.pendingMs = -1; return s; })()
  ];
  stuk.forEach((s, i) => assert.equal(Spel.herstel(s, t), null, 'geval ' + i));
  assert.equal(Spel.herstel(goed(), t + Spel.GAME_MAX_AGE + 1), null, 'te oud');
  assert.notEqual(Spel.herstel(goed(), t + Spel.GAME_MAX_AGE), null, 'net op tijd');
});

test('een heel potje: elke kaart drie keer geraden, niets dubbel', () => {
  const rand = rng(42);
  const n = 16;
  const G = Spel.nieuw(deckVan(n), 30, rand);
  let beurten = 0, uit = false;
  while (!uit) {
    Spel.beurtKlaar(G);
    Spel.trek(G);
    beurten++;
    // Een beurt: willekeurig raden en passen, tot vijf acties, dan tijd om.
    let einde = null;
    for (let i = 0; i < 5 && !einde; i++) {
      if (rand() < .7) { if (Spel.geraden(G).leeg) einde = 'leeg'; }
      else Spel.passen(G);
    }
    if (einde === 'leeg') uit = Spel.rondeEinde(G, 4000, rand).uit;
    else { Spel.tijdOm(G); Spel.beurtWissel(G); }
    assert.ok(beurten < 1000, 'het potje eindigt');
    if (!uit) {
      const kaarten = inSpel(G);
      assert.equal(new Set(kaarten).size, kaarten.length, 'geen kaart dubbel op de stapel');
    }
  }
  assert.equal(Spel.total(G, 0) + Spel.total(G, 1), 3 * n);
  G.scores.forEach(rondes => rondes.forEach(p => assert.ok(p >= 0)));
  assert.equal(G.scores[0].map((_, r) => G.scores[0][r] + G.scores[1][r]).join(), [n, n, n].join());
});
