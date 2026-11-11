/*
 * De zintuigen als één stelsel: elke cue betekent één ding, overal.
 *
 * WOORDENBOEK hieronder is het woordenboek uit docs/ontwerp.md ("Eén
 * woordenboek voor de zintuigen"): per gebeurtenis het geluid, de trilling en
 * de plekken in index.html waar ze klinken. De test toetst vier dingen:
 *
 *  1. Elke aanroep van Snd.x() of Tril.x() staat in het woordenboek, en elke
 *     regel van het woordenboek bestaat nog (zonder browser).
 *  2. Twee gebeurtenissen klinken en trillen niet hetzelfde, behalve waar dat
 *     de bedoeling is (`zelfde`); een trilling komt van de ladder of is een
 *     benoemd ritme.
 *  3. Elke cue haalt een telefoonluidspreker: niet meer dan 8 dB onder goed()
 *     (de klok uitgezonderd), en geen piek boven -3 dBFS.
 *  4. In een gespeeld potje klinken nooit twee cues tegelijk, behalve de tik
 *     van de klok en de lange druk die onder de deur uitklinkt.
 *
 * Een nieuwe cue is een nieuwe regel in WOORDENBOEK, of een bestaande
 * gebeurtenis op een nieuwe plek.
 *
 * Draaien: npm run test:zintuigen   (of npm test voor alles)
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const zonderOpm = t => t
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:"'\\])\/\/[^\n]*/g, (m, a) => a + ' '.repeat(m.length - a.length));

const s0 = html.indexOf('<script id="spelkern">');
const hoofd = html.slice(html.indexOf('<script>', s0), html.lastIndexOf('</script>'));
const code = zonderOpm(hoofd);
const regels = code.split('\n');

// De blokken die de cues zelf maken: daarbinnen is een aanroep geen gebruik.
const blok = naam => {
  const a = code.indexOf('const ' + naam + ' = (() => {');
  const b = code.indexOf('\n})();', a);
  return [a, b];
};
const [sA, sB] = blok('Snd'), [tA, tB] = blok('Tril');

