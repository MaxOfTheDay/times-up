/*
 * Test-suite voor de kaarten.
 *
 * Wat hier hard gemaakt is, omdat het met het blote oog niet te controleren
 * is over ruim 250 kaarten:
 *
 *   1. elke tier heeft minstens 60 kaarten;
 *   2. geen dubbele emoji of woorden -- en dat wordt getoetst op de pool
 *      waarmee echt gespeeld wordt, niet op elke tier apart. Sinds poolFor()
 *      speelt een tier met zijn eigen kaarten én die eronder, dus een kaart
 *      die in twee aangrenzende tiers staat zit twee keer in één potje. Dat
 *      is precies hoe "hamer" (klein + midden) en "slapen" (midden + groot)
 *      lang onopgemerkt bleven: per tier klopte het;
 *   3. elke emoji tekent ook echt. Een kaart die als ▯ verschijnt is
 *      onspeelbaar voor een kind dat niet kan lezen, en een reservebeeld is
 *      er bewust niet. We meten de glyphbreedte en vergelijken die met een
 *      teken dat gegarandeerd ontbreekt.
 *
 * Wat hier NIET getoetst wordt, en waar CLAUDE.md ten onrechte anders over
 * beweerde:
 *
 *   - "één betekenis los van context" is een ontwerpregel voor mensen; geen
 *     test kan dat zien;
 *   - de bovengrens op de Unicode-versie. De controle hieronder meet of een
 *     glyph tekent op de máchine die de test draait, en die heeft een verse
 *     letterfamilie. Een splinternieuwe emoji komt hier dus glansrijk door
 *     en staat op een oude tablet alsnog als ▯. Dat blijft een kwestie van
 *     kiezen met verstand en één keer op het echte toestel kijken.
 *
 * Draaien: npm run test:kaarten   (of npm test voor alles)
 */
const { launch, APP_URL } = require('./browser');

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

(async () => {
  const browser = await launch();
  const page = await browser.newPage();
  await page.goto(APP_URL);
  await page.waitForTimeout(200);

  const info = await page.evaluate(() => {
    const { DECKS, TIER_ORDER, poolFor } = window.__tijd;
    const out = {};
    for (const k of TIER_ORDER) {
      // De pool waarmee die tier echt speelt: zichzelf plus de tier eronder.
      const pool = poolFor(k);
      const emo = pool.map(c => c[0]), words = pool.map(c => c[1]);
      out[k] = {
        eigen: DECKS[k].length,
        n: pool.length,
        dupEmoji: [...new Set(emo.filter((e, i) => emo.indexOf(e) !== i))],
        dupWord: [...new Set(words.filter((w, i) => words.indexOf(w) !== i))],
        bad: pool.filter(c => c.length !== 2 || !c[0] || !c[1]).length,
      };
    }
    return out;
  });

  for (const [tier, i] of Object.entries(info)) {
    ok(i.eigen >= 60, `${tier}: maar ${i.eigen} eigen kaarten (>= 60 vereist)`);
    ok(!i.dupEmoji.length, `${tier}: dubbele emoji in de pool ${i.dupEmoji}`);
    ok(!i.dupWord.length, `${tier}: dubbele woorden in de pool ${i.dupWord}`);
    ok(!i.bad, `${tier}: ${i.bad} misvormde kaarten`);
    console.log(`  ${tier}: ${i.eigen} eigen, ${i.n} in de pool`);
  }

  const tofu = await page.evaluate(() => {
    const cv = document.createElement('canvas').getContext('2d');
    cv.font = '64px sans-serif';
    const ref = cv.measureText('\u{10FFFD}').width;   // bestaat nooit
    const out = [];
    const D = window.__tijd.DECKS;
    for (const k of Object.keys(D))
      for (const [e, w] of D[k])
        if (Math.abs(cv.measureText(e).width - ref) < 0.5) out.push(`${k}:${e}=${w}`);
    return out;
  });
  ok(!tofu.length, 'emoji zonder glyph: ' + tofu.join(', '));

  /* ------------------------------------------------------------------
   * De kaartenbak: wat de volwassene weglegt, komt niet meer langs.
   *
   * Dit is de enige plek in de app waar een keuze van de volwassene een
   * kaart uit het spel houdt, en ze is met het blote oog niet te
   * controleren: je zou tweehonderd potjes moeten spelen om te zien of
   * "boom" echt weg is.
   * ------------------------------------------------------------------ */
  const bak = await page.evaluate(() => {
    const T = window.__tijd;
    const zet = w => { T.settings.hidden = w; };
    const out = {};

    zet([]);
    out.vol = T.bakFor('klein').length;

    // Eén kaart weg: uit de bak van elke stand waar ze in zit, en uit elk
    // potje dat daarna getrokken wordt.
    zet(['boom']);
    out.naEen = T.bakFor('klein').length;
    out.inPotjes = false;
    for (let i = 0; i < 300; i++)
      if (T.drawDeck('klein', 32).some(c => c[1] === 'boom')) out.inPotjes = true;
    // "boom" is een makkelijke kaart: die zit in Makkelijk en in Medium,
    // en niet in Moeilijk. De bak van Moeilijk hoort dus niet te krimpen.
    out.medium = T.poolFor('midden').length - T.bakFor('midden').length;
    out.moeilijk = T.poolFor('groot').length - T.bakFor('groot').length;

    // De ondergrens kijkt naar álle drie de standen, ook die waar je nu
    // niet in staat: anders leeg je vanuit Medium (183 kaarten) de bak van
    // Makkelijk (90) zonder dat er ooit iets tegenhoudt.
    zet(window.__tijd.DECKS.klein.slice(0, 50).map(c => c[1]));
    out.kleinOver = T.bakFor('klein').length;
    out.nogEenMakkelijke = T.canHide(window.__tijd.DECKS.klein[50][1]);
    out.nogEenMoeilijke = T.canHide(window.__tijd.DECKS.groot[0][1]);

    zet([]);
    return out;
  });

  ok(bak.naEen === bak.vol - 1, `een weggelegde kaart verdwijnt niet uit de bak (${bak.vol} -> ${bak.naEen})`);
  ok(!bak.inPotjes, 'een weggelegde kaart wordt in 300 potjes tóch nog getrokken');
  ok(bak.medium === 1, 'een weggelegde makkelijke kaart zit nog in de bak van Medium');
  ok(bak.moeilijk === 0, 'een weggelegde makkelijke kaart krimpt de bak van Moeilijk, en die kent haar niet eens');
  ok(bak.kleinOver === 40, `Makkelijk houdt ${bak.kleinOver} kaarten over in plaats van 40`);
  ok(!bak.nogEenMakkelijke, 'de ondergrens van 40 laat er tóch nog een makkelijke kaart uit');
  ok(bak.nogEenMoeilijke, 'de ondergrens houdt een moeilijke kaart tegen terwijl Makkelijk daar niet door krimpt');

  await browser.close();
  if (fails.length) { console.log('\nFOUT:\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
  console.log('  kaarten in orde');
})();
