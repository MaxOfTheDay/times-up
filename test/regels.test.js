/*
 * De huisregels uit CLAUDE.md die je aan de tekst van index.html kunt
 * zien, zonder browser. Elke test hieronder noemt zijn regel; valt er een
 * om, dan staat in de melding wat er mis is en waar.
 *
 * Dit vervangt het kijken niet (npm run foto blijft de controle die telt):
 * het vangt de regels die in een haast breken en die op een foto niet te
 * zien zijn. Duurt milliseconden.
 *
 * Draaien: npm run test:regels     (of npm test voor alles)
 */
const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const regels = html.split('\n');
const css = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
const s0 = html.indexOf('<script id="spelkern">');
const hoofd = html.slice(html.indexOf('<script>', s0), html.lastIndexOf('</script>'));
const regelVan = i => html.slice(0, i).split('\n').length;
/* Opmerkingen weg, met de regels erin behouden, zodat een voorbeeld in een
   opmerking niet als code telt en regelnummers blijven kloppen. */
const zonderOpm = t => t
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:"'\\])\/\/[^\n]*/g, (m, a) => a + ' '.repeat(m.length - a.length));
const hoofdCode = zonderOpm(hoofd);
const hoofdStart = html.indexOf(hoofd);

/* De CSS als losse regels: selector + blok, zonder @media-koppen. */
function cssRegels() {
  const uit = [], t = zonderOpm(css);
  let i = 0;
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(t))) {
    const sel = m[1].replace(/@[^{]*$/, '').trim();
    uit.push({ sel, body: m[2], regel: regelVan(html.indexOf('<style>') + m.index) });
    i++;
  }
  return uit;
}

test('Geluid en trilling: een trilling is 20, 30, 40, 50 of 60 ms, of een ritme van pulsen van minstens 20', () => {
  const blok = hoofdCode.slice(hoofdCode.indexOf('const Tril = '));
  const eind = blok.indexOf('})();');
  const fout = [];
  for (const m of blok.slice(0, eind).matchAll(/buzz\(([^)]*)\)/g)) {
    const arg = m[1].trim();
    if (arg === 'p') continue;
    const n = JSON.parse(arg);
    if (Array.isArray(n)) {
      n.forEach((v, k) => { if (k % 2 === 0 && v < 20) fout.push(`${arg}: puls ${v} < 20`); });
    } else if (![20, 30, 40, 50, 60].includes(n)) fout.push(`buzz(${arg})`);
  }
  assert.deepEqual(fout, []);
  assert.doesNotMatch(hoofdCode.replace(blok.slice(0, eind), ''), /navigator\.vibrate\(/,
    'navigator.vibrate buiten Tril: alle trillingen lopen door Tril');
});

