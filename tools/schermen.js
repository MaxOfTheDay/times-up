/*
 * Tekent de screenshots voor het manifest en schrijft ze als base64 terug
 * in index.html.
 *
 *   node tools/schermen.js          (of: npm run schermen)
 *
 * Waarom ze er zijn: Chrome op Android toont de grote installatiedialoog
 * alleen als er screenshots met form_factor "narrow" in het manifest
 * staan. Zonder blijft het de kleine balk onderaan, en dat is precies waar
 * de installatie verloren gaat -- dezelfde afweging als bij de iOS-weg in
 * het installatieveld: een aanwijzing te weinig kost de installatie.
 *
 * Ze worden gerénderd en niet nagemaakt: dit is de echte app in een echte
 * browser, op de drie schermen die er iets over zeggen. Wijzigt er iets aan
 * die schermen, draai dit dan opnieuw -- net als tools/pictogrammen.js bij
 * #i-glass. Twee keer draaien geeft hetzelfde bestand.
 *
 * De platen worden teruggebracht tot de :root-kleuren van de app zelf, die
 * hier uit index.html gelezen worden zodat ze niet kunnen afdrijven. Dat
 * zijn er 15, dus vier bits per pixel. Een scherm van deze app is vlakke
 * steunkleur zonder verloop, dus daar gaat vrijwel niets aan verloren, en
 * het scheelt een veelvoud aan bytes op een bestand dat toch al ruim 300 kB
 * is.
 */
const fs = require('fs');
const path = require('path');
const { paletPng } = require('./png.js');
const { launch, APP_URL } = require('../test/browser.js');

const BESTAND = path.resolve(__dirname, '..', 'index.html');

/* 390 bij 844 is de telefoon waar de app op ontworpen is; twee keer zo veel
   pixels omdat een installatiedialoog op een scherm met hoge dichtheid
   staat. 780x1688 is een verhouding van 2,16 -- Chrome eist tussen 320 en
   3840 px, en hoogstens 2,3 tussen de zijden. */
const BREED = 390, HOOG = 844, SCHAAL = 2;

/* De drie schermen, in de volgorde waarin een installatiedialoog ze toont:
   waar je binnenkomt, wat je doet, hoe het verdergaat. Het label is ook het
   anker waarop dit script zijn eigen blokken terugvindt in index.html. */
const SCHERMEN = [
  { sleutel: 'titel',      label: 'Het titelscherm' },
  { sleutel: 'overdracht', label: 'De volgende ploeg' },
];

/* Het spelscherm staat er met opzet niet bij, en dat is gemeten en niet
   gekozen. Op een kaart staat een emoji, en een emoji is vol kleur met
   verlopen -- precies wat deze platen niet aankunnen. Op de 15 kleuren van
   de app werd een tros druiven modder met magenta randen; en zodra je het
   palet groot genoeg maakt om hem wél te dragen, valt de winst van een
   palet-PNG helemaal weg: 11 kB bij 16 kleuren, 98 kB bij 64, 139 kB bij
   256, en Chromiums eigen PNG 232 kB. Voor één plaat, op een bestand van
   ruim 300 kB.

   De twee die overblijven zijn puur app-palet -- zeefdruk zonder verloop --
   en quantiseren dus zonder verlies. Wie hier ooit tóch het spelscherm bij
   wil, koopt dat met een tiende van het bestand. */

