/*
 * Gedeelde browser-start voor de tests.
 *
 * Werkt met de volledige 'playwright' (brengt zelf een browser mee) of met
 * 'playwright-core' plus een bestaande Chrome/Chromium. Zet CHROME=/pad/naar/chrome
 * om een eigen browser af te dwingen; zie launch() voor de volgorde.
 */
const fs = require('fs');
const path = require('path');

let pw;
try { pw = require('playwright'); }
catch (e) { pw = require('playwright-core'); }

// Volgorde: CHROME als die gezet is; anders de browser die bij deze
// playwright-versie hoort; en pas als die er niet is, wat er in
// /opt/pw-browsers staat (de vooraf geïnstalleerde browser van de
// ontwikkelomgeving). Daar stond eerst één vast versienummer, en dat brak
// zodra playwright of de omgeving een ander nummer kreeg.
function voorgeinstalleerd() {
  const root = '/opt/pw-browsers';
  if (!fs.existsSync(root)) return [];
  const kandidaten = [path.join(root, 'chromium')];
  for (const d of fs.readdirSync(root).filter(n => /^chromium-\d+$/.test(n))
    .sort((a, b) => b.split('-')[1] - a.split('-')[1])) {
    kandidaten.push(path.join(root, d, 'chrome-linux64', 'chrome'),
                    path.join(root, d, 'chrome-linux', 'chrome'));
  }
  return kandidaten.filter(p => fs.existsSync(p) && fs.statSync(p).isFile());
}

async function launch(opts) {
  if (process.env.CHROME) {
    return pw.chromium.launch(Object.assign({ executablePath: process.env.CHROME }, opts));
  }
  try {
    return await pw.chromium.launch(opts);
  } catch (e) {
    const exe = voorgeinstalleerd()[0];
    if (!exe || !/Executable doesn't exist/.test(e.message)) throw e;
    return pw.chromium.launch(Object.assign({ executablePath: exe }, opts));
  }
}

// file://-URL van de app, met ?debug zodat window.__tijd beschikbaar is.
const APP_URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?debug';

// Vasthouden i.p.v. tikken: de knoppen die een lange druk vragen negeren
// een gewone klik met opzet, dus moeten de tests dat ook echt doen.
async function hold(page, sel, ms) {
  const box = await page.locator(sel).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

// De headless browser heeft geen grafische kaart maar SwiftShader, en daar
// laat stipGlKan() het stippenvlak op het 2D-canvas. Dit laat SwiftShader
// doorgaan voor een kaart, zodat de WebGL-weg ook te testen en te
// fotograferen is (test/stip.test.js, STIP=gl npm run foto).
async function echteKaart(ctx) {
  await ctx.addInitScript(() => {
    for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!C) continue;
      const lees = C.prototype.getParameter;
      C.prototype.getParameter = function (x) {
        const v = lees.call(this, x);
        return typeof v === 'string' ? v.replace(/SwiftShader/gi, 'Testkaart') : v;
      };
    }
  });
}

/* Wat een voorleesfunctie op dit scherm niet kan noemen. Uit de
   toegankelijkheidsboom van Chrome zelf, niet uit de opmaak: die rekent
   aria-hidden, inert en hidden mee, en ziet ook wat een script erin hing.
   Twee missers:
   - een beeld of knop zonder naam (een svg zonder aria-hidden of label);
   - een aria-label op een vak zonder rol: een kale div of span geeft zijn
     label niet door, dus het leest alleen wat erin staat ("0 0"). Geef zo'n
     vak role="img" (het label vervangt de inhoud) of role="group" (het
     label komt vóór de inhoud, die zelf ook gelezen wordt). */
async function naamloos(page) {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send('DOM.getDocument', { depth: -1 });
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const uit = new Set();
    for (const n of nodes) {
      if (n.ignored || !n.backendDOMNodeId) continue;
      const rol = n.role && n.role.value, naam = n.name && n.name.value;
      const geen = (rol === 'image' || rol === 'img' || rol === 'button') && !naam;
      const kaal = rol === 'generic';
      if (!geen && !kaal) continue;
      const { object } = await cdp.send('DOM.resolveNode', { backendNodeId: n.backendDOMNodeId });
      const { result } = await cdp.send('Runtime.callFunctionOn', {
        objectId: object.objectId, returnByValue: true, arguments: [{ value: geen }],
        functionDeclaration: `function (geen) {
          if (!geen && !(this.getAttribute && this.hasAttribute('aria-label'))) return null;
          const r = this.getBoundingClientRect();
          if (!r.width || !r.height) return null;
          const naam = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
            (el.getAttribute('class') ? '.' + el.getAttribute('class').split(' ')[0] : '');
          const use = this.querySelector && this.querySelector('use');
          return (geen ? 'zonder naam: ' : 'aria-label zonder rol: ') +
            (this.parentElement ? naam(this.parentElement) + ' > ' : '') + naam(this) +
            (use ? ' ' + use.getAttribute('href') : '');
        }`
      });
      if (result.value) uit.add(result.value);
    }
    return [...uit];
  } finally { await cdp.detach(); }
}

module.exports = { launch, APP_URL, hold, echteKaart, naamloos };
