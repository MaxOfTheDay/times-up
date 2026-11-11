/* De foutenbak van Tijd is Om, als Cloudflare Worker. Hoort niet bij de app:
   deze code draait bij Cloudflare. De app werkt zonder; hij meldt hier alleen
   een scriptfout, zodat Max ziet wat er op een andere telefoon misgaat. Zie
   docs/ontwerp.md, "Een fout meldt zichzelf".

     POST /fout   body = { b, s, v, w }   -> 204
       b  de melding (hoogstens 300 tekens, met de plek in de code)
       s  het scherm waarop het gebeurde ("play", "handoff", ...)
       v  de versie van de app (de datum van index.html)
       w  de browser, kort ("Chrome 142 Android")
     GET /?sleutel=...                    -> een lijst om te lezen

   Wat er bewaard wordt is alleen dat: geen adres, geen kaarten, geen
   woorden, geen foto's. Dezelfde fout op dezelfde versie is één regel met
   een teller. Na dertig dagen zonder nieuwe melding valt een regel weg.

   Opslag in één Durable Object met SQLite (de klasse Fouten): dat zit in het
   gratis plan en vraagt geen KV of D1. Per adres hoogstens PER_MINUUT
   meldingen (de rate-limit-binding), en over de hele wereld hoogstens
   PER_DAG nieuwe of bijgewerkte regels per dag.

   Alleen de eigen Pages-site mag melden (CORS); de body gaat als text/plain,
   zodat er geen preflight nodig is. Lezen kan alleen met de sleutel (het
   geheim LEES). Elke aanvaarde melding gaat ook als één logregel naar
   Workers Logs, voor de dagelijkse controle. */
const HERKOMST = /^https:\/\/maxoftheday\.github\.io$/;
export const PER_DAG = 500;
const BEWAAR_MS = 30 * 24 * 3600 * 1000;

/* Een melding zoals ze bewaard wordt: alleen tekst, kort, zonder regeleinden. */
export function schoon(ruw) {
  let o;
  try { o = typeof ruw === 'string' ? JSON.parse(ruw) : ruw; } catch (e) { return null; }
  if (!o || typeof o !== 'object') return null;
  const veld = (x, n) => String(x == null ? '' : x).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, n);
  const r = { b: veld(o.b, 300), s: veld(o.s, 20), v: veld(o.v, 24), w: veld(o.w, 60) };
  return r.b ? r : null;
}

/* Een Durable Object op de oude manier, met fetch() in plaats van RPC: zo
   heeft dit bestand geen import van cloudflare:workers en draait de test het
   op kaal Node (test/fout.test.js, met node:sqlite). */
export class Fouten {
  constructor(ctx) {
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS fout (
      b TEXT, v TEXT, s TEXT, w TEXT, n INTEGER, eerst INTEGER, laatst INTEGER,
      PRIMARY KEY (b, v))`);
    this.sql.exec('CREATE TABLE IF NOT EXISTS dag (d TEXT PRIMARY KEY, n INTEGER)');
  }
  /* Eén melding erbij. false als het dagbudget op is. */
  meld(r, nu) {
    const d = new Date(nu).toISOString().slice(0, 10);
    const tel = [...this.sql.exec('SELECT n FROM dag WHERE d = ?', d)][0];
    if (tel && tel.n >= PER_DAG) return false;
    this.sql.exec('INSERT INTO dag (d, n) VALUES (?, 1) ON CONFLICT(d) DO UPDATE SET n = n + 1', d);
    this.sql.exec(`INSERT INTO fout (b, v, s, w, n, eerst, laatst) VALUES (?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(b, v) DO UPDATE SET n = n + 1, laatst = excluded.laatst, s = excluded.s, w = excluded.w`,
      r.b, r.v, r.s, r.w, nu, nu);
    this.sql.exec('DELETE FROM fout WHERE laatst < ?', nu - BEWAAR_MS);
    this.sql.exec('DELETE FROM dag WHERE d < ?', new Date(nu - 7 * 864e5).toISOString().slice(0, 10));
    return true;
  }
  lijst() {
    return [...this.sql.exec('SELECT b, v, s, w, n, eerst, laatst FROM fout ORDER BY laatst DESC LIMIT 200')];
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/meld') {
      const { r, nu } = await req.json();
      return Response.json({ ok: this.meld(r, nu) });
    }
    return Response.json(this.lijst());
  }
}

const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const wanneer = ms => new Date(ms).toISOString().slice(0, 16).replace('T', ' ');

export function pagina(rijen) {
  const lijst = rijen.length ? rijen.map(r => `
    <li><b>${esc(r.b)}</b>
      <span>${r.n}× · ${esc(r.s || '-')} · versie ${esc(r.v || '-')} · ${esc(r.w || '-')}</span>
      <span>eerst ${wanneer(r.eerst)} · laatst ${wanneer(r.laatst)} (UTC)</span></li>`).join('')
    : '<li>Geen fouten in de laatste dertig dagen.</li>';
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta name="robots" content="noindex"><title>Fouten · Tijd is Om</title>
<style>body{margin:0;padding:20px 16px 40px;background:#F4EBDA;color:#14110F;font:15px/1.45 system-ui,sans-serif}
h1{font-size:20px;margin:0 0 14px}ul{list-style:none;margin:0;padding:0;display:grid;gap:10px;max-width:720px}
li{background:#F4EBDA;border:3px solid #14110F;box-shadow:4px 4px 0 #14110F;padding:10px 12px;display:grid;gap:3px}
b{font-family:ui-monospace,Menlo,monospace;font-size:13px;word-break:break-word}span{color:#5C5142;font-size:13px}</style>
<h1>Fouten in Tijd is Om</h1><ul>${lijst}</ul>`;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const herkomst = req.headers.get('Origin') || '';
    const doos = () => env.FOUTEN.get(env.FOUTEN.idFromName('alle'));

    if (req.method === 'POST' && url.pathname === '/fout') {
      const cors = HERKOMST.test(herkomst) ? { 'Access-Control-Allow-Origin': herkomst } : {};
      if (!HERKOMST.test(herkomst)) return new Response(null, { status: 403 });
      const ip = req.headers.get('CF-Connecting-IP') || 'onbekend';
      if (env.PERKEER) {
        const { success } = await env.PERKEER.limit({ key: ip });
        if (!success) return new Response(null, { status: 429, headers: cors });
      }
      const tekst = await req.text();
      if (tekst.length > 2000) return new Response(null, { status: 413, headers: cors });
      const r = schoon(tekst);
      if (!r) return new Response(null, { status: 400, headers: cors });
      const uit = await doos().fetch('https://doos/meld', { method: 'POST', body: JSON.stringify({ r, nu: Date.now() }) });
      const { ok } = await uit.json();
      /* Ook in de logs van Cloudflare (Workers Logs, drie dagen), zodat een
         dagelijkse controle de nieuwe fouten leest met de API, zonder de
         sleutel. Alleen deze vier velden; de aanvraag zelf logt niet
         (invocation_logs uit in fout.toml). */
      if (ok) console.log(JSON.stringify({ foutenbak: 1, b: r.b, s: r.s, v: r.v, w: r.w }));
      return new Response(null, { status: ok ? 204 : 429, headers: cors });
    }

    if (req.method === 'GET' && url.pathname === '/') {
      if (!env.LEES || url.searchParams.get('sleutel') !== env.LEES) return new Response('Niet gevonden', { status: 404 });
      const rijen = await (await doos().fetch('https://doos/lijst')).json();
      return new Response(pagina(rijen), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }

    return new Response('Niet gevonden', { status: 404 });
  }
};
