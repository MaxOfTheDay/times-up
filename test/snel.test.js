/*
 * Snel op een trage telefoon. De app draait hier met de CPU vier keer
 * vertraagd, zoals een goedkope Android, en drie dingen hebben een budget:
 *
 * - de start: hoeveel script er loopt voor de titel te tikken is;
 * - een tik: hoe lang de handler van één tik rekent, en hoeveel daarvan de
 *   browser kwijt is aan opnieuw meten omdat er na een schrijfactie gelezen
 *   werd (geforceerde layout);
 * - rust: een scherm waarop niets beweegt, vraagt geen beelden aan
 *   (requestAnimationFrame), ook de eindstand niet als het feest voorbij is.
 *
 * Gemeten wordt script, nooit beelden per seconde: zonder grafische kaart
 * rastert de browser hier op de CPU, en dat is op een telefoon niet zo.
 * De budgetten schalen mee met de machine: een vaste rekensom (ijk())
 * zegt hoeveel trager deze machine is dan die waarop ze gezet zijn.
 * Zie docs/ontwerp.md, "Snel op een trage telefoon".
 *
 * Draaien: npm run test:snel   (of npm test voor alles)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { launch } = require('./browser');

const ROOT = path.resolve(__dirname, '..');

const CPU = 4;
/* Budgetten in ms bij CPU 4x op de machine van IJK_REF. */
const START_MS = 180;     // het script van een start, in lange beelden
const TIK_MS = 120;       // de handlers van één tik samen
const DWING_MS = 60;      // geforceerde layout binnen één tik
const IJK_REF = 170;      // ijk() op de machine waar de budgetten gezet zijn

/* Een tik die net over zijn budget gaat, kan een buurman op dezelfde machine
   zijn (een andere test, een CI-runner die gedeeld wordt): ijk() meet de
   machine één keer, aan het begin. Valt er iets om, dan meet de hele ronde
   nog een keer, en telt alleen wat beide keren omvalt. Een echte vertraging
   valt twee keer om; rust en fouten op de pagina zijn toch niet toevallig. */
let fails = [];
const ok = (c, m, sleutel) => { if (!c) fails.push({ m, sleutel: sleutel || m }); };

const meter = () => {
  window.__snel = { loaf: [], ev: [], raf: 0 };
  try {
    new PerformanceObserver(l => l.getEntries().forEach(e => __snel.loaf.push({
      s: e.startTime, d: e.duration,
      scripts: e.scripts.map(x => ({ soort: x.invokerType, wie: x.invoker, d: x.duration, dwing: x.forcedStyleAndLayoutDuration }))
    }))).observe({ type: 'long-animation-frame', buffered: true });
    new PerformanceObserver(l => l.getEntries().forEach(e => {
      if (e.interactionId) __snel.ev.push({ id: e.interactionId, s: e.startTime, d: e.duration, reken: e.processingEnd - e.processingStart });
    })).observe({ type: 'event', durationThreshold: 16, buffered: true });
  } catch (e) {}
  const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = function (f) { __snel.raf++; return raf.call(window, f); };
};

/* Een vaste rekensom onder dezelfde vertraging: hoeveel trager is deze
   machine dan de ijkmachine? Nooit sneller rekenen dan 1. */
async function ijk(page) {
  const ms = await page.evaluate(() => {
    const t = performance.now(); let x = 0;
    for (let i = 0; i < 3e6; i++) x += Math.sqrt(i) % 7;
    return (performance.now() - t) + (x < 0 ? 1 : 0);
  });
  return Math.max(1, ms / IJK_REF);
}

/* Over http en niet als file://: op een pagina zonder herkomst noemt de
   browser geen enkel script in zijn lange beelden. */
function server() {
  return new Promise(klaar => {
    const srv = http.createServer((q, r) => {
      const f = q.url.split('?')[0] === '/sw.js' ? 'sw.js' : 'index.html';
      r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' });
      r.end(fs.readFileSync(path.join(ROOT, f)));
    }).listen(0, '127.0.0.1', () => klaar(srv));
  });
}

