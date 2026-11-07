/*
 * Test-suite voor de kaarten.
 *
 * Wat hier hard gemaakt is, omdat het met het blote oog niet te controleren
 * is over ruim 250 kaarten:
 *
 *   1. elke tier heeft minstens 60 kaarten;
 *   2. geen dubbele emoji of woorden -- en dat wordt getoetst op de pool
 *      waarmee echt gespeeld wordt, niet op elke tier apart. Een kaart die
 *      in twee tiers staat zit anders twee keer in één potje, en zo bleven
 *      "hamer" (klein + midden) en "slapen" (midden + groot) lang
 *      onopgemerkt: per tier klopte het. Sinds een stand een plafond is
 *      (poolFor) is de pool van groot de hele verzameling, dus deze controle
 *      dekt nu in één keer alle 275 kaarten in plaats van twee banden;
 *   2b. elke stand bevat alles wat eronder zit, en groeit met precies zijn
 *      eigen band. Dat is de invariant waar de kaartenbak, de telling in de
 *      vouwregel en de ondergrens allemaal op leunen;
 *   3. elke emoji tekent ook echt. Een kaart die als ▯ verschijnt is
 *      onspeelbaar voor een kind dat niet kan lezen, en een reservebeeld is
 *      er bewust niet. We meten de glyphbreedte en vergelijken die met een
 *      teken dat gegarandeerd ontbreekt.
 *
 * Wat hier NIET getoetst wordt, en waar CLAUDE.md ten onrechte anders over
 * beweerde:
 *
 *   - "één betekenis los van context" is een ontwerpregel voor mensen; geen
 *     test kan dat zien;
 *   - de bovengrens op de Unicode-versie. De controle hieronder meet of een
 *     glyph tekent op de máchine die de test draait, en die heeft een verse
 *     letterfamilie. Een splinternieuwe emoji komt hier dus glansrijk door
 *     en staat op een oude tablet alsnog als ▯. Dat blijft een kwestie van
 *     kiezen met verstand en één keer op het echte toestel kijken.
 *
 * Draaien: npm run test:kaarten   (of npm test voor alles)
 */
const { launch, APP_URL } = require('./browser');

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