test('Een latere stap van een overgang loopt via na(): geen nieuwe kale setTimeout', () => {
  /* Waar een eigen timer mag (met een eigen clear of zonder scherm), per
     functie of constante op het hoogste niveau. Komt er een bij, kijk dan
     of na(ms, stap, af) niet past; zo niet, zet hem hier met een reden. */
  /* De naam is de functie, constante of het blok op het hoogste niveau
     waarin de timer staat (bij code op het hoogste niveau: de functie erboven). */
  const MAG = new Set([
    'Snd',              // geluid: een toon die uitloopt
    'na',               // de helper zelf
    'holdButton',       // de lange druk, met h.stop
    'verbergGreep',     // de greep van de kaartenlijst verdwijnt na rust (weg)
    'tover',            // de staf: een time-out op fetch
    'wachtMs',          // een belofte die wacht
    'slikKlik',         // de klik na een voltooide druk inslikken
    'nudge',            // een klasse eraf na de schud
    'handoff',          // randTimer: de dieren op de rand
    'telLater',         // telTimers
    'countdown',        // de rimpel bij het terugveren, bewaakt door countRaf
    'handOffCountdown', // het canvas van het aftellen uit, bewaakt door countRaf
    'penVooruit',       // requestIdleCallback-terugval
    'tikKnop',          // TIK_NEER
    'klikT',            // het vangnet voor een rollende vinger (TIK_ROL)
    'flash',            // een klasse eraf
    'openTerug',        // terugTimer
    'zetGezicht',       // het gezicht van een mascotte terug (el._gezicht)
    'knipperLus',       // knipperen
    'stipveld',         // slaap: een canvas uit beeld leegmaken
    'tossTeams',        // tossTimer
    'sluitPauze',       // pauseUit
    'guardBack',        // de terugveeg
    'wakeOverdracht',   // wakeTimer
    'kiesInstallStand'  // opstarten: het menu op Android, het wachten op eigenKlaar
  ]);
  const fout = [];
  for (const m of hoofdCode.matchAll(/setTimeout\(/g)) {
    /* De naam van de functie of constante op het hoogste niveau eromheen. */
    const voor = hoofdCode.slice(0, m.index);
    const kop = [...voor.matchAll(/^(?:async\s+)?function\s+(\w+)|^(?:const|let)\s+(\w+)\s*=|^\$\("#?(\w+)/gm)].pop();
    const naam = kop ? (kop[1] || kop[2] || kop[3]) : '?';
    if (!MAG.has(naam)) fout.push(`regel ${regelVan(hoofdStart + m.index)}: setTimeout in ${naam}`);
  }
  assert.deepEqual(fout, [], 'gebruik na(ms, stap, af), of zet de functie met een reden in MAG');
});

test('Een letter: de systeemletter is nooit vetter dan 700', () => {
  const lijst = css.match(/([^{}]*)\{\s*font-family: var\(--font-display\);\s*\}/);
  assert.ok(lijst, 'de selectorlijst met var(--font-display) is weg');
  const fredoka = new Set(zonderOpm(lijst[1]).split(',').map(s => s.trim()).filter(Boolean));
  const fout = [];
  for (const r of cssRegels()) {
    const w = r.body.match(/font-weight:\s*(\d+)/);
    if (!w || +w[1] <= 700) continue;
    if (/font-family:\s*var\(--font-display\)/.test(r.body)) continue;
    const sels = r.sel.split(',').map(s => s.trim());
    if (sels.every(s => fredoka.has(s))) continue;
    fout.push(`regel ${r.regel}: ${r.sel} heeft font-weight ${w[1]}`);
  }
  assert.deepEqual(fout, []);
});

test('Vorm en diepte: elke knop staat in de lijst van 3. KNOPPEN, anders veert hij niet terug', () => {
  const kop = css.indexOf('3. KNOPPEN');
  const lijst = css.slice(kop, css.indexOf('{', kop));
  const klassen = new Set([...lijst.matchAll(/button\.([\w-]+)/g)].map(m => m[1]));
  /* Rijen in een lijst zakken niet in (een druk kleurt ze), en de verfstalen
     van de maker liggen op als ze gekozen zijn. */
  const ZONDER = new Set(['rij', 'mk-kleur']);
  const fout = [];
  const bekijk = (cls, waar) => {
    const c = cls.split(/\s+/).filter(Boolean);
    if (!c.some(k => klassen.has(k) || ZONDER.has(k))) fout.push(`${waar}: class="${cls}"`);
  };
  for (const m of html.matchAll(/<button\b([^>]*)>/g)) {
    const c = m[1].match(/class="([^"]*)"/);
    bekijk(c ? c[1] : '', `regel ${regelVan(m.index)}`);
  }
  for (const m of hoofdCode.matchAll(/createElement\("button"\);\s*\n\s*\w+\.className = "([^"]*)"/g))
    bekijk(m[1], `regel ${regelVan(hoofdStart + m.index)} (in JS)`);
  assert.deepEqual(fout, []);
});

test('De grond stroomt: #s-handoff, #s-play en #s-winner krijgen geen screenIn', () => {
  const r = cssRegels().find(r => /animation:\s*none/.test(r.body) && /#s-handoff/.test(r.sel));
  assert.ok(r, 'geen regel die screenIn uitzet op #s-handoff');
  for (const id of ['#s-handoff', '#s-play', '#s-winner'])
    assert.match(r.sel, new RegExp(id + '\\b'), `${id} staat niet in de regel die screenIn uitzet`);
  for (const t of cssRegels()) {
    if (!/animation[^;]*screenIn/.test(t.body)) continue;
    assert.doesNotMatch(t.sel, /#s-(handoff|play|winner)\b/, `regel ${t.regel} geeft ze toch screenIn`);
  }
});

test('Materiaal: geen verloop, geen vervaging, geen filter', () => {
  const fout = [];
  for (const r of cssRegels()) {
    /* De rasterpunten zijn een radial-gradient met een harde rand: dat is
       een punt, geen verloop. */
    for (const m of r.body.matchAll(/(linear|conic)-gradient|backdrop-filter|filter:\s*[a-z]|blur\(/g))
      fout.push(`regel ${r.regel}: ${r.sel} (${m[0]})`);
    for (const m of r.body.matchAll(/radial-gradient\([^;]*?(\d+(?:\.\d+)?)px,\s*transparent\s+(\d+(?:\.\d+)?)px/g))
      if (+m[2] - +m[1] > 1) fout.push(`regel ${r.regel}: ${r.sel} (zachte punt ${m[1]}->${m[2]} px)`);
  }
  assert.deepEqual(fout, []);
});

test('Een <img> neemt geen aanraking aan', () => {
  assert.ok(cssRegels().some(r => /^img$/.test(r.sel) && /pointer-events:\s*none/.test(r.body)),
    'img { pointer-events: none } is weg');
});

test('Vorm en diepte: --lift-1 nooit dunner dan --line', () => {
  const px = n => +((css.match(new RegExp(`--${n}:\\s*(\\d+(?:\\.\\d+)?)px`)) || [])[1]);
  assert.ok(px('lift-1') >= px('line'), `--lift-1 ${px('lift-1')} < --line ${px('line')}`);
  assert.ok(px('lift-2') > px('lift-1'), '--lift-2 hoort dieper dan --lift-1');
});

test('Opslag: elke localStorage-aanroep staat in een try', () => {
  const fout = [];
  for (const m of hoofdCode.matchAll(/localStorage\.(get|set|remove)Item/g)) {
    /* In de regel zelf en de vijf ervoor moet een try open staan: de
       laatste try komt na de laatste catch. */
    const voor = hoofdCode.slice(0, m.index).split('\n').slice(-6).join('\n');
    const laatst = re => { let i = -1; for (const m of voor.matchAll(re)) i = m.index; return i; };
    if (laatst(/\btry\s*\{/g) <= laatst(/\}\s*catch\b/g)) fout.push(`regel ${regelVan(hoofdStart + m.index)}`);
  }
  assert.deepEqual(fout, []);
});

test('Alles staat in index.html: geen externe bron', () => {
  const fout = [];
  for (const m of html.matchAll(/\b(?:src|href)\s*=\s*"(https?:)?\/\/[^"]*"/g)) fout.push(`regel ${regelVan(m.index)}: ${m[0]}`);
  for (const m of css.matchAll(/url\(\s*["']?https?:/g)) fout.push(`css: ${m[0]}`);
  assert.deepEqual(fout, []);
});

test('De spelkern verwijst naar niets buiten haar blok', () => {
  const kern = zonderOpm(html.slice(s0, html.indexOf('</script>', s0)));
  for (const w of ['document', 'window', 'localStorage', 'setTimeout', 'Date.now', 'performance', 'Snd', 'Tril', 'DECKS'])
    assert.ok(!new RegExp(`\\b${w.replace('.', '\\.')}\\b`).test(kern), `de spelkern gebruikt ${w}`);
});

test('Een fout meldt zichzelf: de melder is het eerste script, los van de rest', () => {
  /* Zat hij in de spelkern of het hoofdscript, dan hield een syntaxfout daar
     ook de melder tegen, en meldde juist een app die niet start zich nooit. */
  const eerste = html.match(/<script\b[^>]*>/);
  assert.equal(eerste && eerste[0], '<script id="foutmelder">', 'het eerste script is niet de foutmelder');
  const blok = html.slice(eerste.index, html.indexOf('</script>', eerste.index));
  for (const w of ['function meldFout', 'addEventListener("error"', 'addEventListener("unhandledrejection"'])
    assert.ok(blok.includes(w), `${w} staat niet in de foutmelder`);
  assert.ok(!hoofd.includes('function meldFout'), 'meldFout staat (ook) in het hoofdscript');
});

test('Tests: elke suite draait in npm test en in CI, in precies één groep', () => {
  /* README en CLAUDE.md liepen achter op package.json ("zeven suites" bij
     tien); de groepen in CI mogen dat niet. Eén bron: package.json. */
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8')).scripts;
  const groepen = [...pkg.test.matchAll(/npm run test:(\w+)/g)].map(m => m[1]);
  assert.ok(groepen.length >= 2, 'npm test roept geen groepen meer aan');
  const inGroep = {};
  for (const g of groepen) for (const m of (pkg['test:' + g] || '').matchAll(/test\/([\w-]+)\.test\.js/g)) {
    assert.ok(!inGroep[m[1]], `${m[1]} staat in twee groepen`);
    inGroep[m[1]] = g;
  }
  const BUITEN = new Set(['chaos']);   // een paar minuten op een zaad: met de hand
  for (const f of fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js'))) {
    const n = f.replace('.test.js', '');
    if (!BUITEN.has(n)) assert.ok(inGroep[n], `test/${f} draait in geen enkele groep van npm test`);
  }
  const ci = fs.readFileSync(path.resolve(__dirname, '..', '.github', 'workflows', 'test.yml'), 'utf8');
  const matrix = (ci.match(/groep:\s*\[([^\]]*)\]/) || [])[1];
  assert.ok(matrix, 'test.yml heeft geen matrix met groep');
  assert.deepEqual(matrix.split(',').map(s => s.trim()), groepen, 'de groepen in test.yml zijn niet die van npm test');
  for (const d of ['README.md', 'CLAUDE.md']) {
    const t = fs.readFileSync(path.resolve(__dirname, '..', d), 'utf8');
    for (const n of Object.keys(inGroep)) assert.ok(t.includes(`test/${n}.test.js`), `${d} noemt test/${n}.test.js niet`);
  }
});
