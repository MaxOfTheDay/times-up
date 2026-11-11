/*
 * Het toestel dat stil iets breekt. Elke regel van STANDEN bootst één stand
 * van een telefoon, browser of andere app na, en toetst wat de speler dan
 * ziet of hoort. Geen van deze fouten gooit een uitzondering of komt in de
 * foutenbak: de app ziet er gewoon kapot uit terwijl de code "werkt". Een
 * nieuwe valkuil is een nieuwe regel. Zie docs/ontwerp.md, "Het toestel".
 *
 * Draaien: npm run test:toestel   (of npm test voor alles)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { launch, APP_URL } = require('./browser');

const ROOT = path.resolve(__dirname, '..');
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

/* Een wifi met een inlogpagina: eerst gewoon net, dan stuurt elke vraag
   door naar de eigen pagina van het hotel, die met 200 antwoordt. */
async function inlogWifi(browser) {
  let stand = 'net';
  const srv = http.createServer((q, r) => {
    if (stand === 'hotel') {
      if (q.url.startsWith('/login')) { r.writeHead(200, { 'content-type': 'text/html' }); return r.end('<h1>Hotel: log in</h1>'); }
      r.writeHead(302, { location: '/login' }); return r.end();
    }
    const f = q.url.split('?')[0] === '/sw.js' ? 'sw.js' : 'index.html';
    r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' });
    r.end(fs.readFileSync(path.join(ROOT, f)));
  });
  await new Promise(k => srv.listen(0, k));
  const url = `http://localhost:${srv.address().port}/`;
  const page = await (await browser.newContext()).newPage();
  try {
    await page.goto(url);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForTimeout(800);
    stand = 'hotel';
    await page.reload(); await page.waitForTimeout(800);
    const kast = await page.evaluate(async () => {
      const r = await caches.match(new URL('.', location.href).href);
      return r ? r.text() : '';
    });
    ok(kast.includes('id="spelkern"'), 'inlogwifi: de inlogpagina staat in de kast van de service worker');
    stand = 'net';
    await page.reload().catch(() => {}); await page.waitForTimeout(500);
    ok(await page.evaluate(() => !!document.getElementById('spelkern')),
       'inlogwifi: de start na de inlogpagina toont de app niet');
  } finally { srv.close(); await page.context().close(); }
}

/* Chrome "Websites donker maken" (en Samsung Internet in donkere modus). */
async function gedwongenDonker() {
  const browser = await launch({ args: ['--enable-features=WebContentsForceDark'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  await page.goto(APP_URL); await page.waitForTimeout(600);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 40, height: 40 } });
  const licht = await page.evaluate(async b64 => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0;
    for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3;
    return s / (d.length / 4);
  }, png.toString('base64'));
  ok(licht > 180, `gedwongen donker: het papier is donker geworden (helderheid ${Math.round(licht)})`);
  await browser.close();
}

/* De fotokast hapert één keer bij het opstarten, zoals een iPhone na de
   achtergrond. */
async function opslagHapert(browser) {
  const page = await (await browser.newContext()).newPage();
  await page.addInitScript(() => {
    const open = IDBFactory.prototype.open; let n = 0;
    IDBFactory.prototype.open = function (...a) {
      if (n++ > 0) return open.apply(this, a);
      const r = {};
      setTimeout(() => { r.error = new DOMException('Connection to Indexed Database server lost', 'UnknownError'); r.onerror && r.onerror(); });
      return r;
    };
  });
  await page.goto(APP_URL); await page.waitForTimeout(600);
  ok(!(await page.evaluate(() => eigenStuk)), 'opslag hapert: één mislukte verbinding verbergt de eigen kaarten');
  const zet = await page.evaluate(() => Beeld.zet('t', new Blob(['x'])).then(() => 'ok', e => e.message));
  ok(zet === 'ok', 'opslag hapert: bewaren blijft mislukken na één mislukte verbinding: ' + zet);
  await page.context().close();
}

/* Een andere app heeft het geluid (telefoontje, Siri, muziek): de context
   staat stil en resume() lukt niet. Er mag niets in de rij gaan staan. */
