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

test('ronde-einde: dezelfde ploeg speelt door, met de tijd die ze nog had', () => {
  const G = potje(2);
  G.team = 1;
  Spel.trek(G); Spel.geraden(G); Spel.geraden(G);
  const r = Spel.rondeEinde(G, rng(5), 12345);
  assert.deepEqual(r, { uit: false, vers: [0, 2] });
  assert.equal(G.round, 2);
  assert.equal(G.team, 1, 'wie de stapel leeg speelde, speelt door');
  assert.equal(Spel.beurtMs(G), 12345);
  assert.deepEqual(inSpel(G), [0, 1], 'de hele greep ligt weer op de stapel');
  Spel.beurtKlaar(G); Spel.trek(G); Spel.tijdOm(G);
  Spel.beurtWissel(G);
  assert.equal(Spel.beurtMs(G), 30000, 'de beurt daarna is weer vol');
});

test('ronde-einde: op de bel nog minstens MIN_REST', () => {
  for (const rest of [0, 400, undefined]) {
    const G = potje(1);
    Spel.trek(G); Spel.geraden(G);
    Spel.rondeEinde(G, rng(5), rest);
    assert.equal(Spel.beurtMs(G), Spel.MIN_REST, 'rest ' + rest);
  }
});

test('terug: het laatste punt eraf, de kaart weer in beeld', () => {
  const G = potje(5);
  G.team = 0;
  const eerste = Spel.trek(G);
  Spel.geraden(G);
  const tweede = G.card;
  assert.equal(Spel.terug(G), true);
  assert.equal(G.card, eerste);
  assert.equal(G.pile[0], tweede, 'de kaart die er lag komt meteen weer');
  assert.equal(G.gained, 0);
  assert.equal(G.scores[0][0], 0);
  assert.deepEqual(inSpel(G).sort(), [0, 1, 2, 3, 4]);
  assert.equal(Spel.terug(G), false, 'één stap terug, niet meer');
});

test('terug: niet na passen-alleen, tijd om, de laatste kaart of een nieuwe beurt', () => {
  const G = potje(5);
  Spel.trek(G);
  assert.equal(Spel.terug(G), false, 'nog niets geraden');
  Spel.geraden(G); Spel.tijdOm(G);
  assert.equal(Spel.terug(G), false, 'na tijd om');
  Spel.beurtWissel(G); Spel.beurtKlaar(G); Spel.trek(G);
  assert.equal(Spel.terug(G), false, 'nieuwe beurt');
  const H = potje(1);
  Spel.trek(H);
  assert.equal(Spel.geraden(H).leeg, true);
  assert.equal(Spel.terug(H), false, 'de ronde is al om');
  const K = potje(5);
  Spel.trek(K); Spel.geraden(K); Spel.passen(K);
  assert.equal(Spel.terug(K), true, 'na een pas mag het nog');
  assert.deepEqual(inSpel(K).sort(), [0, 1, 2, 3, 4]);
});

test('na ronde 3 is het potje uit', () => {
  const G = potje(1);
  G.round = Spel.ROUNDS;
  Spel.trek(G); Spel.geraden(G);
  assert.equal(Spel.rondeEinde(G).uit, true);
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
  assert.equal(Spel.herstel({ ...opslag, mode: 'uit' }, t).mode, 'uit', 'de eindstand komt terug als eindstand');
});

test('onderbreken: punten blijven, de kaart in beeld komt als eerste terug', () => {
  const G = potje(6);
  const team = G.team;
  Spel.trek(G);
  Spel.geraden(G);
  Spel.geraden(G);
  const inBeeld = G.card;
  const kaarten = inSpel(G);
  Spel.onderbreek(G, 12345.6);
  assert.equal(G.card, null);
  assert.equal(G.pile[0], inBeeld, 'de kaart in beeld ligt bovenop');
  assert.deepEqual(inSpel(G), kaarten, 'geen kaart kwijt of dubbel');
  assert.equal(G.scores[team][0], 2, 'de punten van de halve beurt blijven');
  assert.equal(G.gained, 0);
  assert.equal(G.vorige, null);
  assert.equal(G.team, team, 'dezelfde ploeg speelt verder');
  assert.equal(G.pendingMs, 12346);
  assert.equal(Spel.beurtMs(G), 12346, 'de volgende beurt krijgt de resttijd');
});

