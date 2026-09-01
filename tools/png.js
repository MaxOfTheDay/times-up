/*
 * De palet-PNG-schrijver, gedeeld door tools/pictogrammen.js (de vier
 * app-platen) en tools/schermen.js (de screenshots in het manifest).
 *
 * Hij stond in pictogrammen.js en kon maar één ding: vier kleuren, twee
 * bits per pixel, vierkant. Dat is precies genoeg voor een zeefdruk-plaat
 * van inkt, goud en crème, en veel te weinig voor een heel scherm -- dat
 * heeft de hele :root-set nodig. Nu volgt de bitdiepte uit het aantal
 * kleuren, en mag het vlak liggend of staand zijn.
 *
 * Waarom een palet en geen gewone PNG: zachte randen kosten tientallen kB
 * base64 voor een overgang die op geen enkele weergavemaat te zien is, en
 * een zeefdruk heeft sowieso geen kleurverloop aan de rand van een vlak.
 */
const zlib = require('zlib');

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

// Hoeveel bits een index nodig heeft. PNG kent voor palet alleen 1, 2, 4, 8.
function bitsVoor(aantal) {
  if (aantal <= 2) return 1;
  if (aantal <= 4) return 2;
  if (aantal <= 16) return 4;
  if (aantal <= 256) return 8;
  throw new Error('een palet-PNG kan hoogstens 256 kleuren');
}

/* indices: W*H palet-indexen, rij voor rij. palet: [[r,g,b], ...]. */
function paletPng(indices, W, H, palet) {
  const bits = bitsVoor(palet.length);
  const perByte = 8 / bits;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = bits;
  ihdr[9] = 3;   // kleurtype 3 = palet
  const plte = Buffer.from(palet.flat());
  const perRij = Math.ceil(W / perByte);
  const rauw = Buffer.alloc((perRij + 1) * H);
  for (let y = 0; y < H; y++) {
    const rij = y * (perRij + 1);
    rauw[rij] = 0;   // filter "none": bij vlakken zonder verloop wint dat
    for (let x = 0; x < W; x++) {
      rauw[rij + 1 + Math.floor(x / perByte)] |=
        indices[y * W + x] << ((perByte - 1 - (x % perByte)) * bits);
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    stuk('IHDR', ihdr), stuk('PLTE', plte),
    stuk('IDAT', zlib.deflateSync(rauw, { level: 9 })), stuk('IEND', Buffer.alloc(0)),
  ]);
}

module.exports = { crc32, stuk, paletPng, bitsVoor };