async function geluidBezet() {
  const browser = await launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    const P = AudioContext.prototype, maak = P.createOscillator;
    window.__osc = 0;
    P.createOscillator = function () { window.__osc++; return maak.call(this); };
  });
  await page.goto(APP_URL); await page.waitForTimeout(400);
  const r = await page.evaluate(async () => {
    const c = Snd.unlock(); await new Promise(k => setTimeout(k, 200));
    await c.suspend();
    const echt = c.resume; let pogingen = 0;
    c.resume = () => { pogingen++; return new Promise(() => {}); };
    /* page.evaluate telt als een tik; die vervalt na vijf tellen. */
    await new Promise(k => setTimeout(k, 5500));
    window.__osc = 0;
    for (let i = 0; i < 5; i++) { Snd.goed(i); await new Promise(k => setTimeout(k, 50)); }
    Snd.timeUp();
    const r = { osc: window.__osc, pogingen };
    c.resume = echt;
    return r;
  });
  ok(r.osc === 0, `geluid bezet: ${r.osc} tonen in de rij, die straks in één klap klinken`);
  ok(r.pogingen > 0, 'geluid bezet: de app probeert de context niet meer te wekken');
  await browser.close();
}

/* Een iPhone met de app op het beginscherm vóór iOS 18.4: het wakker houden
   wordt beloofd en niet gehouden. Het scherm vergrendelt midden in een
   beurt zonder aanraking; dat moet als één regel naar de foutenbak. */
async function schermSlaapt(browser) {
  const page = await (await browser.newContext()).newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: {
      request: async () => ({ released: false, release: async () => {} }) } });
  });
  await page.goto(APP_URL); await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.waitForTimeout(600);
  await page.click('#btnStartTurn');
  await page.waitForFunction(() => document.querySelector('#countdown').hidden === false, null, { timeout: 5000 });
  await page.waitForFunction(() => document.querySelector('#countdown').hidden, null, { timeout: 10000 });
  const meld = async na => page.evaluate(async na => {
    window.__meld = []; window.meldFout = b => window.__meld.push(b);
    SLAAP_MS = 400; await new Promise(k => setTimeout(k, na));
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    const uit = window.__meld;
    delete document.visibilityState; delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
    return uit;
  }, na);
  const stil = await meld(600);
  ok(stil.some(b => /scherm sliep in een beurt \(wake lock aan\)/.test(b)),
     'scherm slaapt: een vergrendeling midden in een beurt komt niet in de foutenbak: ' + JSON.stringify(stil));
  await page.context().close();
}

/* Een tablet met Android 9 of 10 kent de emoji uit Unicode 12 en 13 niet en
   tekent ze als het lege vak. Die kaarten mogen niet in de bak. */
async function oudToestel(browser) {
  const page = await (await browser.newContext()).newPage();
  await page.addInitScript(() => {
    const oud = new Set(['🦩', '🦭', '🪑', '\u{10FFFD}']);
    const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, x, y, ...r) {
      if (oud.has(t)) { this.fillRect(x, y, 12, 18); return; }
      return f.call(this, t, x, y, ...r);
    };
  });
  await page.goto(APP_URL); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const alle = TIER_ORDER.flatMap(t => DECKS[t]);
    return { n: alle.length, vak: alle.filter(k => ['🦩', '🦭', '🪑'].includes(k[0])).length };
  });
  ok(r.vak === 0, `oud toestel: ${r.vak} kaarten met een leeg vak blijven in de bak`);
  ok(r.n > 250, `oud toestel: de controle haalde ${r.n} kaarten over, te veel weg`);
  await page.context().close();
}

(async () => {
  const browser = await launch();
  const STANDEN = [
    ['inlogwifi', () => inlogWifi(browser)],
    ['gedwongen donker', gedwongenDonker],
    ['opslag hapert', () => opslagHapert(browser)],
    ['geluid bezet', geluidBezet],
    ['scherm slaapt', () => schermSlaapt(browser)],
    ['oud toestel', () => oudToestel(browser)],
  ];
  for (const [naam, toets] of STANDEN) {
    try { await toets(); }
    catch (e) { fails.push(`${naam}: ${e.message.split('\n')[0]}`); }
  }
  await browser.close();
  if (fails.length) { console.log('\nFOUT:\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
  console.log(`  toestel in orde (${STANDEN.length} standen)`);
})();
