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

module.exports = { launch, APP_URL, hold };
