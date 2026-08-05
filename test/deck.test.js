/*
 * Test-suite voor de kaarten.
 *
 * De twee regels uit het ontwerp zijn hier hard gemaakt, want ze zijn met het
 * blote oog niet te controleren over ruim 200 kaarten:
 *
 *   1. elk tier heeft minstens 60 kaarten, zonder dubbele emoji of woorden;
 *   2. elke emoji tekent ook echt. Een kaart die als ▯ verschijnt is
 *      onspeelbaar voor een kind dat niet kan lezen, en een reservebeeld is
 *      er bewust niet. We meten de glyphbreedte en vergelijken die met een
 *      teken dat gegarandeerd ontbreekt.
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
    const D = window.__tijd.DECKS;
    const out = {};
    for (const k of Object.keys(D)) {
      const emo = D[k].map(c => c[0]), words = D[k].map(c => c[1]);
      out[k] = {
        n: D[k].length,
        dupEmoji: emo.filter((e, i) => emo.indexOf(e) !== i),
        dupWord: words.filter((w, i) => words.indexOf(w) !== i),
        bad: D[k].filter(c => c.length !== 2 || !c[0] || !c[1]).length,
      };
    }
    return out;
  });

  for (const [tier, i] of Object.entries(info)) {
    ok(i.n >= 60, `${tier}: maar ${i.n} kaarten (>= 60 vereist)`);
    ok(!i.dupEmoji.length, `${tier}: dubbele emoji ${i.dupEmoji}`);
    ok(!i.dupWord.length, `${tier}: dubbele woorden ${i.dupWord}`);
    ok(!i.bad, `${tier}: ${i.bad} misvormde kaarten`);
    console.log(`  ${tier}: ${i.n} kaarten`);
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
