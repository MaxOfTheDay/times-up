/*
 * Test-suite voor het spelverloop.
 *
 * Speelt een volledig potje in een echte browser: drie rondes over hetzelfde
 * deck, passen, de klok die afloopt, de ploegen die wisselen, de resterende
 * tijd die meegaat naar de volgende ronde, dat een herlaadbeurt midden in een
 * beurt het potje terugbrengt op de grens ervoor, dat de terugveeg het
 * pauzepaneel opent, en dat stoppen het potje wél weggooit.
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

  // Tikken en het aftellen uitzitten: pas daarna loopt de klok.
  async function startTurn() {
    await page.click('#btnStartTurn');
    await page.waitForFunction(
      () => document.querySelector('#countdown').hidden, null, { timeout: 10000 });
    await page.waitForTimeout(150);
  }

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
  ok(await screen() === 'handoff', 'na start niet op het overdrachtscherm');
  ok(await game(() => window.__tijd.G.deck.length) === 16, 'deck is geen 16 kaarten');
  ok(await page.getAttribute('#hoTally', 'hidden') === null,
     'de stand ontbreekt bij de eerste overdracht');
  ok(await page.textContent('#hoScoreA') === '0' && await page.textContent('#hoScoreB') === '0',
     'een vers spel begint niet op 0 - 0');
  ok(await page.getAttribute('#hoFreshA', 'hidden') !== null,
     'er staat al iets "erbij" voor er gespeeld is');

  const seenPerRound = [];
  for (let round = 1; round <= 3; round++) {
    ok(await game(() => window.__tijd.G.round) === round, `ronde ${round} verwacht`);
    ok(await screen() === 'handoff', `ronde ${round}: niet op het overdrachtscherm`);

    // Wat de opdracht is moet op het overdrachtscherm kloppen: dat is waar
    // je kijkt als je het toestel aangereikt krijgt.
    const woord = ['Omschrijven', 'Eén woord', 'Uitbeelden'][round - 1];
    const icoon = ['#r-praten', '#r-eenwoord', '#r-mimen'][round - 1];
    ok(await page.textContent('#hoRoundWord') === woord,
       `ronde ${round}: verkeerd woord op het overdrachtscherm`);

    // De startknop is een gewone tik geworden; het aftellen erna houdt een
    // losse aanraking tegen. Afbreken zet je terug op het overdrachtscherm
    // zonder dat er een beurt begonnen is.
    await page.click('#btnStartTurn');
    await page.waitForTimeout(120);
    ok(await screen() === 'play', `ronde ${round}: aftellen begint niet`);
    ok(await page.getAttribute('#countdown', 'hidden') === null,
       `ronde ${round}: er wordt niet afgeteld`);
    ok(await page.textContent('#glyph') === '',
       `ronde ${round}: de kaart is al zichtbaar tijdens het aftellen`);
    await page.click('#countdown');
    await page.waitForTimeout(120);
    ok(await screen() === 'handoff', `ronde ${round}: aftellen afbreken werkt niet`);

    await startTurn();
    ok(await screen() === 'play', `ronde ${round}: niet aan het spelen`);
    ok(await page.getAttribute('#countdown', 'hidden') !== null,
       `ronde ${round}: het aftellen blijft staan`);
    ok(await page.textContent('#glyph') !== '',
       `ronde ${round}: geen kaart na het aftellen`);

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
    ok(st === (round < 3 ? 'handoff' : 'winner'), `ronde ${round} eindigde op ${st}`);
    if (round < 3) {
      ok(await game(() => window.__tijd.G.pendingMs) > 0, 'resterende tijd wordt niet doorgegeven');
      ok(await page.getAttribute('#hoFreshA', 'hidden') === null ||
         await page.getAttribute('#hoFreshB', 'hidden') === null,
         `ronde ${round}: wat er deze ronde bij kwam wordt niet getoond`);
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
  ok(await screen() === 'handoff', 'na start niet op het overdrachtscherm');
  await startTurn();
  const teamBefore = await game(() => window.__tijd.G.team);
  await page.waitForTimeout(21000);
  ok(await screen() === 'handoff', 'na tijd om niet op het overdrachtscherm');
  ok(await game(() => window.__tijd.G.team) !== teamBefore, 'ploeg wisselt niet na tijd om');
  ok(await game(() => {
       const t = window.__tijd.G.team;
       const up = document.querySelector('#hoSide' + (t === 0 ? 'A' : 'B'));
       const other = document.querySelector('#hoSide' + (t === 0 ? 'B' : 'A'));
       return up.classList.contains('up') && !other.classList.contains('up');
     }), 'de ploeg die aan zet is wordt niet opgetild in de stand');

  // --- herladen midden in een beurt komt terug op de grens ---
  // Dit stond hier omgekeerd: een potje overleefde geen herlaadbeurt, en dat
  // was zo bedoeld. De reden daarvoor ging over de knoppen -- geen "verder
  // spelen" naast "nieuw spel" om tussen te kiezen -- en die reden staat nog
  // steeds. Er is ook geen keuze bijgekomen: de app komt gewoon terug waar ze
  // was. Wat verdween is dat een terugveeg of een telefoontje de hele avond
  // stand wiste zonder dat er iets gezegd werd.
  //
  // Bewaard wordt er op het overdrachtscherm, niet tijdens een beurt. Een
  // onderbroken beurt wordt dus overgespeeld: de kaarten komen terug, en de
  // punten die er half in stonden niet.
  const stand = () => game(() => ({
    scores: JSON.parse(JSON.stringify(window.__tijd.G.scores)),
    team: window.__tijd.G.team,
    round: window.__tijd.G.round
  }));
  const voor = await stand();
  await startTurn();
  await page.click('#btnGoed');
  await page.waitForTimeout(400);
  ok(await game(() => window.__tijd.G.gained) === 1,
     'de geraden kaart telde niet mee in de onderbroken beurt');
  await page.reload();
  await page.waitForTimeout(400);
  ok(await screen() === 'handoff',
     'na een herlaadbeurt komt het potje niet terug op het overdrachtscherm');
  ok(await game(() => !!window.__tijd.G), 'het lopende potje overleeft een herlaadbeurt niet');
  ok(JSON.stringify(await stand()) === JSON.stringify(voor),
     'de stand na een herlaadbeurt is niet die van de grens ervoor');

  // --- de terugveeg opent het pauzepaneel in plaats van de app te verlaten ---
  await page.goBack();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => !document.querySelector('#pauze').hidden),
     'de terugveeg opent het pauzepaneel niet');

  // --- een tweede terugveeg sluit het weer, ook al opende de eerste het
  //     paneel zelf (dus zonder dat de knop er ooit aan te pas kwam). Dat
  //     onderscheid bleek op een echt toestel uit te maken: ging het paneel
  //     via de knop open, dan werkte de eerstvolgende terugveeg wel; ging
  //     het via een terugveeg open, dan sloot de veeg erna soms de hele app
  //     in plaats van het paneel. Zie de voorraad-invoeren in
  //     guardBack()/releaseBack(). Dit toetst alleen de boekhouding hier in
  //     JS -- het voorspellende terug-gebaar van Android zelf speelt zich
  //     buiten bereik van deze test af, dat blijft iets voor een echt
  //     toestel. ---
  await page.goBack();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.querySelector('#pauze').hidden),
     'een tweede terugveeg sluit het pauzepaneel niet');
  ok(await screen() === 'handoff', 'een tweede terugveeg verlaat het overdrachtscherm');
  await page.waitForTimeout(200);

  // --- stoppen gooit het potje wél weg ---
  // Bewaren mag nooit betekenen dat iets wat je met opzet weggooit terugkomt.
  await startTurn();
  await page.waitForTimeout(300);
  await page.click('#btnPauze');
  await page.waitForTimeout(250);
  await hold(page, '#btnStop', 1400);
  await page.waitForTimeout(250);
  ok(await screen() === 'title', 'stoppen komt niet op de titel uit');
  await page.reload();
  await page.waitForTimeout(400);
  ok(await screen() === 'title', 'een gestopt potje komt na een herlaadbeurt terug');
  ok(!await game(() => !!window.__tijd.G), 'een gestopt potje leeft na een herlaadbeurt nog');
  await page.click('#btnStart');
  await page.waitForTimeout(150);
  ok(await screen() === 'handoff', 'de titelknop begint geen vers spel');
  ok(await page.textContent('#hoScoreA') === '0' && await page.textContent('#hoScoreB') === '0',
     'een vers spel begint niet op 0 - 0');

  ok(!errs.length, 'consolefouten: ' + errs.join(' | '));

  await browser.close();
  if (fails.length) { console.log('\nFOUT:\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
  console.log('  spelverloop in orde');
})();
