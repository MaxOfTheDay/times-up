/*
 * Tekent de vier app-pictogrammen van "Tijd is Om" en schrijft ze als
 * base64 terug in index.html.
 *
 *   node tools/pictogrammen.js          (of: npm run pictogrammen)
 *
 * Draai dit opnieuw zodra #i-glass wijzigt. Doe je dat niet, dan staat er
 * op het beginscherm van het toestel een andere zandloper dan op het
 * beginscherm van de app -- en dat ziet niemand zonder ze naast elkaar te
 * leggen. Precies dát was er gebeurd toen de platen nog uit overgetypte
 * coordinaten werden opgebouwd: de balken misten hun ronde uiteinden en de
 * strik haar ronde hoeken.
 *
 * Twee stappen. Chromium rendert het symbool -- de paden komen letterlijk
 * uit index.html, dus er valt niets over te typen -- en hieronder wordt dat
 * teruggebracht tot precies drie kleuren in een palet-PNG. Die tweede stap
 * is geen afwerking maar de helft van de winst: zachte randen kosten zo'n
 * 31 kB base64 extra voor een overgang die op geen enkele weergavemaat te
 * zien is. Een zeefdruk heeft ook geen kleurverloop aan de rand van een vlak.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Dezelfde browserstart als de tests: die weet al waar Chromium staat en
// hoe je er een eigen pad voor meegeeft (CHROME=...).
const { launch } = require('../test/browser.js');

const BESTAND = path.resolve(__dirname, '..', 'index.html');
const PALET = [[0x14, 0x11, 0x0F], [0xF2, 0xB7, 0x05], [0xF4, 0xEB, 0xDA]]; // inkt, goud, creme

/* De maten. "f" is hoe hoog de zandloper staat ten opzichte van de tegel.

   0.80 volvlaks: 10% marge boven en onder, zoals elk ander pictogram op een
        beginscherm. Het stond op 90% en drukte tegen zijn eigen randen.
   0.64 maskable: het toestel legt er zijn eigen masker overheen, dus alles
        moet binnen een cirkel van 80% blijven. Met een teken van 66 bij 90
        eenheden is dit de bovengrens -- de halve diagonaal komt dan op
        39,7% en de limiet is 40. Kleiner hoeft niet, groter kan niet. */
const ICONEN = [
  { sleutel: 'icon192', S: 192, f: 0.80 },
  { sleutel: 'icon512', S: 512, f: 0.80 },
  { sleutel: 'apple180', S: 180, f: 0.80 },
  { sleutel: 'maskable512', S: 512, f: 0.64 },
];

/* De twee paden van #i-glass, uit index.html gelezen zodat ze niet apart
   onderhouden hoeven te worden. */
function haalGlas(html) {
  const m = html.match(/<symbol id="i-glass"[^>]*>([\s\S]*?)<\/symbol>/);
  if (!m) throw new Error('#i-glass niet gevonden in index.html');
  return m[1];
}

/* Waar het teken in de 100x100 van het symbool ligt: de balken hebben ronde
   uiteinden en steken dus de halve streekdikte (5) buiten x=22..78 uit, en
   staan met hun eigen dikte op y=5..95. Dat is 66 bij 90, midden (50,50). */
const GLAS_H = 90;

const svg = (glas, S, f) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
  `<rect width="${S}" height="${S}" fill="#14110F"/>` +
  `<g transform="translate(${S / 2},${S / 2}) scale(${(S * f) / GLAS_H}) translate(-50,-50)">${glas}</g></svg>`;

// ---- PNG met palet, twee bits per pixel -------------------------------
const TABEL = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const b of buf) c = TABEL[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function stuk(type, data) {
  const lengte = Buffer.alloc(4);
  lengte.writeUInt32BE(data.length);
  const romp = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const som = Buffer.alloc(4);
  som.writeUInt32BE(crc32(romp));
  return Buffer.concat([lengte, romp, som]);
}
function paletPng(indices, S) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 2;   // twee bits per pixel: vier kleuren, wij gebruiken er drie
  ihdr[9] = 3;   // kleurtype 3 = palet
  const plte = Buffer.from(PALET.flat());
  const perRij = Math.ceil(S / 4);
  const rauw = Buffer.alloc((perRij + 1) * S);
  for (let y = 0; y < S; y++) {
    const rij = y * (perRij + 1);
    rauw[rij] = 0;  // filter "none": bij vlakken zonder verloop wint dat
    for (let x = 0; x < S; x++) {
      rauw[rij + 1 + (x >> 2)] |= indices[y * S + x] << ((3 - (x & 3)) * 2);
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    stuk('IHDR', ihdr), stuk('PLTE', plte),
    stuk('IDAT', zlib.deflateSync(rauw, { level: 9 })), stuk('IEND', Buffer.alloc(0)),
  ]);
}

(async () => {
  let html = fs.readFileSync(BESTAND, 'utf8');
  const glas = haalGlas(html);
  const browser = await launch();
  const page = await browser.newPage();
  const nieuw = {};

  for (const ic of ICONEN) {
    const bron = 'data:image/svg+xml;base64,' +
      Buffer.from(svg(glas, ic.S, ic.f)).toString('base64');
    const indices = await page.evaluate(async ([bron, S, palet]) => {
      const img = new Image(); img.src = bron; await img.decode();
      const c = document.createElement('canvas'); c.width = S; c.height = S;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0, S, S);
      const d = x.getImageData(0, 0, S, S).data;
      const uit = new Array(S * S);
      for (let i = 0, n = 0; i < d.length; i += 4, n++) {
        let beste = 0, kort = Infinity;
        for (let k = 0; k < palet.length; k++) {
          const v = (d[i] - palet[k][0]) ** 2 + (d[i + 1] - palet[k][1]) ** 2 + (d[i + 2] - palet[k][2]) ** 2;
          if (v < kort) { kort = v; beste = k; }
        }
        uit[n] = beste;
      }
      return uit;
    }, [bron, ic.S, PALET]);
    nieuw[ic.sleutel] = paletPng(indices, ic.S).toString('base64');
    console.log(`${ic.sleutel.padEnd(12)} ${ic.S}px  f=${ic.f}  base64 ${nieuw[ic.sleutel].length}`);
  }
  await browser.close();

  /* Terugschrijven op hun plek. De 192 staat maar één keer in het bestand
     -- het manifest leest hem uit de <link rel="icon"> -- dus er zijn vier
     base64-blokken en vier pictogrammen, in deze volgorde. */
  const blokken = [...html.matchAll(/base64,([A-Za-z0-9+/=]{500,})/g)];
  if (blokken.length !== ICONEN.length) {
    throw new Error(`verwachtte ${ICONEN.length} base64-blokken, vond er ${blokken.length}`);
  }
  const volgorde = ['icon192', 'apple180', 'icon512', 'maskable512']; // zoals ze in index.html staan
  for (let i = blokken.length - 1; i >= 0; i--) {  // van achter naar voren: de posities blijven kloppen
    const m = blokken[i];
    const begin = m.index + 'base64,'.length;
    html = html.slice(0, begin) + nieuw[volgorde[i]] + html.slice(begin + m[1].length);
  }
  fs.writeFileSync(BESTAND, html);
  console.log('index.html bijgewerkt');
})();