// De kleuren van de app, uit :root van index.html.
function haalPalet(html) {
  const blok = html.slice(html.indexOf(':root {'), html.indexOf('}', html.indexOf(':root {')));
  const uniek = new Map();
  for (const [, hex] of blok.matchAll(/--[a-z0-9-]+:\s*(#[0-9A-Fa-f]{6})/g)) {
    uniek.set(hex.toUpperCase(), [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));
  }
  const palet = [...uniek.values()];
  if (palet.length > 16) throw new Error(`${palet.length} kleuren in :root, meer dan de 16 van vier bits`);
  return palet;
}

// Een PNG-buffer terugbrengen tot palet-indexen, via canvas in de browser.
const naarIndexen = (page, dataUri, W, H, palet) => page.evaluate(async ([uri, W, H, palet]) => {
  const img = new Image(); img.src = uri; await img.decode();
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const uit = new Array(W * H);
  for (let i = 0, n = 0; i < d.length; i += 4, n++) {
    let beste = 0, kort = Infinity;
    for (let k = 0; k < palet.length; k++) {
      const v = (d[i] - palet[k][0]) ** 2 + (d[i + 1] - palet[k][1]) ** 2 + (d[i + 2] - palet[k][2]) ** 2;
      if (v < kort) { kort = v; beste = k; }
    }
    uit[n] = beste;
  }
  return uit;
}, [dataUri, W, H, palet]);

(async () => {
  const html0 = fs.readFileSync(BESTAND, 'utf8');
  const palet = haalPalet(html0);
  console.log(`palet: ${palet.length} kleuren uit :root`);

  const browser = await launch();
  const page = await browser.newPage({
    viewport: { width: BREED, height: HOOG }, deviceScaleFactor: SCHAAL });

  /* Zonder dit is dit script niet idempotent: newGame() schudt de stapel en
     lóót welke ploeg opent (zie de worp in tossTeams), dus twee keer draaien
     gaf twee verschillende bestanden -- en dan staat er bij elke commit een
     ander plaatje in de diff zonder dat er iets gewijzigd is. Een vaste
     reeks in plaats van een vaste uitkomst: de app blijft zichzelf, hij
     dobbelt alleen voorspelbaar. */
  await page.addInitScript(() => {
    let zaad = 20250901;
    Math.random = () => {
      zaad = (zaad * 1103515245 + 12345) & 0x7fffffff;
      return zaad / 0x7fffffff;
    };
  });
  const rauw = {};

  await page.goto(APP_URL);
  await page.waitForSelector('#s-title.on');
  /* animations: 'disabled' zet lopende animaties op hun eindstand en zet ze
     stil. Zonder dat is dit script niet idempotent: de zandloper valt om bij
     binnenkomst en de mascotte op de overdracht ademt, dus twee draaibeurten
     verschilden een paar bytes -- genoeg voor een diff bij elke commit
     waarin niets gewijzigd is. Wachten alleen was niet genoeg; een
     ademhaling houdt nooit op. */
  await page.waitForTimeout(1200);
  rauw.titel = await page.screenshot({ animations: 'disabled' });

  // Titel -> overdracht: newGame() zet meteen het overdrachtscherm neer.
  await page.click('#btnStart');
  await page.waitForFunction(() => window.__tijd.screen === 'handoff');
  await page.waitForTimeout(1200);           // de worp op de eerste overdracht
  rauw.overdracht = await page.screenshot({ animations: 'disabled' });

  const W = BREED * SCHAAL, H = HOOG * SCHAAL;
  const nieuw = {};
  for (const s of SCHERMEN) {
    const uri = 'data:image/png;base64,' + rauw[s.sleutel].toString('base64');
    const indexen = await naarIndexen(page, uri, W, H, palet);
    const png = paletPng(indexen, W, H, palet);
    nieuw[s.sleutel] = png.toString('base64');
    console.log(`${s.sleutel.padEnd(11)} ${W}x${H}  png ${png.length}  base64 ${nieuw[s.sleutel].length}`);
  }
  await browser.close();

  /* Terugschrijven. Elk blok wordt gevonden op zijn eigen label, niet op
     "een lang base64-blok": zo raken dit script en pictogrammen.js elkaars
     platen nooit aan. De hele vermelding wordt vervangen, dus een andere
     rendermaat komt vanzelf ook in sizes terecht. */
  let html = html0;
  for (const s of SCHERMEN) {
    const re = new RegExp(
      `\\{ src: "data:image/png;base64,[^"]*", sizes: "[^"]*", type: "image/png", ` +
      `form_factor: "narrow", label: "${s.label}" \\}`, 'g');
    const treffers = html.match(re) || [];
    if (treffers.length !== 1) throw new Error(`${s.label}: ${treffers.length} treffers, verwachtte er 1`);
    html = html.replace(re,
      `{ src: "data:image/png;base64,${nieuw[s.sleutel]}", sizes: "${W}x${H}", ` +
      `type: "image/png", form_factor: "narrow", label: "${s.label}" }`);
  }
  fs.writeFileSync(BESTAND, html);
  const groei = Buffer.byteLength(html) - Buffer.byteLength(html0);
  console.log(`index.html bijgewerkt (${groei >= 0 ? '+' : ''}${groei} bytes, nu ${Math.round(Buffer.byteLength(html) / 1024)} kB)`);
})();