/* De methodes van Snd en Tril: de sleutels van het object dat ze teruggeven. */
function methodes(a, b) {
  const t = code.slice(a, b), r = t.lastIndexOf('return {');
  const uit = new Set();
  for (const m of t.slice(r).matchAll(/^\s{4}(?:(?:get|set) )?(\w+)\s*\(/gm)) uit.add(m[1]);
  return uit;
}

/* De plek: de laatste regel op kolom 0 die iets declareert. */
function plek(regel) {
  for (let i = regel; i >= 0; i--) {
    const l = regels[i];
    let m;
    if ((m = l.match(/^(?:async )?function (\w+)/))) return m[1];
    if ((m = l.match(/^(?:const|let) (\w+)/))) return m[1];
    if ((m = l.match(/^tikKnop\(\$\("([^"]+)"\)/))) return 'tikKnop ' + m[1];
    if ((m = l.match(/^\$\("([^"]+)"\)\.addEventListener\("(\w+)"/))) return m[1] + ' ' + m[2];
    if ((m = l.match(/^(?:document\.|window\.)?addEventListener\("(\w+)"/))) return 'addEventListener ' + m[1];
  }
  return '?';
}

function aanroepen() {
  const uit = [];
  for (const m of code.matchAll(/\b(Snd|Tril)\.(\w+)\s*\(/g)) {
    if ((m.index > sA && m.index < sB) || (m.index > tA && m.index < tB)) continue;
    const regel = code.slice(0, m.index).split('\n').length - 1;
    uit.push({ cue: m[1] + '.' + m[2], plek: plek(regel), regel: regel });
  }
  return uit;
}

/* De trillingen: per Tril-methode het argument van buzz(). */
function trillingen() {
  const t = code.slice(tA, tB), uit = {};
  for (const m of t.matchAll(/^\s{4}(\w+)\s*\(\)\s*\{\s*buzz\(([^)]*)\)/gm)) uit[m[1]] = JSON.parse(m[2]);
  return uit;
}

const sndBron = hoofd.slice(hoofd.indexOf('const Snd = (() => {'),
  hoofd.indexOf('\n})();', hoofd.indexOf('const Snd = (() => {')) + 6);
const { launch, APP_URL } = require('./browser');

/* ---------------------------------------------------------------
   Het woordenboek: gebeurtenis -> geluid, trilling, plekken.
   `zelfde` zegt met welke gebeurtenis ze bewust hetzelfde klinkt.
   --------------------------------------------------------------- */
const WOORDENBOEK = [
  { ev: 'goed',        zegt: 'geraden, verdiend',              snd: ['goed'], tril: ['tik'],  waar: ['tikKnop #btnGoed'] },
  { ev: 'voorproef',   zegt: 'zo klinkt / voelt het',          snd: ['goed'], tril: ['tik'],  waar: ['#chipGeluid click', '#chipTril click'], zelfde: 'goed' },
  { ev: 'pas',         zegt: 'overgeslagen',                   snd: ['pas'],  tril: ['pas'],  waar: ['tikKnop #btnPas'] },
  { ev: 'terug',       zegt: 'teruggenomen, onder de stapel',  snd: ['pas'],  tril: ['pas'],  waar: ['tikKnop #turnScore'], zelfde: 'pas' },
  { ev: 'nee',         zegt: 'dit kan niet',                   snd: ['nee'],  tril: ['nee'],  waar: ['nudge'] },
  { ev: 'al geteld',   zegt: 'dubbele tik, niet geteld',       snd: [],       tril: ['zag'],  waar: ['acts'] },
  { ev: 'haast',       zegt: 'de tijd loopt op',               snd: ['tick'], tril: ['tel'],  waar: ['runClock', 'paintClock'] },
  { ev: 'aftellen',    zegt: 'zet je klaar',                   snd: ['tick', 'count'], tril: ['tel'], waar: ['countdown'] },
  { ev: 'start',       zegt: 'de klok loopt',                  snd: ['go'],   tril: ['go'],   waar: ['handOffCountdown'] },
  { ev: 'verder',      zegt: 'de klok loopt weer',             snd: ['verder'], tril: ['go'], waar: ['sluitPauze'] },
  { ev: 'vasthouden',  zegt: 'blijf drukken',                  snd: ['houdAan', 'houdNaar', 'houdUit'], tril: ['ijk'], waar: ['holdButton'] },
  { ev: 'deur',        zegt: 'naar huis, onomkeerbaar',        snd: ['dicht'], tril: ['doe'], waar: ['holdButton'] },
  { ev: 'foto',        zegt: 'afgedrukt',                      snd: ['klik'], tril: ['klik'], waar: ['afdrukken'] },
  { ev: 'gelukt',      zegt: 'gekopieerd',                     snd: [],       tril: ['gelukt'], waar: ['kopieerLink'] },
  { ev: 'dier',        zegt: 'dit is Vos / Uil',               snd: ['ploeg', 'roep'], tril: ['dier'], waar: ['reeks'] },
  { ev: 'worp',        zegt: 'wie begint',                     snd: ['roep', 'ploeg'], tril: [], waar: ['tossTeams'] },
  { ev: 'beurtwissel', zegt: 'jouw buit, dan wie er nu is',    snd: ['tel', 'ploeg'], tril: [], waar: ['telBuit', 'turnEnd'] },
  { ev: 'rondewissel', zegt: 'een nieuwe ronde, dan wie',      snd: ['ronde', 'ploeg'], tril: [], waar: ['endRound'] },
  { ev: 'tijd om',     zegt: 'de beurt is voorbij',            snd: ['timeUp'], tril: ['om'], waar: ['timeUp'] },
  { ev: 'leeg',        zegt: 'de stapel is leeggespeeld',      snd: ['leeg'], tril: ['leeg'], waar: ['endRound'] },
  { ev: 'eindstand',   zegt: 'wie won',                        snd: ['tel', 'kroon', 'fanfare'], tril: ['kroon', 'feest'], waar: ['winner'] },
  { ev: 'thuis',       zegt: 'terug op de titel',              snd: ['roep'], tril: [], waar: ['naarTitel'] },
  { ev: 'grond',       zegt: 'je raakte het bord',             snd: ['plop'], tril: [], waar: ['#s-title pointerdown', '#s-handoff pointerdown', '#s-winner pointerdown'] }
];
// Geen betekenis, alleen de luidspreker wakker of stil.
const GEREEDSCHAP = new Set(['Snd.unlock', 'Snd.stil']);
// De ladder van CLAUDE.md, en de ritmes met een eigen naam.
const LADDER = new Set([20, 30, 40, 50, 60]);
const RITMES = new Set(['nee', 'zag', 'om', 'leeg', 'feest']);

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

/* 1 en 2: zonder browser. */
function statisch() {
  const calls = aanroepen();
  const dekt = (cue, waar) => WOORDENBOEK.some(r => r.waar.includes(waar) &&
    (cue.startsWith('Snd.') ? r.snd : r.tril).includes(cue.slice(cue.indexOf('.') + 1)));
  for (const c of calls) {
    if (GEREEDSCHAP.has(c.cue)) continue;
    ok(dekt(c.cue, c.plek), `${c.cue}() in ${c.plek} (regel ${c.regel + 1} van het script) staat niet in het woordenboek: zet hem bij een gebeurtenis, of maak er een`);
  }
  for (const r of WOORDENBOEK) for (const w of r.waar) {
    const er = calls.some(c => c.plek === w &&
      (r.snd.some(s => c.cue === 'Snd.' + s) || r.tril.some(s => c.cue === 'Tril.' + s)));
    ok(er, `woordenboek "${r.ev}": in ${w} klinkt of trilt niets meer van deze gebeurtenis`);
  }
  // Elke cue die bestaat, wordt ergens gebruikt.
  const sndCues = methodes(sA, sB), trilCues = methodes(tA, tB);
  for (const s of sndCues) if (!['enabled', 'unlock', 'stil'].includes(s))
    ok(WOORDENBOEK.some(r => r.snd.includes(s)), `Snd.${s}() staat in geen enkele gebeurtenis`);
  for (const s of trilCues) if (s !== 'enabled')
    ok(WOORDENBOEK.some(r => r.tril.includes(s)), `Tril.${s}() staat in geen enkele gebeurtenis`);
  // Twee betekenissen, twee klanken.
  const sleutel = r => r.snd.slice().sort().join('+') + ' | ' + r.tril.slice().sort().join('+');
  const gezien = {};
  for (const r of WOORDENBOEK) {
    const k = sleutel(r), ander = gezien[k];
    if (ander) ok(r.zelfde === ander.ev || ander.zelfde === r.ev,
      `"${ander.ev}" en "${r.ev}" klinken en trillen hetzelfde (${k}); bedoeld? zet zelfde`);
    else gezien[k] = r;
  }
  // De trillingen.
  for (const [naam, p] of Object.entries(trillingen())) {
    if (Array.isArray(p)) ok(RITMES.has(naam), `Tril.${naam}() is een ritme zonder naam in RITMES: ${JSON.stringify(p)}`);
    else ok(LADDER.has(p), `Tril.${naam}() trilt ${p} ms, niet een van de ladder (20, 30, 40, 50, 60)`);
    for (const ms of [].concat(p).filter((_, i) => i % 2 === 0))
      ok(ms >= 20, `Tril.${naam}(): een puls van ${ms} ms, onder de 20 voel je niets`);
  }
}

/* 3: het telefoonmodel. Elke cue in een OfflineAudioContext, na een goed()
   een seconde eerder (een warme compressor, zoals midden in een potje),
   door twee hoogdoorlaten op 600 Hz (24 dB per octaaf). Het luidste venster
   van 20 ms telt; de piek is die van de uitgang zelf. */
const CUES = {
  'goed(0)': 'S.goed(0)', 'goed(7)': 'S.goed(7)', 'pas': 'S.pas()', 'nee': 'S.nee()',
  'count + tick': 'S.tick(2200,.05);S.count(0)', 'go': 'S.go()', 'verder': 'S.verder()', 'dicht': 'S.dicht()',
  'klik': 'S.klik(.12)', 'ploeg Vos': 'S.ploeg(0)', 'ploeg Uil': 'S.ploeg(1)', 'roep Vos': 'S.roep(0)',
  'roep Uil': 'S.roep(1)', 'tel(0)': 'S.tel(0)', 'tel(12)': 'S.tel(12)', 'kroon': 'S.kroon()', 'plop': 'S.plop()',
  'ronde': 'S.ronde(1)', 'timeUp': 'S.timeUp()', 'leeg': 'S.leeg()', 'fanfare': 'S.fanfare(0)',
  'houdAan(0)': 'S.houdAan(0)', 'houdAan(1)': 'S.houdAan(1)',
  'klok 10 s': 'S.tick(1600,.06)', 'klok 5 s': 'S.tick(1900,.10)'
};
const KLOK = new Set(['klok 10 s', 'klok 5 s']);
async function luidheid(page) {
  const bron = sndBron
    .replace(/const wekbaar = c =>[^;]*;/, 'const wekbaar = c => true;')
    .replace('c.currentTime + (at || 0)', 'c.currentTime + (at || 0) + (window.__off || 0)')
    .replace('const t = c.currentTime;', 'const t = c.currentTime + (window.__off || 0);');
  ok(bron.includes('window.__off || 0) + (') || bron.includes('(window.__off || 0)'), 'de bron van Snd is veranderd: pas luidheid() aan');
  const r = await page.evaluate(async ({ bron, CUES }) => {
    const uit = {};
    for (const [naam, c] of Object.entries(CUES)) {
      const oc = new OfflineAudioContext(1, 48000 * 3, 48000);
      window.AudioContext = function () { return oc; };
      const S = eval('(() => {' + bron + '; return Snd; })()');
      window.__off = 0; S.unlock(); S.goed(0);
      window.__off = 1; eval(c); window.__off = 0;
      const buf = await oc.startRendering();
      const o2 = new OfflineAudioContext(1, buf.length, 48000);
      const src = o2.createBufferSource(); src.buffer = buf;
      let n = src;
      for (let i = 0; i < 2; i++) { const f = o2.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 600; f.Q.value = -3.01; n.connect(f); n = f; }
      n.connect(o2.destination); src.start();
      const d = (await o2.startRendering()).getChannelData(0), raw = buf.getChannelData(0);
      const W = 960; let best = 0, piek = 0;
      for (let i = 48000; i + W < d.length; i += 120) { let q = 0; for (let j = i; j < i + W; j++) q += d[j] * d[j]; best = Math.max(best, q / W); }
      for (let i = 48000; i < raw.length; i++) piek = Math.max(piek, Math.abs(raw[i]));
      uit[naam] = { db: 10 * Math.log10(best + 1e-12), piek: 20 * Math.log10(piek + 1e-12) };
    }
    return uit;
  }, { bron, CUES });
  const ref = r['goed(0)'].db;
  for (const [naam, v] of Object.entries(r)) {
    if (!KLOK.has(naam)) ok(v.db >= ref - 8, `${naam}: ${(v.db - ref).toFixed(1)} dB onder goed() op een telefoon (hoogstens 8)`);
    ok(v.piek <= -3, `${naam}: piek ${v.piek.toFixed(1)} dBFS (hoogstens -3)`);
  }
  return r;
}

/* 4: een potje, met elke oscillator op zijn cue. Een overlap tussen twee
   verschillende cues is een fout, behalve de tik van de klok en de lange
   druk die onder de deur uitklinkt. */
const SAMEN = [['houdAan', 'dicht']];
const HAAK = () => {
  const L = window.__osc = [];
  let cue = null;
  const st = OscillatorNode.prototype.start, sp = OscillatorNode.prototype.stop;
  OscillatorNode.prototype.start = function (t) { this.__c = cue; this.__a = t || this.context.currentTime; return st.apply(this, arguments); };
  OscillatorNode.prototype.stop = function (t) {
    // tone() stopt 20 ms na het einde van de noot; de lange druk stopt nu.
    if (this.__c) L.push({ cue: this.__c, a: this.__a, b: t ? t - .02 : this.context.currentTime });
    return sp.apply(this, arguments);
  };
  const w = setInterval(() => {
    const S = window.__tijd && window.__tijd.Snd;
    if (!S) return;
    clearInterval(w);
    for (const k of Object.keys(S)) {
      const f = S[k]; if (typeof f !== 'function' || k === 'unlock') continue;
      S[k] = function () { const vorig = cue; cue = cue || k; try { return f.apply(this, arguments); } finally { cue = vorig; } };
    }
  }, 5);
};
async function overlap(page) {
  const W = ms => page.waitForTimeout(ms);
  const scherm = () => page.evaluate(() => window.__tijd.screen);
  async function beurt() {
    await page.click('#btnStartTurn');
    await page.waitForFunction(() => !document.querySelector('#countdown').hidden, null, { timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('#countdown').hidden && window.__tijd.G.card !== null, null, { timeout: 10000 });
    await W(200);
  }
  async function leeg() {
    while (await page.evaluate(() => window.__tijd.screen === 'play' && window.__tijd.G && window.__tijd.G.card !== null)) {
      await page.click('#btnGoed'); await W(330);
    }
  }
  await page.click('#btnStart'); await W(2500);
  await beurt();
  for (let i = 0; i < 3; i++) { await page.click('#btnGoed'); await W(400); }
  await page.click('#btnPas'); await W(400);
  await page.evaluate(() => window.__tijd.timeUp());
  await page.waitForFunction(() => window.__tijd.screen === 'handoff', null, { timeout: 5000 });
  await W(2600);
  for (let r = 0; r < 3; r++) {
    await beurt(); await leeg(); await W(3500);
    if (await scherm() === 'winner') break;
  }
  ok(await scherm() === 'winner', 'het potje kwam niet op de eindstand');
  await W(4500);
  const L = await page.evaluate(() => window.__osc);
  ok(L.length > 40, `te weinig noten opgenomen (${L.length}): werkt de haak nog?`);
  const mag = (x, y) => x === y || x === 'tick' || y === 'tick' ||
    SAMEN.some(([p, q]) => (p === x && q === y) || (p === y && q === x));
  const gemeld = new Set();
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const a = L[i], b = L[j];
    if (mag(a.cue, b.cue)) continue;
    const over = Math.min(a.b, b.b) - Math.max(a.a, b.a);
    if (over > .005) {
      const k = [a.cue, b.cue].sort().join(' + ');
      if (!gemeld.has(k)) { gemeld.add(k); fails.push(`${k} klinken ${Math.round(over * 1000)} ms tegelijk: één geluid tegelijk`); }
    }
  }
}

(async () => {
  statisch();
  const browser = await launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const p1 = await browser.newPage();
    await p1.goto('about:blank');
    const r = await luidheid(p1);
    if (process.env.LUID) for (const [n, v] of Object.entries(r)) console.log(n.padEnd(14), v.db.toFixed(1), v.piek.toFixed(1));
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('tijdisom.welkom', '1');
        localStorage.setItem('tijdisom.settings', JSON.stringify({ size: 16, secs: 20, tier: 'klein' }));
      } catch (e) {}
    });
    await ctx.addInitScript(HAAK);
    const p2 = await ctx.newPage();
    const errs = [];
    p2.on('pageerror', e => errs.push(e.message));
    await p2.goto(APP_URL);
    await p2.waitForTimeout(1200);
    await overlap(p2);
    ok(!errs.length, 'fouten op de pagina: ' + errs.join('; '));
  } finally {
    await browser.close();
  }
  if (fails.length) {
    console.error('zintuigen: ' + fails.length + ' fout(en)\n  - ' + fails.join('\n  - '));
    process.exit(1);
  }
  console.log('zintuigen: woordenboek, luidheid en één geluid tegelijk in orde');
})().catch(e => { console.error(e); process.exit(1); });
