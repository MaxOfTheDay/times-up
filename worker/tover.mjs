/* De toverstaf van Tijd is Om, als Cloudflare Worker. Hoort niet bij de app:
   deze code draait bij Cloudflare, niet op de telefoon. De app werkt zonder;
   alleen de staf in de tekenmaker roept hem aan. Zie docs/ontwerp.md, Toveren.

     POST /teken   body = { woord }   -> { beeld: "data:image/jpeg;base64,..." }
                                       of { fout: "nee" | "druk" | "op" | "stuk" }

   Twee stappen bij Workers AI:
   1. Een klein taalmodel zet het woord om naar een Engels zelfstandig
      naamwoord en zegt of het iets is voor kleuters. FLUX begrijpt Engels het
      best, en "bank" is in het Nederlands een zitbank.
   2. FLUX.1 schnell tekent het in de stijl van de app: een sticker met een
      dikke zwarte lijn, weinig vlakke kleuren, op effen crème. De app knipt
      die achtergrond weg.

   Niets wordt bewaard of gelogd: niet het woord, niet het beeld, niet het
   adres. Cloudflare traint niet op wat Workers AI verwerkt.

   Alleen de eigen Pages-site mag hem aanroepen (CORS). De body gaat als
   text/plain, zodat er geen preflight nodig is. Per adres hoogstens PER_MINUUT
   tekeningen per minuut (de rate-limit-binding van Cloudflare); over de dag
   begrenst het gratis budget van Workers AI de rest. */

const HERKOMST = /^https:\/\/maxoftheday\.github\.io$/;
const TAALMODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast';
const TEKENAAR = '@cf/black-forest-labs/flux-1-schnell';
const MAX_WOORD = 14;            // zoals het woordveld in de maker

/* Wat hier staat komt er nooit door, ook niet als het taalmodel het goedkeurt.
   Klein gehouden: het taalmodel is het eigenlijke slot, dit is de vangrail. */
const NOOIT = /\b(seks|sex|naakt|bloot|porno|lul|kut|tiet|pik|neuk|dood|lijk|bloed|moord|wapen|pistool|geweer|mes|bom|drugs|nazi|hitler)\b/i;

const STIJL = 'A cute flat sticker illustration of {X} for a children\'s card game, ' +
  'centered, the whole subject visible, thick bold black outline, ' +
  'three or four flat colours, no shading, no gradient, no text, no letters, ' +
  'plain flat cream background, simple shapes a four-year-old recognises.';

const VRAAG = 'You translate one Dutch word or short phrase, typed by a parent for a ' +
  'party game with young children, into a short English noun phrase that names ' +
  'the same thing (for example: "luiaard" -> "a sloth", "brandweerauto" -> ' +
  '"a fire engine", "oma" -> "a grandmother"). Answer with JSON only: ' +
  '{"en": "<english>", "ok": true} if it is a concrete, harmless thing a young ' +
  'child could draw, or {"en": "", "ok": false} if it is violent, sexual, ' +
  'scary, hateful, a brand, a real famous person, or not a thing at all.';

function antwoord(data, status, herkomst) {
  const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
  if (herkomst) h['Access-Control-Allow-Origin'] = herkomst;
  return new Response(JSON.stringify(data), { status: status || 200, headers: h });
}

/* Het eerste JSON-object uit een antwoord dat er meer omheen kan zetten.
   Workers AI geeft een antwoord dat zelf JSON is soms al ontleed terug. */
export function leesOordeel(tekst) {
  let o = tekst && typeof tekst === 'object' ? tekst : null;
  if (!o) {
    const m = String(tekst || '').match(/\{[\s\S]*?\}/);
    if (!m) return null;
    try { o = JSON.parse(m[0]); } catch (e) { return null; }
  }
  try {
    const en = typeof o.en === 'string' ? o.en.trim().slice(0, 60) : '';
    return { ok: o.ok === true && !!en, en: en };
  } catch (e) { return null; }
}

/* Een fout van Workers AI over het dagbudget heet anders dan een gewone.
   Bij "stuk" zegt waarom kort welke stap het was: zonder logging is dat de
   enige weg om het te zien. Het bevat nooit het woord. */
function stuk(stap, e) {
  const fout = soortFout(e);
  return fout === 'op' ? { fout } : { fout, waarom: (stap + ': ' + String(e && (e.message || e))).slice(0, 160) };
}

/* Een fout van Workers AI over het dagbudget heet anders dan een gewone. */
export function soortFout(e) {
  const t = String(e && (e.message || e)).toLowerCase();
  return /neuron|quota|daily|limit|4006|3036/.test(t) ? 'op' : 'stuk';
}

async function base64(beeld) {
  if (typeof beeld === 'string') return beeld;
  const buf = new Uint8Array(await new Response(beeld).arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function teken(woord, env) {
  woord = String(woord || '').trim().toLocaleLowerCase('nl');
  if (!woord || woord.length > MAX_WOORD || NOOIT.test(woord)) return { fout: 'nee' };
  let oordeel;
  try {
    const r = await env.AI.run(TAALMODEL, {
      messages: [{ role: 'system', content: VRAAG }, { role: 'user', content: woord }],
      max_tokens: 40, temperature: 0
    });
    oordeel = leesOordeel(r && r.response);
    if (!oordeel) return { fout: 'stuk', waarom: 'oordeel: ' + typeof (r && r.response) };
  } catch (e) { return stuk('taal', e); }
  if (!oordeel.ok) return { fout: 'nee' };
  try {
    const r = await env.AI.run(TEKENAAR, {
      prompt: STIJL.replace('{X}', oordeel.en),
      steps: 4   // FLUX.1 schnell kent geen seed: elke vraag tekent al anders
    });
    if (!r || !r.image) return { fout: 'stuk', waarom: 'teken: geen beeld' };
    return { beeld: 'data:image/jpeg;base64,' + await base64(r.image), en: oordeel.en };
  } catch (e) { return stuk('teken', e); }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const herkomst = req.headers.get('Origin') || '';
    const mag = HERKOMST.test(herkomst) ? herkomst : '';
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': mag, 'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' } });
    }
    if (req.method !== 'POST' || url.pathname !== '/teken') return antwoord({ fout: 'nee' }, 404, mag);
    if (!mag) return antwoord({ fout: 'nee' }, 403);
    if (env.PERKEER) {
      const sleutel = req.headers.get('CF-Connecting-IP') || 'onbekend';
      const { success } = await env.PERKEER.limit({ key: sleutel });
      if (!success) return antwoord({ fout: 'druk' }, 429, mag);
    }
    let woord = '';
    try { woord = JSON.parse(await req.text()).woord; } catch (e) {}
    const uit = await teken(woord, env);
    const status = uit.beeld ? 200 : uit.fout === 'nee' ? 400 : uit.fout === 'op' ? 503 : 502;
    return antwoord(uit, status, mag);
  }
};
