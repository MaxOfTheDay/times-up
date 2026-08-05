/*
 * Gedeelde browser-start voor de tests.
 *
 * Werkt met de volledige 'playwright' (brengt zelf een browser mee) of met
 * 'playwright-core' plus een bestaande Chrome/Chromium. Zet CHROME=/pad/naar/chrome
 * om een eigen browser af te dwingen.
 */
const fs = require('fs');
const path = require('path');

let pw;
try { pw = require('playwright'); }
catch (e) { pw = require('playwright-core'); }

// Vaste plek in de ontwikkelomgeving; bestaat die niet, dan kiest playwright zelf.
const FALLBACKS = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
];

function exePath() {
  if (process.env.CHROME) return process.env.CHROME;
  return FALLBACKS.find(p => fs.existsSync(p)) || null;
}

async function launch(opts) {
  const exe = exePath();
  return pw.chromium.launch(Object.assign(exe ? { executablePath: exe } : {}, opts));
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
