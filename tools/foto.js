/*
 * Rendert de schermen die ertoe doen, in de drie maten uit CLAUDE.md, en
 * zet ze per maat op één contactblad. Daarnaast meet hij de missers die
 * hier eerder door kijken gevonden werden, zodat je niet meer hoeft te
 * zoeken waar je naar moet kijken:
 *
 *   - een knop die in beeld is, maar (deels) buiten het scherm valt;
 *   - een mascotte of teken van 0 bij 0 px;
 *   - de hoofdknop van het scherm die onder een ander stuk ligt.
 *
 *   node tools/foto.js            (of: npm run foto)
 *   node tools/foto.js --scherp   op 2x, om te delen
 *
 * Uit: foto/<maat>/<stand>.png en foto/<maat>.png (het contactblad).
 * foto/ staat in .gitignore. Een misser zet de exitcode op 1; het
 * contactblad komt er dan toch, want kijken blijft de controle die telt.
 */
const fs = require('fs');
const path = require('path');
const { launch, APP_URL } = require('../test/browser.js');

const MATEN = [['staand', 390, 844], ['liggend', 844, 390], ['klein', 320, 568]];
const SCHAAL = process.argv.includes('--scherp') ? 2 : 1;
const UIT = path.resolve(__dirname, '..', 'foto');

/* Wat er op een scherm in beeld is en dus binnen het scherm moet liggen. */
function meet(primair) {
  const fout = [];
  const zichtbaar = el => {
    if (el.closest('[hidden], [inert]')) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility !== 'visible' || +cs.opacity === 0 || cs.display === 'none') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const naam = el => '#' + (el.id || (el.className.baseVal ?? el.className).toString().split(' ')[0] || el.tagName);
  const scherm = document.querySelector('.screen.on');
  const binnen = [...document.querySelectorAll('.screen.on button, .overlay:not([hidden]) button, #countdown:not([hidden]) button')];
  for (const k of binnen) {
    if (!zichtbaar(k)) continue;
    const r = k.getBoundingClientRect();
    /* Een rij in een lijst die scrolt, mag onder de rand doorlopen. */
    if (k.closest('.lijst, .kaarten-raster, [data-scroll]')) continue;
    const scrolt = el => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return true; } return false; };
    if (scrolt(k)) continue;
    if (r.left < -.5 || r.top < -.5 || r.right > innerWidth + .5 || r.bottom > innerHeight + .5)
      fout.push(`${naam(k)} valt buiten het scherm (${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)})`);
  }
  for (const s of document.querySelectorAll('.screen.on svg, .overlay:not([hidden]) svg')) {
    if (s.closest('[hidden]') || getComputedStyle(s).display === 'none') continue;
    const r = s.getBoundingClientRect();
    const ouder = s.parentElement.getBoundingClientRect();
    if ((r.width === 0 || r.height === 0) && ouder.width > 0 && ouder.height > 0 && getComputedStyle(s).visibility === 'visible')
      fout.push(`${naam(s.parentElement)} heeft een svg van 0 bij 0`);
  }
  const p = primair && document.querySelector(primair);
  if (p && zichtbaar(p) && !p.closest('[inert]')) {
    const r = p.getBoundingClientRect();
    const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const t = document.elementFromPoint(x, y);
    if (t && t !== p && !p.contains(t)) fout.push(`${primair} ligt onder ${naam(t)}`);
  }
  return { scherm: scherm && scherm.id, fout };
}

