/*
 * Test-suite voor het spelverloop.
 *
 * Speelt een volledig potje in een echte browser: drie rondes over hetzelfde
 * deck, passen, de klok die afloopt, de ploegen die wisselen, de resterende
 * tijd die meegaat naar de volgende ronde, en een herstart midden in een beurt.
 *
 * Draaien: npm run test:spel     (of npm test voor alles)
 * Duurt ruim 20 seconden: één beurt moet echt uitlopen om te zien wat er
 * gebeurt als de tijd om is.
 */
const { launch, APP_URL, hold } = require('./browser');

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

(async () => {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });

  const screen = () => page.evaluate(() => window.__tijd.screen);
  const game = fn => page.evaluate(fn);

  // Opzetten via het echte instellingenscherm, niet door de toestand te porren:
  // zo testen we meteen dat de instellingen ook echt in het spel belanden.
  async function setup({ tier, size, secs }) {
    await hold(page, '#btnGear', 1500);
    await page.waitForTimeout(150);
    if (await screen() !== 'setup') throw new Error('instellingenscherm ging niet open');
    await page.click(`#tierChips .chip[data-tier="${tier}"]`);
    await page.click(`#sizeChips .chip[data-size="${size}"]`);
    await page.$eval('#secs', (el, v) => {
      el.value = v; el.dispatchEvent(new Event('input', { bubbles: true }));
    }, String(secs));
    await page.click('#btnGo');
    await page.waitForTimeout(150);
  }

  await page.goto(APP_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(250);

  // Het tandwiel mag niet opengaan van een gewone tik.
  await page.click('#btnGear');
  await page.waitForTimeout(120);
  ok(await screen() === 'title', 'een korte tik opent de instellingen al');

  await setup({ tier: 'klein', size: 16, secs: 60 });
  ok(await screen() === 'roundintro', 'na start niet op roundintro');
  ok(await game(() => window.__tijd.G.deck.length) === 16, 'deck is geen 16 kaarten');

  const seenPerRound = [];
  for (let round = 1; round <= 3; round++) {
    ok(await game(() => window.__tijd.G.round) === round, `ronde ${round} verwacht`);
    await page.click('#btnRoundGo');
    await page.waitForTimeout(100);
    ok(await screen() === 'handoff', 'niet op handoff');

    // Ook hier: een losse tik mag de klok niet laten lopen terwijl het
    // toestel nog van hand wisselt.
    await page.click('#btnHold');
    await page.waitForTimeout(80);
    ok(await screen() === 'handoff', 'een korte tik start de beurt al');

    await hold(page, '#btnHold', 900);
    await page.waitForTimeout(150);
    ok(await screen() === 'play', `ronde ${round}: niet aan het spelen`);

    // Passen zet de kaart achteraan bij, hij mag niet verdwijnen.
    const before = await game(() => window.__tijd.G.pile.length);
    await page.click('#btnPas');
    const after = await game(() => window.__tijd.G.pile.length);
    ok(before === after, `pas verandert stapelgrootte (${before} -> ${after})`);

    const seen = new Set();
    for (let i = 0; i < 40; i++) {
      if (await screen() !== 'play') break;
      const c = await game(() => window.__tijd.G.card);
      if (c !== null) seen.add(c);
      await page.click('#btnGoed');
      await page.waitForTimeout(20);
    }
    seenPerRound.push([...seen].sort((a, b) => a - b).join(','));

    const st = await screen();
    ok(st === (round < 3 ? 'roundend' : 'winner'), `ronde ${round} eindigde op ${st}`);
    if (round < 3) {
      ok(await game(() => window.__tijd.G.pendingMs) > 0, 'resterende tijd wordt niet doorgegeven');
      await page.click('#btnRoundNext');
      await page.waitForTimeout(100);
    }
  }

  // De herhaling is het hele punt van het spel: alle drie de rondes moeten
  // exact dezelfde kaarten gebruiken.
  ok(seenPerRound[0] === seenPerRound[1] && seenPerRound[1] === seenPerRound[2],
     'de drie rondes gebruiken niet hetzelfde deck');
  ok(await page.evaluate(() => localStorage.getItem('tijdisom.game')) === null,
     'afgelopen spel blijft in localStorage staan');

  // --- de klok loopt af en geeft de beurt door ---
  await page.click('#btnAgain');
  await page.waitForTimeout(100);
  await setup({ tier: 'klein', size: 16, secs: 20 });
  await page.click('#btnRoundGo');
  await page.waitForTimeout(100);
  await hold(page, '#btnHold', 900);
  await page.waitForTimeout(150);
  const teamBefore = await game(() => window.__tijd.G.team);
  await page.waitForTimeout(21000);
  ok(await screen() === 'turnend', 'na tijd om niet op turnend');
  ok(await game(() => window.__tijd.G.team) !== teamBefore, 'ploeg wisselt niet na tijd om');

  // --- herstart midden in een beurt ---
  await page.click('#btnTurnNext');
  await page.waitForTimeout(80);
  await hold(page, '#btnHold', 900);
  await page.waitForTimeout(1500);
  await page.reload();
  await page.waitForTimeout(300);
  ok(await game(() => !!window.__tijd.G), 'lopend spel overleeft een herlaadbeurt niet');
  await page.click('#btnStart');
  await page.waitForTimeout(100);
  ok(await screen() === 'handoff', 'herstart komt niet uit op het overdrachtscherm');

  ok(!errs.length, 'consolefouten: ' + errs.join(' | '));

  await browser.close();
  if (fails.length) { console.log('\nFOUT:\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
  console.log('  spelverloop in orde');
})();
