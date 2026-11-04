/* De toverstaf-Worker (worker/tover.mjs) op kaal Node, met een nagebootste
   Workers AI. Wat hier getoetst wordt: de herkomst, het slot op woorden, het
   lezen van het oordeel van het taalmodel en de foutsoorten. Of de tekening
   mooi is, ziet alleen een mens (het proefvel, zie docs/ontwerp.md). */
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const W = await import(pathToFileURL(path.join(__dirname, '..', 'worker', 'tover.mjs')));
  const Worker = W.default;
  const PNG = 'aGFsbG8=';

  function nepAI(oordeel, fout) {
    const log = [];
    return { log, run: async (model, inv) => {
      log.push(model);
      if (fout) throw new Error(fout);
      if (/llama/.test(model)) return { response: oordeel };
      return { image: PNG };
    } };
  }
  const vraag = (woord, herkomst, methode) => new Request('https://x.workers.dev/teken', {
    method: methode || 'POST', body: methode === 'GET' ? undefined : JSON.stringify({ woord }),
    headers: Object.assign({ 'Content-Type': 'text/plain' }, herkomst ? { Origin: herkomst } : {})
  });
  const THUIS = 'https://maxoftheday.github.io';
  let n = 0;
  const t = async (naam, f) => { await f(); n++; console.log('ok', n, '-', naam); };

  await t('een gewoon woord wordt een tekening', async () => {
    const ai = nepAI('Sure: {"en": "a camel", "ok": true}');
    const r = await Worker.fetch(vraag('Kameel', THUIS), { AI: ai });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), THUIS);
    const j = await r.json();
    assert.equal(j.beeld, 'data:image/jpeg;base64,' + PNG);
    assert.equal(j.en, 'a camel');
    assert.equal(ai.log.length, 2);
  });

  await t('een andere herkomst krijgt niets en kost niets', async () => {
    const ai = nepAI('{"en":"a camel","ok":true}');
    const r = await Worker.fetch(vraag('kameel', 'https://elders.example'), { AI: ai });
    assert.equal(r.status, 403);
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal(ai.log.length, 0);
  });

  await t('een woord op de lijst komt niet bij het model', async () => {
    const ai = nepAI('{"en":"x","ok":true}');
    const r = await Worker.fetch(vraag('pistool', THUIS), { AI: ai });
    assert.equal(r.status, 400);
    assert.deepEqual(await r.json(), { fout: 'nee' });
    assert.equal(ai.log.length, 0);
  });

  await t('het taalmodel kan weigeren', async () => {
    const ai = nepAI('{"en": "", "ok": false}');
    const r = await Worker.fetch(vraag('griezel', THUIS), { AI: ai });
    assert.equal(r.status, 400);
    assert.equal(ai.log.length, 1);
  });

  await t('leeg, te lang of geen JSON is nee', async () => {
    for (const w of ['', '   ', 'abcdefghijklmnopq']) {
      const r = await Worker.fetch(vraag(w, THUIS), { AI: nepAI('{"en":"x","ok":true}') });
      assert.equal(r.status, 400, JSON.stringify(w));
    }
    const r = await Worker.fetch(new Request('https://x.workers.dev/teken',
      { method: 'POST', body: 'geen json', headers: { Origin: THUIS } }), { AI: nepAI('') });
    assert.equal(r.status, 400);
  });

  await t('het dagbudget op heet "op", een andere fout "stuk"', async () => {
    let r = await Worker.fetch(vraag('kameel', THUIS), { AI: nepAI('', '4006: you have used up your daily free allocation of 10,000 neurons') });
    assert.equal(r.status, 503); assert.deepEqual(await r.json(), { fout: 'op' });
    r = await Worker.fetch(vraag('kameel', THUIS), { AI: nepAI('', 'internal error') });
    assert.equal(r.status, 502); assert.deepEqual(await r.json(), { fout: 'stuk' });
    r = await Worker.fetch(vraag('kameel', THUIS), { AI: nepAI('ik weet het niet') });
    assert.deepEqual(await r.json(), { fout: 'stuk' });
  });

  await t('de limiet per adres geeft "druk"', async () => {
    const PERKEER = { limit: async () => ({ success: false }) };
    const r = await Worker.fetch(vraag('kameel', THUIS), { AI: nepAI('{"en":"a camel","ok":true}'), PERKEER });
    assert.equal(r.status, 429); assert.deepEqual(await r.json(), { fout: 'druk' });
  });

  await t('alleen POST /teken', async () => {
    const r = await Worker.fetch(new Request('https://x.workers.dev/', { headers: { Origin: THUIS } }), { AI: nepAI('') });
    assert.equal(r.status, 404);
  });

  await t('leesOordeel is streng', async () => {
    assert.equal(W.leesOordeel('niets'), null);
    assert.deepEqual(W.leesOordeel('{"en":"a dog","ok":"true"}'), { ok: false, en: 'a dog' });
    assert.deepEqual(W.leesOordeel('{"en":"","ok":true}'), { ok: false, en: '' });
  });

  console.log(`toverstaf in orde (${n} toetsen)`);
})().catch(e => { console.error(e); process.exit(1); });
