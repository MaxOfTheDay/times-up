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

  await browser.close();
  if (fails.length) { console.log('\nFOUT:\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
  console.log('  kaarten in orde');
})();