(async () => {
  const browser = await launch();
  const page = await browser.newPage();
  await page.goto(APP_URL);
  await page.waitForTimeout(200);

  const info = await page.evaluate(() => {
    const { DECKS, TIER_ORDER, poolFor } = window.__tijd;
    const out = {};
    for (const k of TIER_ORDER) {
      // De pool waarmee die tier echt speelt: zichzelf plus de tier eronder.
      const pool = poolFor(k);
      const emo = pool.map(c => c[0]), words = pool.map(c => c[1]);
      out[k] = {
        eigen: DECKS[k].length,
        n: pool.length,
        dupEmoji: [...new Set(emo.filter((e, i) => emo.indexOf(e) !== i))],
        dupWord: [...new Set(words.filter((w, i) => words.indexOf(w) !== i))],
        bad: pool.filter(c => c.length !== 2 || !c[0] || !c[1]).length,
      };
    }
    return out;
  });

  for (const [tier, i] of Object.entries(info)) {
    ok(i.eigen >= 60, `${tier}: maar ${i.eigen} eigen kaarten (>= 60 vereist)`);
    ok(!i.dupEmoji.length, `${tier}: dubbele emoji in de pool ${i.dupEmoji}`);
    ok(!i.dupWord.length, `${tier}: dubbele woorden in de pool ${i.dupWord}`);
    ok(!i.bad, `${tier}: ${i.bad} misvormde kaarten`);
    console.log(`  ${tier}: ${i.eigen} eigen, ${i.n} in de pool`);
  }

  const tofu = await page.evaluate(() => {
    const cv = document.createElement('canvas').getContext('2d');
    cv.font = '64px sans-serif';
    const ref = cv.measureText('\u{10FFFD}').width;   // bestaat nooit
    const out = [];
    const D = window.__tijd.DECKS;
    for (const k of Object.keys(D))
      for (const [e, w] of D[k])
        if (Math.abs(cv.measureText(e).width - ref) < 0.5) out.push(`${k}:${e}=${w}`);
    return out;
  });
  ok(!tofu.length, 'emoji zonder glyph: ' + tofu.join(', '));

  /* ------------------------------------------------------------------
   * Elke stand is een plafond: hij bevat alles wat eronder zit.
   *
   * Met het blote oog niet te zien -- je zou 275 kaarten met elkaar moeten
   * vergelijken. En het is de invariant waar de rest op leunt: de telling
   * die met elke stap groeit, de zin eronder die zegt dat je gerust hoger
   * kunt kiezen, en de kaartenbak die weggelegde kaarten laat staan als je
   * omhoog gaat. Zakt hier iets weg, dan liegt het scherm meteen mee.
   * ------------------------------------------------------------------ */
  const plafond = await page.evaluate(() => {
    const { DECKS, TIER_ORDER, poolFor } = window.__tijd;
    const woorden = t => new Set(poolFor(t).map(c => c[1]));
    const stappen = [];
    for (let i = 1; i < TIER_ORDER.length; i++) {
      const onder = woorden(TIER_ORDER[i - 1]), boven = woorden(TIER_ORDER[i]);
      stappen.push({
        onder: TIER_ORDER[i - 1], boven: TIER_ORDER[i],
        mist: [...onder].filter(w => !boven.has(w)),
        groei: boven.size - onder.size,
        eigen: DECKS[TIER_ORDER[i]].length,
      });
    }
    const top = TIER_ORDER[TIER_ORDER.length - 1];
    return {
      stappen,
      zwaarste: poolFor(top).length,
      alles: TIER_ORDER.reduce((a, t) => a + DECKS[t].length, 0),
    };
  });

  for (const st of plafond.stappen) {
    ok(!st.mist.length, `${st.boven} mist kaarten die in ${st.onder} wel zitten: ${st.mist}`);
    ok(st.groei === st.eigen,
       `${st.boven} groeit met ${st.groei} kaarten in plaats van met zijn eigen ${st.eigen}`);
  }
  ok(plafond.zwaarste === plafond.alles,
     `de zwaarste stand speelt met ${plafond.zwaarste} van de ${plafond.alles} kaarten`);
  console.log(`  plafond: elke stand bevat alles eronder, zwaarste ${plafond.zwaarste} kaarten`);

  /* ------------------------------------------------------------------
   * De kaartenbak: wat de volwassene weglegt, komt niet meer langs.
   *
   * Dit is de enige plek in de app waar een keuze van de volwassene een
   * kaart uit het spel houdt, en ze is met het blote oog niet te
   * controleren: je zou tweehonderd potjes moeten spelen om te zien of
   * "boom" echt weg is.
   * ------------------------------------------------------------------ */
  const bak = await page.evaluate(() => {
    const T = window.__tijd;
    const zet = w => { T.settings.hidden = w; };
    const out = {};

    zet([]);
    out.vol = T.bakFor('klein').length;

    // Eén kaart weg: uit de bak van elke stand waar ze in zit, en uit elk
    // potje dat daarna getrokken wordt.
    zet(['boom']);
    out.naEen = T.bakFor('klein').length;
    out.inPotjes = false;
    for (let i = 0; i < 300; i++)
      if (T.drawDeck('klein', 32).some(c => c[1] === 'boom')) out.inPotjes = true;
    // "boom" is een makkelijke kaart, en elke stand is een plafond: ze zit
    // dus in alle drie de bakken, en alle drie horen te krimpen.
    out.medium = T.poolFor('midden').length - T.bakFor('midden').length;
    out.moeilijk = T.poolFor('groot').length - T.bakFor('groot').length;

    // De ondergrens kijkt naar álle drie de standen, ook die waar je nu
    // niet in staat: anders leeg je vanuit Medium (183 kaarten) de bak van
    // Makkelijk (90) zonder dat er ooit iets tegenhoudt.
    zet(window.__tijd.DECKS.klein.slice(0, 50).map(c => c[1]));
    out.kleinOver = T.bakFor('klein').length;
    out.nogEenMakkelijke = T.canHide(window.__tijd.DECKS.klein[50][1]);
    out.nogEenMoeilijke = T.canHide(window.__tijd.DECKS.groot[0][1]);

    zet([]);
    return out;
  });

  ok(bak.naEen === bak.vol - 1, `een weggelegde kaart verdwijnt niet uit de bak (${bak.vol} -> ${bak.naEen})`);
  ok(!bak.inPotjes, 'een weggelegde kaart wordt in 300 potjes tóch nog getrokken');
  ok(bak.medium === 1, 'een weggelegde makkelijke kaart zit nog in de bak van Medium');
  ok(bak.moeilijk === 1, 'een weggelegde makkelijke kaart krimpt de bak van Moeilijk niet, terwijl elke stand alles eronder bevat');
  ok(bak.kleinOver === 40, `Makkelijk houdt ${bak.kleinOver} kaarten over in plaats van 40`);
  ok(!bak.nogEenMakkelijke, 'de ondergrens van 40 laat er tóch nog een makkelijke kaart uit');
  ok(bak.nogEenMoeilijke, 'de ondergrens houdt een moeilijke kaart tegen terwijl Makkelijk daar niet door krimpt');


  /* ------------------------------------------------------------------
   * Eigen kaarten, door de echte maker: een foto kiezen, het woord typen,
   * bewaren. Daarna moet de kaart in een potje terechtkomen, de gewone
   * kaart met hetzelfde woord verdringen, en op de kaart als foto staan.
   * De regels zelf (het kwart, de rotatie) staan in test/kern.test.js.
   * ------------------------------------------------------------------ */
  // Een PNG van 2 bij 2 pixels: genoeg om te knippen en te bewaren.
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP4z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==', 'base64');
  await page.evaluate(() => window.__tijd.eigenKlaar);
  await page.click('#btnGear');
  // Zonder eigen kaarten is de rij van Eigen een gestippelde plus die meteen
  // de maker opent.
  ok(await page.evaluate(() => document.querySelector('#kaartEigen').classList.contains('leeg')),
    'de rij Eigen toont geen lege plek zonder eigen kaarten');
  await page.click('#rijEigen');
  await page.setInputFiles('#mkBestand', { name: 'hond.png', mimeType: 'image/png', buffer: png });
  await page.waitForFunction(() => document.querySelector('#mkVak').classList.contains('vol'));
  await page.fill('#mkWoord', 'hond');
  await page.click('#mkBewaar');
  await page.waitForFunction(() => document.querySelectorAll('#eigenRij .eigen-tegel').length === 1);
  // Na bewaren staat het kaartenscherm open op Eigen, met de nieuwe kaart.
  const stapel = await page.evaluate(() => ({
    scherm: document.querySelector('#s-kaarten').classList.contains('on'),
    lade: !document.querySelector('#ladeEigen').hidden,
    tal: document.querySelector('#eigenTel').textContent,
    leeg: document.querySelector('#kaartEigen').classList.contains('leeg') }));
  ok(stapel.scherm && stapel.lade && stapel.tal === '1' && !stapel.leeg,
    `na bewaren staat Eigen niet open op de nieuwe kaart (${JSON.stringify(stapel)})`);
  // Bovenaan Eigen: de knoppen van "In elk potje" tonen vaste getallen,
  // met één eigen kaart draagt de tweede knop 1 en liggen de rest
  // verzonken met hun eigen getal; de uitkomst zegt 1 van de 24. Op
  // Instellingen zegt de rij van Eigen hetzelfde.
  const potje = await page.evaluate(() => {
    document.querySelector('#sizeChips [data-size="24"]').click();
    return {
      zichtbaar: !document.querySelector('#eigenAantalVeld').hidden,
      knoppen: [...document.querySelectorAll('#eigenAantalChips .chip .n')].map(n => n.textContent).join(','),
      op: [...document.querySelectorAll('#eigenAantalChips .chip.op')].length,
      gekozen: document.querySelector('#eigenAantalChips [aria-checked="true"] .n').textContent,
      tal: document.querySelector('#eigenUitkomst').textContent,
      rij: document.querySelector('#eigSub').textContent };
  });
  ok(potje.zichtbaar && potje.knoppen === '0,1,4,8' && potje.op === 2 && potje.gekozen === '1'
    && potje.tal === '1 van de 24' && potje.rij === '1 in elk potje',
    `het aantal klopt niet met één eigen kaart bij 24 (${JSON.stringify(potje)})`);
  await page.click('#btnKaartenTerug');
  await page.click('#rijEigen');
  const eigen = await page.evaluate(() => {
    const T = window.__tijd;
    const out = { lijst: T.eigen.kaarten.length, beeld: T.beelden.size, inPotje: 0, gewoneHond: 0 };
    for (let i = 0; i < 50; i++) {
      const greep = T.drawDeck('klein', 16);
      if (greep.some(c => T.Spel.eigenId(c) !== null)) out.inPotje++;
      if (greep.some(c => c[0] === '🐶')) out.gewoneHond++;
    }
    T.settings.eigenAantal = 0;
    out.uit = T.drawDeck('klein', 16).some(c => T.Spel.eigenId(c) !== null);
    T.settings.eigenAantal = 4;
    return out;
  });
  ok(eigen.lijst === 1 && eigen.beeld === 1, 'de bewaarde eigen kaart staat niet in de lijst of heeft geen beeld');
  ok(eigen.inPotje === 50, `de eigen kaart zat in ${eigen.inPotje} van de 50 potjes in plaats van in alle`);
  ok(eigen.gewoneHond === 0, 'de gewone kaart "hond" komt nog in een potje terwijl er een eigen "hond" is');
  ok(!eigen.uit, 'eigen kaarten op uit komen toch in een potje');

  /* ------------------------------------------------------------------
   * Toveren, met een nagebootste Worker: de staf ligt op het lege vel, de
   * tekening landt erop met een doorzichtige achtergrond, stap terug haalt
   * haar weg, en een leeg dagbudget zet de zandloper op de staf. De Worker
   * zelf staat in test/tover.test.js.
   * ------------------------------------------------------------------ */
  // Een "FLUX-beeld": effen crème met een gele bol met inktrand.
  const nepBeeld = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#F3EAD8'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#F2B705'; g.strokeStyle = '#14110F'; g.lineWidth = 10;
    g.beginPath(); g.arc(128, 128, 70, 0, 7); g.fill(); g.stroke();
    return c.toDataURL('image/jpeg', .9);
  });
  let antwoord = { beeld: nepBeeld };
  let vragen = 0;
  await page.route('**/teken', async route => {
    vragen++;
    await new Promise(r => setTimeout(r, 400));  // zodat de staf even tovert
    await route.fulfill({ status: antwoord.beeld ? 200 : 503, contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(antwoord) });
  });
  await page.click('#btnEigenNieuw');
  await page.click('#mkSoort [data-soort="tekening"]');
  const stafLeeg = await page.evaluate(() => {
    const b = document.querySelector('#mkStaf');
    return { zichtbaar: !b.hidden, klaar: b.classList.contains('klaar') };
  });
  ok(stafLeeg.zichtbaar && !stafLeeg.klaar, 'de staf ligt niet grijs op het lege vel');
  await page.click('#mkStaf');
  ok(vragen === 0, 'de staf vroeg een tekening zonder woord');
  // Al in het spel: een woord van een gewone kaart krijgt een regel, een ander niet.
  await page.fill('#mkWoord', 'blub');
  ok(await page.evaluate(() => !document.querySelector('#mkAl').classList.contains('aan') && getComputedStyle(document.querySelector('#mkAl')).visibility === 'hidden'), '"al in het spel" staat er bij een woord dat geen kaart is');
  await page.fill('#mkWoord', 'zon');
  ok(await page.evaluate(() => document.querySelector('#mkAl').classList.contains('aan') && !!document.querySelector('#mkAl .mk-al-teken').textContent),
     '"al in het spel" ontbreekt bij een woord dat al een gewone kaart is');
  ok(await page.evaluate(() => document.querySelector('#mkStaf').classList.contains('klaar')), 'de staf wordt niet goud met een woord');
  await page.click('#mkStaf');
  ok(await page.evaluate(() => document.querySelector('#mkStaf').getAttribute('aria-busy') === 'true' && !document.querySelector('#mkTovert').hidden),
     'de staf blijft niet ingedrukt op de punten terwijl hij tovert');
  await page.waitForFunction(() => document.querySelector('#mkStaf').hidden && !document.querySelector('#mkStafRij').hidden);
  const vel = await page.evaluate(() => {
    // Punten in eenheden van 512; het vel zelf tekent groter (VEL).
    const c = document.querySelector('#mkDoek'), g = c.getContext('2d'), k = c.width / 512;
    const px = (x, y) => g.getImageData(Math.round(x * k), Math.round(y * k), 1, 1).data[3];
    return { hoek: px(4, 4), midden: px(256, 256), rand: px(30, 256),
             bewaar: !document.querySelector('#mkBewaar').disabled };
  });
  ok(vel.rand > 0, 'de getoverde tekening is niet bijgesneden tot de rand van het vel');
  ok(vragen === 1, `de staf vroeg ${vragen} tekeningen in plaats van één`);
  ok(vel.hoek === 0, 'de crème achtergrond van de getoverde tekening is niet weggeknipt');
  ok(vel.midden === 255, 'de getoverde tekening staat niet op het vel');
  ok(vel.bewaar, 'Bewaren gaat niet aan na toveren');
  // Bewaard is ze kaal: haar eigen lijn, geen pen van .glyph erom.
  await page.click('#mkBewaar');
  await page.waitForFunction(() => !document.querySelector('#s-maker').classList.contains('on'));
  const getoverd = await page.evaluate(() => JSON.parse(localStorage.getItem('tijdisom.eigen')).kaarten.find(k => k.woord === 'zon'));
  ok(getoverd && getoverd.getoverd === true, 'een getoverde kaart onthoudt niet dat ze getoverd is');
  await page.click('#btnEigenNieuw');
  await page.click('#mkSoort [data-soort="tekening"]');
  await page.fill('#mkWoord', 'maan');
  await page.click('#mkStaf');
  await page.waitForFunction(() => document.querySelector('#mkStaf').hidden && !document.querySelector('#mkStafRij').hidden);
  await page.click('#mkStap');
  ok(await page.evaluate(() => !document.querySelector('#mkStaf').hidden), 'stap terug haalt de getoverde tekening niet weg');
  antwoord = { fout: 'op' };
  await page.click('#mkStaf');
  await page.waitForFunction(() => document.querySelector('#mkStaf').dataset.teken === 'zand');
  ok(await page.evaluate(() => !document.querySelector('#mkStaf').classList.contains('klaar')), 'de staf blijft goud met het dagbudget op');
  await page.click('#mkDicht');

  /* ------------------------------------------------------------------
   * De emmer: een kier tot de dikke pen telt als dicht, een wijd gat niet;
   * stap terug na een emmer geeft het vel van ervoor; de inktrand van de
   * kaart ligt al op het vel.
   * ------------------------------------------------------------------ */
  await page.click('#btnEigenNieuw');
  await page.click('#mkSoort [data-soort="tekening"]');
  const emmer = await page.evaluate(() => {
    const T = window.__tijd || {};
    const vak = (kier) => {
      // een vierkant van 100 tot 300 met in de bovenkant een gat van kier breed
      const d = 10, l = 200 - kier / 2 - d / 2, r = 200 + kier / 2 + d / 2;
      // dicht bij elkaar, anders rondt de bocht door de middens de hoeken af
      const hoeken = [[l, 100], [100, 100], [100, 300], [300, 300], [300, 100], [r, 100]], punten = [];
      hoeken.slice(1).forEach(([x, y], i) => { const [x0, y0] = hoeken[i];
        for (let t = 0; t < 1; t += .05) punten.push([x0 + (x - x0) * t, y0 + (y - y0) * t]); });
      punten.push(hoeken[hoeken.length - 1]);
      mk.acties = [{ kleur: '#14110F', dikte: d, punten }];
      mk.acties.push({ vul: true, x: 200, y: 200, kleur: '#F2B705' });
      tekenDoek();
      const g = document.querySelector('#mkDoek').getContext('2d'), k = 2;
      return { binnen: g.getImageData(200 * k, 200 * k, 1, 1).data[3], buiten: g.getImageData(20 * k, 20 * k, 1, 1).data[3],
               hoek: g.getImageData(110 * k, 290 * k, 1, 1).data[3] };
    };
    const smal = vak(16), wijd = vak(60);
    mk.acties.pop(); tekenDoek();
    const terug = document.querySelector('#mkDoek').getContext('2d').getImageData(400, 400, 1, 1).data[3];
    const rand = document.querySelector('#mkRand').getContext('2d').getImageData(200 * 2 - 96 * 2 - 20, 400, 40, 1).data;
    let inkt = 0; for (let i = 3; i < rand.length; i += 4) if (rand[i] > 200) inkt++;
    return { smal, wijd, terug, inkt };
  });
  ok(emmer.smal.binnen === 255 && emmer.smal.hoek === 255, 'de emmer vult een vak met een smalle kier niet tot in de hoek');
  ok(emmer.smal.buiten === 0, 'de emmer loopt door een kier zo smal als de dikke pen');
  ok(emmer.wijd.buiten === 255, 'de emmer houdt een wijd gat voor dicht');
  ok(emmer.terug === 0, 'stap terug na de emmer laat de verf liggen');
  ok(emmer.inkt > 0, 'de inktrand van de kaart ligt niet op het vel');
  await page.click('#mkDicht');

  await browser.close();
  if (fails.length) { console.log('\nFOUT:\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
  console.log('  kaarten in orde');
})();
