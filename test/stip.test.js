/*
 * Het stippenvlak tekent op twee manieren: op de grafische kaart (de
 * shaders in stipGpu()) en op een 2D-canvas (reken() en teken() in
 * stipveld()), voor een toestel zonder kaart. Ze moeten hetzelfde beeld
 * geven. Deze test zet twee velden over elkaar, één per weg, geeft ze
 * dezelfde aanroepen op een stilgezette klok (rimpels rond en vanaf een
 * rand, onthullen, toon, stralen, de handtekening) en vergelijkt elke
 * pixel. Wat mag verschillen is de zachte rand van een punt: een paar
 * pixels per punt, een paar tientallen op 255.
 *
 * De 2D-weg tekent alleen wat veranderde; met grote stappen in de tijd
 * toetst deze test ook dat er dan niets blijft staan.
 */
const assert = require('assert');
const { launch, APP_URL, echteKaart } = require('./browser.js');

const STANDEN = {
  titel: ['{ inkt: true, merk: merkMax }', [[0, 'v.rimpel(300,500,1); v.rimpel(900,200,1,40)'], [300], [700], [1200]]],
  rand: ['{ ploeg: () => 0 }', [[0, 'v.rimpelRand({ x: 400, y: 200, width: 400, height: 300 }, 1.2); v.rimpel(1000,600,.7,30)'], [250], [600], [1100]]],
  onthul: ['{ inkt: true }', [[0, 'v.onthul(640,700,40,"#e94b2e",900,()=>{}); v.rimpel(640,700,1)'], [200], [500], [880], [1000]]],
  stralen: ['{ ploeg: () => 1 }', [[0, 'v.stralen(true); v.rimpel(600,400,1)'], [400], [3000]]],
  toon: ['{ ploeg: () => 0 }', [[0, 'v.toon(640,400,false,900)'], [300], [600], [900, 'v.toon(200,200,true,700)'], [1300]]],
};

(async () => {
  const browser = await launch();
  let fouten = 0;
  for (const dpr of [1, 1.5, 3]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: dpr });
    await echteKaart(ctx);
    await ctx.addInitScript(() => {
      /* Een stilgezette klok: performance.now() en de tijd van een beeld
         zijn window.__nu. */
      const echt = performance.now.bind(performance);
      performance.now = () => window.__nu === undefined ? echt() : window.__nu;
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = f => raf(() => f(performance.now()));
      /* Het 2D-veld krijgt geen WebGL; het GL-veld bewaart zijn beeld,
         zodat het hier uit te lezen is. */
      const ctxVan = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (t, o, ...r) {
        if (!/webgl/.test(t)) return ctxVan.call(this, t, o, ...r);
        return window.__geenGl ? null : ctxVan.call(this, t, { ...(o || {}), preserveDrawingBuffer: true });
      };
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => { fouten++; console.error('paginafout:', e.message); });
    await page.goto(APP_URL);
    await page.waitForTimeout(800);
    for (const [naam, [opt, stappen]] of Object.entries(STANDEN)) {
      const gl = await page.evaluate(opt => {
        document.querySelectorAll('.stiptest').forEach(c => c.remove());
        window.__nu = 1e6;
        window.__v = [false, true].map(geen => {
          const c = document.createElement('canvas');
          c.className = 'stiptest';
          c.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99999;pointer-events:none';
          document.body.appendChild(c);
          window.__geenGl = geen;
          const v = stipveld(c, { ...eval('(' + opt + ')'), zichtbaar: () => true });
          window.__geenGl = false;
          v.aan();
          return { c, v };
        });
        return !!__v[0].c.getContext('webgl2') || !!__v[0].c.getContext('webgl');
      }, opt);
      assert.ok(gl, `${naam}: het GL-veld kreeg geen WebGL`);
      await page.waitForTimeout(100);
      for (const [t, actie] of stappen) {
        await page.evaluate(([t, actie]) => { window.__nu = 1e6 + t; if (actie) __v.forEach(({ v }) => eval(actie)); }, [t, actie]);
        await page.waitForTimeout(120);
        const r = await page.evaluate(() => {
          /* Allebei op grijs, zodat inkt en papier allebei tellen. */
          const [a, b] = __v.map(({ c }) => {
            const k = document.createElement('canvas'); k.width = c.width; k.height = c.height;
            const x = k.getContext('2d'); x.fillStyle = '#808080'; x.fillRect(0, 0, k.width, k.height);
            x.drawImage(c, 0, 0);
            return x.getImageData(0, 0, k.width, k.height).data;
          });
          let max = 0, veel = 0, getekend = 0;
          for (let i = 0; i < a.length; i += 4) {
            const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
            if (d > max) max = d;
            if (d > 24) veel++;
            if (a[i] !== 128 || a[i + 1] !== 128) getekend++;
          }
          return { max, veel, getekend, n: a.length / 4 };
        });
        const ok = r.max <= 48 && r.veel <= r.n * 0.001;
        if (!ok) fouten++;
        console.log(`${ok ? 'ok  ' : 'MIS '} ${dpr}x ${naam} +${t} ms: grootste verschil ${r.max}/255, ${r.veel} pixels boven 24`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  if (fouten) { console.error(`\n${fouten} misser(s): de GL-weg en de 2D-weg van het stippenvlak lopen uiteen.`); process.exit(1); }
  console.log('\nHet stippenvlak tekent op de kaart en op het canvas hetzelfde.');
})().catch(e => { console.error(e); process.exit(1); });