test('onderbreken: een bijna lege klok krijgt de ondergrens', () => {
  const G = potje(6);
  Spel.trek(G);
  Spel.onderbreek(G, 400);
  assert.equal(G.pendingMs, Spel.MIN_REST);
});

test('onderbreken: komt via de opslag heel terug', () => {
  const G = potje(6);
  Spel.trek(G);
  Spel.geraden(G);
  Spel.onderbreek(G, 20000);
  const terug = Spel.herstel(JSON.parse(JSON.stringify({ t: 1000, mode: 'turn', G })), 2000);
  assert.ok(terug);
  assert.equal(terug.mode, 'turn');
  assert.deepEqual(terug.G.pile, G.pile);
  assert.deepEqual(terug.G.scores, G.scores);
  assert.equal(terug.G.pendingMs, 20000);
  assert.equal(terug.G.team, G.team);
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
      const k = rand();
      if (k < .6) { if (Spel.geraden(G).leeg) einde = 'leeg'; }
      else if (k < .75) Spel.terug(G);
      else Spel.passen(G);
    }
    if (einde === 'leeg') uit = Spel.rondeEinde(G, rand, rand() * 30000).uit;
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

/* ---- eigen kaarten ---- */
const eigenVan = (n, laatst = () => 0) =>
  Array.from({ length: n }, (_, i) => ({ id: 'f' + i, woord: 'eigen' + i, laatst: laatst(i) }));

test('eigen kaarten: standaard vier, bij elke maat van de greep', () => {
  for (const size of [16, 24, 32]) {
    const greep = Spel.drawDeck(DECKS, 'klein', size, [], rng(5), eigenVan(20));
    assert.equal(greep.length, size, 'de greep blijft even groot');
    assert.equal(greep.filter(c => Spel.eigenId(c) !== null).length, Spel.EIGEN_STANDAARD);
  }
  const weinig = Spel.drawDeck(DECKS, 'klein', 24, [], rng(5), eigenVan(2));
  assert.equal(weinig.filter(c => Spel.eigenId(c) !== null).length, 2, 'minder dan gevraagd: allemaal');
  assert.equal(weinig.length, 24);
});

test('eigen kaarten: het gekozen aantal, hetzelfde bij 16, 24 en 32, nooit meer dan er zijn', () => {
  const tel = g => g.filter(c => Spel.eigenId(c) !== null).length;
  assert.deepEqual(Spel.EIGEN_AANTALLEN, [0, 2, 4, 8]);
  for (const size of [16, 24, 32]) {
    Spel.EIGEN_AANTALLEN.forEach(n => {
      assert.equal(Spel.eigenAantal(size, n), n, '8 is de helft van 16, dus elke knop kan');
      const greep = Spel.drawDeck(DECKS, 'klein', size, [], rng(7), eigenVan(20), n);
      assert.equal(greep.length, size, 'de greep blijft even groot');
      assert.equal(tel(greep), n, `${n} bij ${size}`);
    });
  }
  // Nooit meer dan de helft van de greep, ook bij een kleinere greep.
  assert.equal(Spel.eigenAantal(10, 8), 5);
  // Minder eigen kaarten dan gevraagd: allemaal, de rest gewone.
  assert.equal(tel(Spel.drawDeck(DECKS, 'klein', 24, [], rng(7), eigenVan(5), 8)), 5);
  // Geen keuze of een onbekende: de standaard.
  assert.equal(tel(Spel.drawDeck(DECKS, 'klein', 24, [], rng(7), eigenVan(20), 6)), 4);
  assert.equal(tel(Spel.drawDeck(DECKS, 'klein', 24, [], rng(7), eigenVan(20), 1 / 4)), 4);
});

test('eigen kaarten: wie het langst niet kwam, gaat voor', () => {
  // f0..f5 net gespeeld, f6..f9 nooit of lang geleden.
  const eigen = eigenVan(10, i => (i < 6 ? 1000 + i : i - 6));
  const greep = Spel.drawDeck(DECKS, 'klein', 16, [], rng(9), eigen);
  const ids = greep.map(Spel.eigenId).filter(x => x !== null).sort();
  assert.deepEqual(ids, ['f6', 'f7', 'f8', 'f9']);
});

test('eigen kaarten: bij gelijke stand beslist het lot, herhaalbaar', () => {
  const a = Spel.eigenGreep(eigenVan(12), 16, rng(3)).map(k => k.id);
  const b = Spel.eigenGreep(eigenVan(12), 16, rng(3)).map(k => k.id);
  const c = Spel.eigenGreep(eigenVan(12), 16, rng(4)).map(k => k.id);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test('eigen kaarten: hetzelfde woord als een gewone kaart, de eigen wint', () => {
  // 'Klein3' in andere hoofdletters: het woord telt, niet de schrijfwijze.
  const eigen = [{ id: 'hond', woord: 'Klein3', laatst: 0 }];
  for (let s = 1; s < 30; s++) {
    const greep = Spel.drawDeck(DECKS, 'klein', 32, [], rng(s), eigen);
    assert.equal(greep.filter(c => c[1].toLowerCase() === 'klein3').length, 1);
    assert.equal(greep.find(c => c[1].toLowerCase() === 'klein3')[0], Spel.EIGEN + 'hond');
  }
});

test('eigen kaarten: zonder eigen kaarten trekt drawDeck precies als voorheen', () => {
  const zonder = Spel.drawDeck(DECKS, 'midden', 24, [], rng(11));
  const leeg = Spel.drawDeck(DECKS, 'midden', 24, [], rng(11), []);
  assert.deepEqual(zonder, leeg);
});

test('gewone kaarten: Nog een keer deelt eerst wat het langst niet kwam', () => {
  // Klein heeft 50 kaarten: twee potjes van 24 delen er niets van, het
  // derde neemt de 2 die nooit kwamen en dan de 22 oudste van potje 1.
  const gezien = {};
  const potjes = [];
  for (let i = 1; i <= 3; i++) {
    const greep = Spel.drawDeck(DECKS, 'klein', 24, [], rng(20 + i), [], 4, gezien);
    greep.forEach(c => { gezien[c[1]] = i; });
    potjes.push(new Set(greep.map(c => c[1])));
  }
  const samen = (a, b) => [...a].filter(w => b.has(w)).length;
  assert.equal(samen(potjes[0], potjes[1]), 0);
  assert.equal(samen(potjes[1], potjes[2]), 0);
  assert.equal(samen(potjes[0], potjes[2]), 22);
});

test('gewone kaarten: met eigen kaarten erbij geldt hetzelfde voor de rest', () => {
  const gezien = {};
  DECKS.klein.slice(0, 30).forEach(c => { gezien[c[1]] = 5; });
  const eigen = [{ id: 'a', woord: 'oma', laatst: 0 }, { id: 'b', woord: 'opa', laatst: 0 }];
  const greep = Spel.drawDeck(DECKS, 'klein', 16, [], rng(4), eigen, 2, gezien);
  assert.equal(greep.length, 16);
  // De 14 gewone komen uit de 20 die nooit gezien zijn.
  assert.ok(greep.filter(c => Spel.eigenId(c) === null).every(c => !gezien[c[1]]));
});

test('gewone kaarten: zonder geheugen trekt drawDeck als voorheen', () => {
  assert.deepEqual(Spel.drawDeck(DECKS, 'midden', 24, [], rng(12)),
                   Spel.drawDeck(DECKS, 'midden', 24, [], rng(12), [], 4, undefined));
  // Een leeg geheugen houdt het lot: de volgorde blijft die van de schudding.
  assert.deepEqual(Spel.drawDeck(DECKS, 'midden', 24, [], rng(12)),
                   Spel.drawDeck(DECKS, 'midden', 24, [], rng(12), [], 4, {}));
});

test('eigenId: alleen het voorvoegsel telt, geen emoji', () => {
  assert.equal(Spel.eigenId([Spel.EIGEN + 'abc', 'oma']), 'abc');
  assert.equal(Spel.eigenId(['🐶', 'hond']), null);
  assert.equal(Spel.eigenId(['#️⃣', 'hekje']), null);
});

test('zonder: een eigen kaart zonder beeld gaat uit de stapel', () => {
  const deck = [['🐶', 'hond'], [Spel.EIGEN + 'a', 'oma'], [Spel.EIGEN + 'b', 'opa'], ['🐱', 'kat']];
  const G = Spel.nieuw(deck, 30, rng(2));
  Spel.beurtKlaar(G);
  assert.equal(Spel.zonder(G, id => id === 'a'), 3);
  assert.ok(!G.pile.includes(1), 'oma is weg');
  assert.ok(G.pile.includes(2), 'opa blijft');
});

test('herstel: eigen kaarten zonder beeld vallen eruit, en niets over is geen spel', () => {
  const t = 5000;
  const deck = [[Spel.EIGEN + 'a', 'oma'], ['🐶', 'hond']];
  const G = Spel.nieuw(deck, 30, rng(1));
  const opslag = () => JSON.parse(JSON.stringify({ t, mode: 'turn', G }));
  const h = Spel.herstel(opslag(), t, id => id === 'a');
  assert.deepEqual(h.G.pile, [1]);
  assert.deepEqual(Spel.herstel(opslag(), t, () => false).G.pile.length, 2, 'met beeld blijft alles');
  const alleenOma = Spel.nieuw([[Spel.EIGEN + 'a', 'oma']], 30, rng(1));
  const s = JSON.parse(JSON.stringify({ t, mode: 'turn', G: alleenOma }));
  assert.equal(Spel.herstel(s, t, () => true), null);
  assert.notEqual(Spel.herstel({ ...s, mode: 'uit' }, t, () => true), null, 'een eindstand mag blijven');
});

/* Een update mag geen potje kosten. In test/opslag/ staat een potje zoals
   een uitgebrachte versie het echt bewaarde (midden in een beurt, via
   bewaarBeurt()). Wie de vorm van G of herstel() verandert, moet die nog
   steeds terugkrijgen; komt er een nieuwe vorm bij, dan komt er een bestand
   bij, en het oude blijft. */
test('herstel: een potje van een vorige versie komt terug', () => {
  const map = path.resolve(__dirname, 'opslag');
  const bestanden = fs.readdirSync(map).filter(f => /-potje\.json$/.test(f));
  assert.ok(bestanden.length > 0, 'geen bewaarde potjes in test/opslag');
  for (const f of bestanden) {
    const s = JSON.parse(fs.readFileSync(path.join(map, f), 'utf8'));
    const nu = Date.now();
    const h = Spel.herstel({ ...s, t: nu - 60000 }, nu);
    assert.ok(h, `${f}: herstel() geeft niets terug`);
    assert.equal(h.mode, s.mode, f);
    assert.deepEqual(h.G.deck, s.G.deck, f);
    assert.deepEqual(h.G.pile, s.G.pile, f);
    assert.deepEqual(h.G.scores, s.G.scores, f);
    assert.equal(h.G.team, s.G.team, f);
    assert.equal(h.G.round, s.G.round, f);
    assert.equal(h.G.pendingMs, s.G.pendingMs, f);
  }
});