async function ronde(srv) {
  fails = [];
  const APP_URL = `http://127.0.0.1:${srv.address().port}/index.html?debug`;
  const browser = await launch();
  /* ---- de start ----
     De tweede, in een nieuw proces met de opslag van de eerste: zo opent
     een speler de app. Een herlaadbeurt in hetzelfde proces heeft alles al
     eens getekend. De eerste start in een browser mag één keer meer doen
     (zonderLeegVak()). */
  const maat = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true };
  const eerst = await browser.newContext(maat);
  const p0 = await eerst.newPage();
  await p0.goto(APP_URL);
  await p0.waitForTimeout(1500);
  const opslag = await eerst.storageState();
  await eerst.close();
  const ctx = await browser.newContext(Object.assign({ storageState: opslag }, maat));
  await ctx.addInitScript(meter);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(APP_URL);
  await page.waitForTimeout(2500);
  const f = await ijk(page);
  const start = await page.evaluate(() => __snel.loaf.flatMap(l => l.scripts)
    .filter(s => s.soort === 'classic-script').reduce((a, s) => a + s.d, 0));
  ok(start <= START_MS * f, `start: ${Math.round(start)} ms script voor de titel (budget ${Math.round(START_MS * f)})`, 'start');

  /* ---- tikken ---- */
  const scherm = () => page.evaluate(() => window.__tijd.screen);
  const tik = async (sel, ms = 700) => { await page.click(sel, { force: true }); await page.waitForTimeout(ms); };
  // Rust op een scherm: geen enkel beeld aangevraagd in twee tellen.
  const rust = async naam => {
    const a = await page.evaluate(() => __snel.raf);
    await page.waitForTimeout(2000);
    const n = (await page.evaluate(() => __snel.raf)) - a;
    ok(n === 0, `rust: ${naam} vraagt ${n} beelden in 2 s, terwijl er niets beweegt`, `rust ${naam}`);
  };
  await page.waitForTimeout(1500);
  await rust('de titel');
  await tik('#btnGear', 900);
  await rust('instellingen');
  await tik('#rijGewoon', 900);
  await tik('#btnKaartenTerug', 900);
  await tik('#sizeChips .chip[data-size="16"]', 300);
  await tik('#btnBack', 900);
  await tik('#btnStart', 5000);
  ok(await scherm() === 'handoff', 'na Spelen niet op de overdracht');
  await rust('de overdracht');
  await tik('#btnStartTurn', 200);
  await page.waitForFunction(() => document.querySelector('#countdown').hidden && window.__tijd.G.card !== null, null, { timeout: 20000 });
  await page.waitForTimeout(600);
  for (let i = 0; i < 6; i++) await tik(i === 2 ? '#btnPas' : '#btnGoed', 600);
  await tik('#btnPauze', 1200);
  await rust('de pauze');
  await tik('#btnResume', 1500);

  /* ---- de eindstand: laatste ronde leeg spelen ---- */
  await page.evaluate(() => { window.__tijd.zetStraalFeest(1500); window.__tijd.G.round = 3; });
  for (let i = 0; i < 40 && await scherm() === 'play'; i++) await tik('#btnGoed', 350);
  await page.waitForFunction(() => window.__tijd.screen === 'winner', null, { timeout: 20000 });
  await page.waitForTimeout(9000);   // optellen, kroon, fanfare en de stralen uit laten lopen
  await rust('de eindstand na het feest');

  const tikken = await page.evaluate(() => {
    const per = new Map();
    for (const e of __snel.ev) {
      const o = per.get(e.id) || { s: e.s, eind: e.s + e.d, reken: 0 };
      o.reken += e.reken; o.eind = Math.max(o.eind, e.s + e.d); per.set(e.id, o);
    }
    return [...per.values()].map(o => {
      const scripts = __snel.loaf.filter(l => l.s < o.eind && l.s + l.d > o.s).flatMap(l => l.scripts)
        .filter(s => s.soort === 'event-listener');
      return { reken: o.reken, dwing: scripts.reduce((a, s) => a + (s.dwing || 0), 0),
               wie: scripts.map(s => s.wie).filter((w, i, a) => a.indexOf(w) === i).join(' ') };
    });
  });
  ok(tikken.length >= 12, `tikken: maar ${tikken.length} gemeten`, 'tikken');
  for (const t of tikken) {
    ok(t.reken <= TIK_MS * f, `tik ${t.wie || '?'}: ${Math.round(t.reken)} ms rekenen (budget ${Math.round(TIK_MS * f)})`, `reken ${t.wie}`);
    ok(t.dwing <= DWING_MS * f, `tik ${t.wie || '?'}: ${Math.round(t.dwing)} ms geforceerde layout (budget ${Math.round(DWING_MS * f)})`, `dwing ${t.wie}`);
  }
  ok(!errs.length, 'fouten: ' + errs.join('; '), 'fouten');

  const zwaarst = tikken.reduce((a, t) => t.reken > a.reken ? t : a, { reken: 0, wie: '' });
  await browser.close();
  return { fails, regel: `start ${Math.round(start)} ms, zwaarste tik ${Math.round(zwaarst.reken)} ms (${zwaarst.wie}), machine x${f.toFixed(2)}` };
}

(async () => {
  const srv = await server();
  const een = await ronde(srv);
  let blijft = een.fails, regel = een.regel;
  if (blijft.length) {
    console.log('  over budget, nog een keer meten: ' + blijft.map(x => x.m).join('; '));
    const twee = await ronde(srv);
    blijft = twee.fails.filter(x => een.fails.some(y => y.sleutel === x.sleutel));
    regel = twee.regel;
  }
  srv.close();
  if (blijft.length) { console.log('\nFOUT (twee keer):\n' + blijft.map(x => ' - ' + x.m).join('\n')); process.exit(1); }
  console.log(`  snel in orde: ${regel}`);
})();
