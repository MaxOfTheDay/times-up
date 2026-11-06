/*
 * Willekeurige tikken, op een vaste reeks.
 *
 * Tikt op wat er echt bovenop ligt, drukt kort of lang op het huisje, veegt
 * terug, herlaadt en klikt de app weg en terug, met tussenpozen van 30 ms
 * tot 1,2 s. Na elke stap: precies één scherm aan, en dat is het scherm
 * dat het spel zelf denkt; op de overdracht en het spelen bestaat er een
 * potje. Om de 40 stappen vijf tellen niets, en dan moet er iets aan te
 * tikken zijn. Geen fout in de pagina.
 *
 * Draaien: npm run test:chaos            (zaad 1, 300 stappen)
 *          node test/chaos.test.js 7 600 (zaad 7, 600 stappen)
 *
 * Niet in `npm test`: een run duurt een paar minuten. Draai hem na een
 * wijziging aan de overgangen (na(), show(), de omdraaiers), met een paar
 * zaden. Een misser noemt het zaad en de laatste twaalf stappen, zodat je
 * hem kunt naspelen.
 */
const { launch, APP_URL } = require('./browser');

const ZAAD = +process.argv[2] || 1, STAPPEN = +process.argv[3] || 300;
let z = ZAAD;
const rnd = () => (z = (z * 1103515245 + 12345) % 2147483648) / 2147483648;

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const fouten = [];
  page.on('pageerror', e => fouten.push(e.message));
  page.on('console', m => { if (m.type() === 'error') fouten.push('console: ' + m.text()); });

  /* Wegklikken nabootsen: document.hidden omzetten en de gebeurtenissen
     sturen die een telefoon stuurt. */
  const haak = () => page.evaluate(() => {
    let weg = false;
    Object.defineProperty(document, 'hidden', { get: () => weg, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => weg ? 'hidden' : 'visible', configurable: true });
    window.__weg = v => {
      weg = v;
      document.dispatchEvent(new Event('visibilitychange'));
      if (v) dispatchEvent(new Event('pagehide'));
    };
  }).catch(() => {});
  const terugInApp = async () => {
    if (page.url().includes('index.html')) return;
    await page.goto(APP_URL); await page.waitForTimeout(300); await haak();
  };

  await page.goto(APP_URL);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('tijdisom.settings', JSON.stringify({ secs: 20, size: 16 }));
  });
  await page.reload(); await page.waitForTimeout(400); await haak();

  const knoppen = () => page.evaluate(() => [...document.querySelectorAll('button, .chip, [role=button]')]
    .filter(e => {
      const r = e.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight) return false;
      const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return t && (t === e || e.contains(t));
    })
    .map(e => { const r = e.getBoundingClientRect(); return { id: e.id || e.className.toString().split(' ')[0], x: r.left + r.width / 2, y: r.top + r.height / 2 }; })
  ).catch(() => []);
  const toets = () => page.evaluate(() => {
    const aan = [...document.querySelectorAll('.screen.on')].map(x => x.id), mis = [];
    if (aan.length !== 1) mis.push('schermen aan: ' + (aan.join(', ') || 'geen'));
    else if (aan[0] !== 's-' + __tijd.screen) mis.push(`het spel denkt ${__tijd.screen}, in beeld is ${aan[0]}`);
    if (['handoff', 'play'].includes(__tijd.screen) && !__tijd.G) mis.push('geen potje op ' + __tijd.screen);
    return mis;
  }).catch(() => []);

  const missers = new Map(), spoor = [];
  for (let i = 0; i < STAPPEN; i++) {
    const r = rnd();
    let stap;
    if (r < .06) {
      const scherm = await page.evaluate(() => __tijd.screen).catch(() => '');
      /* Terugvegen op de titel verlaat de app; dat is de bedoeling. */
      if (scherm === 'title') stap = 'terug (titel, overgeslagen)';
      else { stap = 'terug'; await page.evaluate(() => history.back()).catch(() => {}); await page.waitForTimeout(100); }
    } else if (r < .10) {
      stap = 'wegklikken';
      await page.evaluate(() => __weg(true)).catch(() => {});
      await page.waitForTimeout(80 + rnd() * 400);
      await page.evaluate(() => __weg(false)).catch(() => {});
    } else if (r < .12) {
      stap = 'herladen';
      await page.reload(); await page.waitForTimeout(300); await haak();
    } else {
      const k = (await knoppen()).filter(x => x.id !== 'btnInstall' && x.id !== 'btnDelen');
      if (!k.length) stap = 'niets te tikken';
      else {
        const t = k[Math.floor(rnd() * k.length)];
        stap = 'tik ' + t.id;
        if (t.id === 'btnStop' || t.id === 'btnStopHo') {
          const lang = rnd() < .5;
          stap = (lang ? 'houd ' : 'tik ') + t.id;
          await page.mouse.move(t.x, t.y); await page.mouse.down();
          await page.waitForTimeout(lang ? 1600 : 200); await page.mouse.up();
        } else await page.mouse.click(t.x, t.y);
      }
    }
    spoor.push(stap); if (spoor.length > 12) spoor.shift();
    await page.waitForTimeout(rnd() < .3 ? 30 + rnd() * 120 : 250 + rnd() * 900);
    await terugInApp();
    for (const m of await toets()) if (!missers.has(m)) missers.set(m, [...spoor]);
    if (i % 40 === 39) {
      await page.waitForTimeout(5000);
      const scherm = await page.evaluate(() => __tijd.screen).catch(() => '?');
      if (!(await knoppen()).length) {
        const m = `vast op ${scherm}: niets aan te tikken`;
        if (!missers.has(m)) missers.set(m, [...spoor]);
      }
    }
  }
  await browser.close();

  for (const f of new Set(fouten)) missers.set('fout in de pagina: ' + f, []);
  if (missers.size) {
    console.log(`willekeurige tikken, zaad ${ZAAD}: ${missers.size} misser(s)`);
    for (const [m, s] of missers) console.log('  ' + m + (s.length ? '\n    na: ' + s.join(' | ') : ''));
    process.exit(1);
  }
  console.log(`  willekeurige tikken in orde (zaad ${ZAAD}, ${STAPPEN} stappen)`);
})();
