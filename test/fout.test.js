/* De foutenbak (worker/fout.mjs) op kaal Node: het Durable Object draait op
   node:sqlite, de Worker krijgt een nagebootste binding. Wat hier getoetst
   wordt: de herkomst, het schoonmaken van een melding, dezelfde fout als één
   regel met een teller, het dagbudget, de sleutel om te lezen. */
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { DatabaseSync } = require('node:sqlite');

(async () => {
  const W = await import(pathToFileURL(path.join(__dirname, '..', 'worker', 'fout.mjs')));
  const Worker = W.default;

  /* ctx.storage.sql van Cloudflare, op node:sqlite. */
  function nepSql() {
    const db = new DatabaseSync(':memory:');
    return { exec(q, ...b) {
      const st = db.prepare(q);
      return /^\s*SELECT/i.test(q) ? st.all(...b) : (st.run(...b), []);
    } };
  }
  function nepEnv(perkeer) {
    const doos = new W.Fouten({ storage: { sql: nepSql() } });
    return {
      doos, LEES: 'geheim',
      PERKEER: { limit: async () => ({ success: perkeer !== false }) },
      FOUTEN: { idFromName: () => 'alle', get: () => ({ fetch: (u, i) => doos.fetch(new Request(u, i)) }) }
    };
  }
  const THUIS = 'https://maxoftheday.github.io';
  const meld = (env, body, herkomst) => Worker.fetch(new Request('https://x.workers.dev/fout', {
    method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: Object.assign({ 'Content-Type': 'text/plain' }, herkomst === null ? {} : { Origin: herkomst || THUIS })
  }), env);
  let n = 0;
  const t = async (naam, f) => { await f(); n++; console.log('ok', n, '-', naam); };

  await t('alleen de eigen site mag melden', async () => {
    const env = nepEnv();
    assert.equal((await meld(env, { b: 'x' }, 'https://elders.example')).status, 403);
    assert.equal((await meld(env, { b: 'x' }, null)).status, 403);
    assert.equal((await meld(env, { b: 'x' })).status, 204);
  });

  await t('een melding wordt kort en kaal bewaard', async () => {
    const r = W.schoon({ b: 'a\nb' + 'x'.repeat(400), s: 'play', v: '2026-11-11 09:00', w: 'Chrome 142 Android', extra: 'weg' });
    assert.equal(r.b.length, 300);
    assert.ok(!/\n/.test(r.b));
    assert.deepEqual(Object.keys(r).sort(), ['b', 's', 'v', 'w']);
    assert.equal(W.schoon('geen json'), null);
    assert.equal(W.schoon({ s: 'play' }), null, 'zonder melding geen regel');
  });

  await t('dezelfde fout op dezelfde versie is één regel met een teller', async () => {
    const env = nepEnv();
    for (let i = 0; i < 3; i++) await meld(env, { b: 'oeps (10:2)', s: 'play', v: 'v1' });
    await meld(env, { b: 'oeps (10:2)', s: 'play', v: 'v2' });
    const rijen = env.doos.lijst();
    assert.equal(rijen.length, 2);
    assert.equal(rijen.find(r => r.v === 'v1').n, 3);
  });

  await t('een slechte body is een 400, een te lange een 413', async () => {
    const env = nepEnv();
    assert.equal((await meld(env, '{kapot')).status, 400);
    assert.equal((await meld(env, { b: 'x'.repeat(3000) })).status, 413);
  });

  await t('te vaak per adres is een 429', async () => {
    assert.equal((await meld(nepEnv(false), { b: 'x' })).status, 429);
  });

  await t('het dagbudget stopt nieuwe regels', async () => {
    const env = nepEnv();
    const nu = Date.UTC(2026, 10, 11);
    for (let i = 0; i < W.PER_DAG; i++) assert.equal(env.doos.meld({ b: 'f' + i, s: '', v: '', w: '' }, nu), true);
    assert.equal(env.doos.meld({ b: 'nog een', s: '', v: '', w: '' }, nu), false);
    assert.equal(env.doos.meld({ b: 'morgen', s: '', v: '', w: '' }, nu + 864e5), true, 'een nieuwe dag mag weer');
  });

  await t('oude regels vallen na dertig dagen weg', async () => {
    const env = nepEnv();
    const nu = Date.UTC(2026, 10, 11);
    env.doos.meld({ b: 'oud', s: '', v: '', w: '' }, nu);
    env.doos.meld({ b: 'nieuw', s: '', v: '', w: '' }, nu + 31 * 864e5);
    assert.deepEqual(env.doos.lijst().map(r => r.b), ['nieuw']);
  });

  await t('lezen kan alleen met de sleutel, en de lijst ontsnapt html', async () => {
    const env = nepEnv();
    await meld(env, { b: '<script>x</script>', s: 'play', v: 'v1', w: 'Safari 18 iOS' });
    const lees = q => Worker.fetch(new Request('https://x.workers.dev/' + q), env);
    assert.equal((await lees('')).status, 404);
    assert.equal((await lees('?sleutel=fout')).status, 404);
    const r = await lees('?sleutel=geheim');
    assert.equal(r.status, 200);
    const html = await r.text();
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(html, /<script>x/);
  });

  console.log(`\nDe foutenbak: ${n} toetsen in orde.`);
})().catch(e => { console.error(e); process.exit(1); });