async function standen(page) {
  const T = fn => page.evaluate(fn);
  const wacht = ms => page.waitForTimeout(ms);
  const tik = async s => { await page.click(s); };
  /* Elke stand: hoe je er komt, en welke knop er niet bedekt mag zijn. */
  return [
    ['titel', async () => { await wacht(1600); }, '#btnStart'],
    ['instellingen', async () => { await tik('#btnGear'); await wacht(500); }, '#btnBack'],
    ['kaarten', async () => { await tik('#rijGewoon'); await wacht(500); }, '#btnKaartenTerug'],
    ['maker', async () => { await tik('#btnKaartenTerug'); await wacht(300); await T(() => __tijd.openMaker()); await wacht(700); }, null],
    ['overdracht', async () => {
      await page.goto(APP_URL); await wacht(400);
      await tik('#btnStart'); await wacht(2600);
    }, '#btnStartTurn'],
    ['aftellen', async () => { await tik('#btnStartTurn'); await wacht(1300); }, null],
    ['spelen', async () => {
      await page.waitForFunction(() => document.querySelector('#countdown').hidden, null, { timeout: 10000 });
      await wacht(600);
    }, '#btnGoed'],
    ['pauze', async () => { await tik('#btnPauze'); await wacht(900); }, '#btnResume'],
    ['tijd-om', async () => { await tik('#btnResume'); await wacht(900); await T(() => __tijd.timeUp()); await wacht(500); }, null],
    ['beurtwissel', async () => { await wacht(2600); }, '#btnStartTurn'],
    ['eindstand', async () => {
      await T(() => { __tijd.G.scores = [[5, 4, 3], [2, 2, 1]]; __tijd.winner(); });
      await wacht(5500);
    }, '#btnAgain']
  ];
}

(async () => {
  fs.rmSync(UIT, { recursive: true, force: true });
  const browser = await launch();
  const missers = [];
  for (const [maat, w, h] of MATEN) {
    const map = path.join(UIT, maat);
    fs.mkdirSync(map, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: SCHAAL, hasTouch: true });
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);   // een stand die niet komt, is een misser, geen wachten
    const fouten = [];
    page.on('pageerror', e => fouten.push(e.message));
    await page.goto(APP_URL);
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('tijdisom.settings', JSON.stringify({ secs: 30, size: 16 })); });
    await page.goto(APP_URL);
    const gemaakt = [];
    for (const [naam, ga, primair] of await standen(page)) {
      try { await ga(); } catch (e) { missers.push(`${maat}/${naam}: kwam er niet (${e.message.split('\n')[0]})`); continue; }
      const bestand = path.join(map, naam + '.png');
      await page.screenshot({ path: bestand });
      const m = await page.evaluate(meet, primair);
      m.fout.forEach(f => missers.push(`${maat}/${naam}: ${f}`));
      gemaakt.push([naam, bestand]);
    }
    fouten.forEach(f => missers.push(`${maat}: fout in de pagina: ${f}`));
    await ctx.close();

    /* Het contactblad: alle standen van deze maat naast elkaar. */
    const blad = await browser.newPage({ viewport: { width: 1600, height: 800 } });
    const tegels = gemaakt.map(([naam, b]) =>
      `<figure><img src="data:image/png;base64,${fs.readFileSync(b).toString('base64')}"><figcaption>${naam}</figcaption></figure>`).join('');
    const breed = w > h ? 360 : 200;
    await blad.setContent(`<!doctype html><style>
      body { margin: 0; padding: 16px; background: #ddd; font: 14px system-ui; display: flex; flex-wrap: wrap; gap: 16px; width: ${breed * 6 + 16 * 7}px }
      figure { margin: 0; width: ${breed}px } img { width: 100%; display: block; box-shadow: 0 0 0 1px #999 }
      figcaption { padding-top: 4px }</style>${tegels}`);
    await blad.waitForTimeout(200);
    await blad.screenshot({ path: path.join(UIT, maat + '.png'), fullPage: true });
    await blad.close();
  }
  await browser.close();
  console.log(`foto: ${MATEN.length} contactbladen in ${path.relative(process.cwd(), UIT)}/`);
  if (missers.length) {
    console.log(missers.map(m => '  MIS  ' + m).join('\n'));
    process.exit(1);
  }
  console.log('  geen missers gemeten; kijk nu zelf');
})();
