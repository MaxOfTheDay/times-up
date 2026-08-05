/*
 * Test-suite voor het spelverloop.
 *
 * Speelt een volledig potje in een echte browser: drie rondes over hetzelfde
 * deck, passen, de klok die afloopt, de ploegen die wisselen, de resterende
 * tijd die meegaat naar de volgende ronde, en dat een herlaadbeurt midden in
 * een beurt niets laat terugkomen -- de titelknop begint altijd vers.
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
    await page.click('#btnGear');
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

  // Het tandwiel is een gewone tik: instellingen openen is niets
  // onomkeerbaars, en het tandwiel bestaat toch al alleen op dit scherm.
  await page.click('#btnGear');
  await page.waitForTimeout(120);
  ok(await screen() === 'setup', 'een tik op het tandwiel opent de instellingen niet');
  await page.click('#btnBack');
  await page.waitForTimeout(120);
  ok(await screen() === 'title', 'terug vanuit de instellingen komt niet op de titel uit');

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

    // Wat de opdracht is moet op het overdrachtscherm kloppen: dat is waar
    // je kijkt als je het toestel aangereikt krijgt.
    const woord = ['Uitleggen', 'Eén woord', 'Uitbeelden'][round - 1];
    const icoon = ['#r-praten', '#r-eenwoord', '#r-mimen'][round - 1];
    ok(await page.textContent('#hoRoundWord') === woord,
       `ronde ${round}: verkeerd woord op het overdrachtscherm`);
    ok(await page.getAttribute('#hoRound use', 'href') === icoon,
       `ronde ${round}: verkeerd pictogram op het overdrachtscherm`);

    await hold(page, '#btnHold', 900);
    await page.waitForTimeout(150);
    ok(await screen() === 'play', `ronde ${round}: niet aan het spelen`);

    // En tijdens het spelen ook, want daar wordt het vergeten.
    ok(await page.textContent('#plRoundWord') === woord,
       `ronde ${round}: verkeerd woord in de spelbalk`);
    ok(await page.getAttribute('#plRound use', 'href') === icoon,
       `ronde ${round}: verkeerd pictogram in de spelbalk`);

    // Elke getoonde kaart wordt onthouden, ook die van de proefjes hieronder:
    // aan het eind moet elke ronde precies hetzelfde deck getoond hebben.
    const seen = new Set();
    const noteCard = async () => {
      const c = await game(() => window.__tijd.G.card);
      if (c !== null) seen.add(c);
    };

    // Passen zet de kaart achteraan bij, hij mag niet verdwijnen.
    await noteCard();
    const before = await game(() => window.__tijd.G.pile.length);
    await page.click('#btnPas');
    await page.waitForTimeout(320);
    const after = await game(() => window.__tijd.G.pile.length);
    ok(before === after, `pas verandert stapelgrootte (${before} -> ${after})`);

    // Twee tikken vlak na elkaar zijn één vinger, geen twee kaarten.
    await noteCard();
    const scoreBefore = await game(() => window.__tijd.G.scores[window.__tijd.G.team][window.__tijd.G.round - 1]);
    await page.click('#btnGoed');
    await page.click('#btnGoed');
    await page.waitForTimeout(320);
    const scoreAfter = await game(() => window.__tijd.G.scores[window.__tijd.G.team][window.__tijd.G.round - 1]);
    ok(scoreAfter - scoreBefore === 1,
       `dubbele tik telde ${scoreAfter - scoreBefore} punten in plaats van 1`);

    // Ruim boven de dubbeltik-drempel van 280 ms: sneller dan dat is geen mens.
    for (let i = 0; i < 40; i++) {
      if (await screen() !== 'play') break;
      await noteCard();
      await page.click('#btnGoed');
      await page.waitForTimeout(320);
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

  // --- de klok loopt af en geeft de beurt door ---
  // "Opnieuw" begint nu ook echt opnieuw in plaats van naar de titel te
  // gaan; terug naar de titel is een eigen knop.
  await page.click('#btnHome');
  await page.waitForTimeout(100);
  ok(await screen() === 'title', 'de huisknop komt niet uit op de titel');
  await setup({ tier: 'klein', size: 16, secs: 20 });
  await page.click('#btnRoundGo');
  await page.waitForTimeout(100);
  await hold(page, '#btnHold', 900);
  await page.waitForTimeout(150);
  const teamBefore = await game(() => window.__tijd.G.team);
  await page.waitForTimeout(21000);
  ok(await screen() === 'turnend', 'na tijd om niet op turnend');
  ok(await game(() => window.__tijd.G.team) !== teamBefore, 'ploeg wisselt niet na tijd om');

  // --- herladen midden in een beurt laat niets terugkomen ---
  // Er bestaat geen "verder spelen" meer: de titelknop begint altijd vers,
  // dus een potje overleeft geen herlaadbeurt.
  await page.click('#btnTurnNext');
  await page.waitForTimeout(80);
  await hold(page, '#btnHold', 900);
  await page.waitForTimeout(1500);
  await page.reload();
  await page.waitForTimeout(300);
  ok(await screen() === 'title', 'na een herlaadbeurt komt het spel niet op de titel uit');
  ok(!await game(() => !!window.__tijd.G), 'lopend spel overleeft een herlaadbeurt');
  await page.click('#btnStart');
  await page.waitForTimeout(100);
  ok(await screen() === 'roundintro', 'de titelknop na een herlaadbeurt begint geen vers spel');

  ok(!errs.length, 'consolefouten: ' + errs.join(' | '));

  await browser.close();
  if (fails.length) { console.log('\nFOUT:\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
  console.log('  spelverloop in orde');
})();
