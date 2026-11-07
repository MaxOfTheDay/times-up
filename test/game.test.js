/*
 * Test-suite voor het spelverloop.
 *
 * Speelt een volledig potje in een echte browser: drie rondes over hetzelfde
 * deck, passen, de klok die afloopt, de ploegen die wisselen, de resterende
 * tijd die meegaat naar de volgende ronde, dat een herlaadbeurt midden in een
 * beurt het potje terugbrengt op de grens ervoor, dat de terugveeg op de
 * overdracht niets weggooit, dat stoppen het potje wél weggooit (ook via het
 * huisje op de overdracht), dat de laatste
 * kaart geraden op de bel precies één einde oplevert, en dat wegklikken het
 * pauzepaneel opent (of het aftellen afbreekt).
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

  // Tikken en het aftellen uitzitten: pas daarna loopt de klok. De tik draait
  // eerst de opdrachtkaart om (OMDRAAI); pas daarna begint het aftellen.
  async function startTurn() {
    await page.click('#btnStartTurn');
    await page.waitForFunction(
      () => !document.querySelector('#countdown').hidden, null, { timeout: 5000 });
    await page.waitForFunction(
      () => document.querySelector('#countdown').hidden, null, { timeout: 10000 });
    await page.waitForTimeout(150);
  }

  // Opzetten via het echte instellingenscherm, niet door de toestand te porren:
  // zo testen we meteen dat de instellingen ook echt in het spel belanden.
  // Het scherm heeft geen eigen startknop, dus verlaten via het huisje en
  // starten op de titel -- meteen de controle of de keuzes meegaan zonder
  // dat er iets te bevestigen viel.
  async function setup({ tier, size, secs }) {
    // Het tandwiel ligt op de hoek van de uitgang waarmee je hier kwam: een
    // tik daar binnen 300 ms na de wissel is een spook (spookTik).
    await page.waitForTimeout(350);
    await page.click('#btnGear');
    await page.waitForTimeout(350);           // een tweede tik op die hoek binnen 300 ms is een spook (spookTik)
    if (await screen() !== 'setup') throw new Error('instellingenscherm ging niet open');
    // De moeilijkheid staat bovenaan de gewone kaarten, op #s-kaarten.
    await page.click('#rijGewoon');
    await page.waitForTimeout(150);
    if (await screen() !== 'kaarten') throw new Error('de rij Gewone opende de kaarten niet');
    await page.click(`#tierChips .chip[data-tier="${tier}"]`);
    await page.click('#btnKaartenTerug');
    await page.waitForTimeout(350);
    await page.click(`#sizeChips .chip[data-size="${size}"]`);
    await page.click(`#secsChips .chip[data-secs="${secs}"]`);
    await page.click('#btnBack');
    await page.waitForTimeout(350);
    if (await screen() !== 'title') throw new Error('het huisje kwam niet op de titel uit');
    await page.click('#btnStart');
    await page.waitForTimeout(300);           // het merk draait eerst om
  }

  await page.goto(APP_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(250);

  // Het tandwiel is een gewone tik: instellingen openen is niets
  // onomkeerbaars, en het tandwiel bestaat toch al alleen op dit scherm.
  await page.click('#btnGear');
  await page.waitForTimeout(350);
  ok(await screen() === 'setup', 'een tik op het tandwiel opent de instellingen niet');
  await page.click('#btnBack');
  await page.waitForTimeout(350);
  ok(await screen() === 'title', 'terug vanuit de instellingen komt niet op de titel uit');

  await setup({ tier: 'klein', size: 16, secs: 60 });
  ok(await screen() === 'handoff', 'na start niet op het overdrachtscherm');
  ok(await game(() => window.__tijd.G.deck.length) === 16, 'deck is geen 16 kaarten');
  ok(await page.getAttribute('#hoTally', 'hidden') === null,
     'de stand ontbreekt bij de eerste overdracht');
  ok(await page.textContent('#hoScoreA') === '0' && await page.textContent('#hoScoreB') === '0',
     'een vers spel begint niet op 0 - 0');
  // Geen "+N" meer op dit scherm: wat de vorige beurt opleverde is tijdens
  // het spelen al geteld, geluid en al. Wat er wél staat zijn de twee
  // tellers -- hoeveel kaarten er liggen en hoe lang je krijgt.
  ok(await page.$('#hoTally .fresh') === null,
     'het "+N" staat weer op het overdrachtscherm');
  ok(await page.textContent('#hoCards span') === '16',
     'de kaartenteller klopt niet bij de eerste overdracht');
  ok(await page.isDisabled('#hoCards'),
     'in ronde 1 kun je de stapel bekijken, en dat verklapt de kaarten');
  ok(await page.textContent('#hoSecs span') === '60',
     'de secondenteller klopt niet bij de eerste overdracht');
  // De kroon zegt wie voorstaat, en dat bepaalt hier niets. Ze bestaat nog
  // op het winnaarsscherm; zie tallyNode().
  ok(await page.$('#hoTally .crown') === null,
     'de kroon staat weer op het overdrachtscherm');

  const seenPerRound = [];
  for (let round = 1; round <= 3; round++) {
    ok(await game(() => window.__tijd.G.round) === round, `ronde ${round} verwacht`);
    ok(await screen() === 'handoff', `ronde ${round}: niet op het overdrachtscherm`);

    // Wat de opdracht is moet op het overdrachtscherm kloppen: dat is waar
    // je kijkt als je het toestel aangereikt krijgt.
    const woord = ['Omschrijven', 'Eén woord', 'Uitbeelden'][round - 1];
    const icoon = ['#r-praten', '#r-eenwoord', '#r-mimen'][round - 1];
    // Direct kind, niet zomaar de eerste <b>: de stand staat ín de kaart en
    // heeft eigen cijfers. Precies de greep die paintRound() ook maakte.
    ok(await page.textContent('#hoRoundCard > b') === woord,
       `ronde ${round}: verkeerd woord op het overdrachtscherm`);
    // De drie rondes staan als één rij; die van nu is de schijf met de
    // ronde-tekening (een eigen <svg>, geen <use>). Bij een rondewissel
    // schuift de schijf pas na de landing van de kaart door (RIJ_WACHT),
    // dus wachten tot ze op haar plek staat.
    const schijfOk = await page.waitForFunction(r => {
      const v = document.querySelectorAll('#hoRondes > .vak');
      return v.length === 3 && [...v].every((e, i) => e.classList.contains('nu') === (i === r - 1)) &&
        v[r - 1].querySelector('svg') !== null && v[r - 1].querySelector('use') === null;
    }, round, { timeout: 2000 }).then(() => true, () => false);
    ok(schijfOk, `ronde ${round}: de schijf staat niet op de ronde van nu`);
    // Geen regelzin op de kaart: de tekening zegt de regel. Wie luistert
    // krijgt hem in de aria-label.
    ok(await page.$('#hoRoundCard > p') === null,
       `ronde ${round}: er staat een regelzin op de kaart`);
    ok((await page.getAttribute('#hoRoundCard', 'aria-label')).includes('van 3'),
       `ronde ${round}: de aria-label noemt de ronde niet`);

    // Een gewone tik; het aftellen erna houdt een losse aanraking tegen.
    // Afbreken zet je terug op het overdrachtscherm, zonder begonnen beurt.
    await page.click('#btnStartTurn');
    await page.waitForTimeout(300);           // de opdrachtkaart draait eerst om
    ok(await screen() === 'play', `ronde ${round}: aftellen begint niet`);
    ok(await page.getAttribute('#countdown', 'hidden') === null,
       `ronde ${round}: er wordt niet afgeteld`);
    ok(await page.textContent('#glyph') === '',
       `ronde ${round}: de kaart is al zichtbaar tijdens het aftellen`);
    // Een tik op het vlak zelf breekt niet af: dat is het kind dat
    // enthousiast meetikt. Alleen de tegel in de hoek gaat terug.
    await page.mouse.click(195, 600);
    await page.waitForTimeout(120);
    ok(await screen() === 'play' && await page.getAttribute('#countdown', 'hidden') === null,
       `ronde ${round}: een tik op het aftelvlak breekt het aftellen af`);
    await page.click('#cdBack');
    await page.waitForTimeout(300);           // de speelkaart draait eerst om
    ok(await screen() === 'handoff', `ronde ${round}: aftellen afbreken werkt niet`);

    await startTurn();
    ok(await screen() === 'play', `ronde ${round}: niet aan het spelen`);
    ok(await page.getAttribute('#countdown', 'hidden') !== null,
       `ronde ${round}: het aftellen blijft staan`);
    ok(await page.textContent('#glyph') !== '',
       `ronde ${round}: geen kaart na het aftellen`);

    // En tijdens het spelen ook, al staat het woord er zichtbaar niet meer:
    // het pictogram draagt de ronde alleen, en wie leest krijgt de naam nog
    // via de aria-label van de tegel zelf.
    ok(await page.$('#plRoundChip b') === null,
       `ronde ${round}: er staat toch een woord in de spelbalk`);
    ok((await page.getAttribute('#plRoundChip', 'aria-label') || '').includes(woord),
       `ronde ${round}: de spelbalk noemt de ronde niet in zijn aria-label`);
    ok(await page.getAttribute('#plRoundChip .ico use', 'href') === icoon,
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
    const geraden = await game(() => window.__tijd.G.card);
    const scoreBefore = await game(() => window.__tijd.G.scores[window.__tijd.G.team][window.__tijd.G.round - 1]);
    // In één beweging: twee losse page.click() wachten tussendoor tot de
    // knop stilligt, en de knop zakt bij elke druk in (.tik).
    await page.click('#btnGoed', { clickCount: 2 });
    await page.waitForTimeout(320);
    const scoreAfter = await game(() => window.__tijd.G.scores[window.__tijd.G.team][window.__tijd.G.round - 1]);
    ok(scoreAfter - scoreBefore === 1,
       `dubbele tik telde ${scoreAfter - scoreBefore} punten in plaats van 1`);

    // Een tik op het groene +N neemt die kaart terug, één keer.
    if (round === 1) {
      await page.click('#turnScore');
      await page.waitForTimeout(320);
      ok(await game(() => window.__tijd.G.scores[window.__tijd.G.team][0]) === scoreBefore,
         'terugnemen haalde het punt er niet af');
      ok(await game(() => window.__tijd.G.card) === geraden,
         'terugnemen legde de geraden kaart niet terug in beeld');
      ok(await page.isHidden('#turnScore'), 'het +N blijft staan op nul');
      await page.click('#btnGoed');
      await page.waitForTimeout(320);
    }

    // Ruim boven de dubbeltik-drempel van 280 ms: sneller dan dat is geen mens.
    for (let i = 0; i < 40; i++) {
      if (await screen() !== 'play') break;
      // Stapel leeg: het scherm blijft nog een tel staan met het stempel
      // (zie endRound), en de knoppen doen dan niets meer.
      if (await game(() => window.__tijd.G.card === null)) {
        await page.waitForTimeout(1300);
        continue;
      }
      await noteCard();
      await page.click('#btnGoed');
      await page.waitForTimeout(320);
    }
    seenPerRound.push([...seen].sort((a, b) => a - b).join(','));

    const st = await screen();
    ok(st === (round < 3 ? 'handoff' : 'winner'), `ronde ${round} eindigde op ${st}`);
    if (round < 3) {
      // Dezelfde ploeg speelt door met de tijd die ze nog had, en de
      // overdracht toont die seconden.
      const rest = await game(() => window.__tijd.G.pendingMs);
      ok(rest >= 5000 && rest < await game(() => window.__tijd.G.secs * 1000),
         `ronde ${round + 1} krijgt de resttijd niet mee (${rest} ms)`);
      ok(await page.textContent('#hoSecs span') === String(Math.ceil(rest / 1000)),
         'de secondenteller toont de resttijd niet');
      // Het "+N" is weg; wat een rondewissel nu meldt zijn de twee tellers.
      // De stapel is opnieuw geschud, dus die staat weer op de hele bak.
      ok(await page.textContent('#hoCards span') === '16',
         `ronde ${round}: de kaartenteller staat niet terug op de hele bak`);
      // Vanaf ronde 2 kun je terugkijken: alle kaarten als plaatjes.
      await page.click('#hoCards');
      await page.waitForTimeout(300);
      ok(await page.isVisible('#kijk'), `ronde ${round + 1}: de kaartenteller opent het overzicht niet`);
      ok(await page.$$eval('#kijkGrid > div', d => d.length) === 16,
         `ronde ${round + 1}: het overzicht toont niet alle kaarten`);
      await page.mouse.click(10, 10);
      await page.waitForTimeout(300);
      ok(await page.isHidden('#kijk'), 'het overzicht gaat niet dicht met een tik');
      const mee = Number(await page.textContent('#hoSecs span'));
      ok(mee > 0 && mee <= 60,
         `ronde ${round}: de secondenteller staat op ${mee}`);
    }
  }

  // De herhaling is het hele punt van het spel: alle drie de rondes moeten
  // exact dezelfde kaarten gebruiken.
  ok(seenPerRound[0] === seenPerRound[1] && seenPerRound[1] === seenPerRound[2],
     'de drie rondes gebruiken niet hetzelfde deck');

  // --- de klok loopt af en geeft de beurt door ---
  // "Opnieuw" begint een nieuw potje; terug naar de titel is een eigen knop.
  await page.click('#btnHome');
  await page.waitForTimeout(100);
  ok(await screen() === 'title', 'de huisknop komt niet uit op de titel');
  await setup({ tier: 'klein', size: 16, secs: 20 });
  ok(await screen() === 'handoff', 'na start niet op het overdrachtscherm');
  await startTurn();
  const teamBefore = await game(() => window.__tijd.G.team);
  // Een vinger die na de bel doortikt, start de andere ploeg niet: de
  // startknop komt ingedrukt aan en veert pas op als het glas even stil
  // was (rustKnop).
  await page.waitForFunction(() => window.__tijd.screen === 'handoff', null, { timeout: 25000, polling: 20 });
  ok(await page.$('#btnStartTurn.neer') !== null, 'de startknop komt na de bel niet ingedrukt aan');
  const sb = await page.locator('#btnStartTurn').boundingBox();
  for (let i = 0; i < 3; i++) {
    await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2);
    await page.waitForTimeout(250);
  }
  ok(await page.getAttribute('#countdown', 'hidden') !== null,
     'een doortikkende vinger na de bel start de beurt van de andere ploeg');
  ok(await page.$('#btnStartTurn.neer') !== null, 'de startknop veert op terwijl er nog getikt wordt');
  await page.waitForTimeout(700);
  ok(await page.$('#btnStartTurn.neer') === null, 'de startknop veert niet op als het glas stil is');
  ok(await screen() === 'handoff', 'na tijd om niet op het overdrachtscherm');
  ok(await game(() => window.__tijd.G.team) !== teamBefore, 'ploeg wisselt niet na tijd om');
  ok(await game(() => {
       const t = window.__tijd.G.team;
       const up = document.querySelector('#hoSide' + (t === 0 ? 'A' : 'B'));
       const other = document.querySelector('#hoSide' + (t === 0 ? 'B' : 'A'));
       return up.classList.contains('up') && !other.classList.contains('up');
     }), 'de ploeg die aan zet is wordt niet opgetild in de stand');
  // Een beurtwissel is dezelfde kaart als een rondewissel -- één maat. De compacte variant bestond omdat de kaart het antwoord op
  // "wie is er nu" overstemde; sinds de stand ín de kaart staat is er niets
  // meer te overstemmen. Wat de twee standen onderscheidt is beweging, niet
  // meetkunde, en dat is hier niet te meten.
  ok(await page.$('#hoRoundCard.big') !== null,
     'de opdrachtkaart heeft niet haar enige maat bij een beurtwissel');

  // --- herladen midden in een beurt komt terug, met de punten ---
  // Er is nog steeds geen "verder spelen"-knop: de app komt gewoon terug
  // waar ze was. Een onderbroken beurt wordt bewaard zoals ze verder moet
  // (Spel.onderbreek): de punten blijven, dezelfde ploeg speelt verder op
  // de overdracht, met de resttijd.
  const stand = () => game(() => ({
    scores: JSON.parse(JSON.stringify(window.__tijd.G.scores)),
    team: window.__tijd.G.team,
    round: window.__tijd.G.round
  }));
  const voor = await stand();
  const invoerVoor = await page.evaluate(() => history.length);
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
  const na = await stand();
  ok(na.team === voor.team && na.round === voor.round,
     'na een herlaadbeurt speelt niet dezelfde ploeg verder');
  ok(na.scores[voor.team][voor.round - 1] === voor.scores[voor.team][voor.round - 1] + 1,
     'het punt van de onderbroken beurt is na een herlaadbeurt weg');
  const rest = await game(() => window.__tijd.G.pendingMs);
  ok(rest > 0 && rest < 60000, 'de onderbroken beurt krijgt niet de resttijd mee: ' + rest);
  // De geschiedenis overleeft een herlaadbeurt; er mag geen tweede invoer
  // van ons bij komen, anders doet de eerste terugveeg op de titel niets.
  ok(await page.evaluate(() => history.length) === invoerVoor,
     'herladen legt een extra invoer in de geschiedenis');

  // --- de terugveeg op de overdracht verlaat de app niet en gooit niets weg ---
  // Er is hier geen pauze: het huisje in de hoek doet de druk voor.
  await page.goBack();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.querySelector('#pauze').hidden),
     'de terugveeg op de overdracht opent een pauzepaneel');
  ok(await screen() === 'handoff' && await game(() => !!window.__tijd.G),
     'de terugveeg op de overdracht verlaat het potje');
  // Huis gluurt uit het huisje (thuisGluur()); bij beperkte beweging de vloed.
  ok(await page.evaluate(() => document.querySelector('#s-title').classList.contains('gluurt')
       || /scaleY\(0\.[1-9]/.test(document.querySelector('#btnStopHo i').style.transform)),
     'de terugveeg op de overdracht doet de druk op het huisje niet voor');
  await page.waitForTimeout(1300);

  // --- een tik op het huisje doet de druk voor, maar stopt niet ---
  await page.click('#btnStopHo');
  await page.waitForTimeout(1300);
  ok(await screen() === 'handoff' && await page.evaluate(() => document.querySelector('#pauze').hidden),
     'een tik op het huisje van de overdracht stopt het potje of opent een paneel');

  // --- stoppen gooit het potje wél weg ---
  // Bewaren mag nooit betekenen dat iets wat je met opzet weggooit terugkomt.
  await startTurn();
  await page.waitForTimeout(300);
  await page.click('#btnPauze');
  await page.waitForTimeout(450);

  // De pauze draait de kaart om: het paneel ligt precies op haar plek, en
  // dekt dus ook het woord af.
  const dekt = await page.evaluate(() => {
    const k = document.querySelector('#card'), p = document.querySelector('#pauze .panel');
    const kr = k.getBoundingClientRect(), pr = p.getBoundingClientRect();
    const kx = kr.left + kr.width / 2, ky = kr.top + kr.height / 2;
    return Math.abs(pr.width - k.offsetWidth) < 1.5 && Math.abs(pr.height - k.offsetHeight) < 1.5 &&
           Math.abs(pr.left + pr.width / 2 - kx) < 1.5 && Math.abs(pr.top + pr.height / 2 - ky) < 1.5;
  });
  ok(dekt, 'het pauzepaneel ligt niet als achterkant op de kaart');

  // --- de achtergrond mag dicht terwijl het paneel openstaat ---
  // Eerst het toestel zelf: inert maakt de speelknop niet meer focusbaar,
  // dus een toetsenbord kan er niet meer tot doordringen.
  await page.evaluate(() => document.querySelector('#btnGoed').focus());
  ok(await page.evaluate(() => document.activeElement.id !== 'btnGoed'),
     'de geraden-knop is nog focusbaar terwijl het pauzepaneel openstaat');

  // En dan de app zelf: mócht een toestel zonder inert een klik toch laten
  // doorkomen, dan moet acts() dat nog steeds weigeren. dispatchEvent
  // roept de knop-listener rechtstreeks aan -- zonder de hit-test die
  // inert al regelt -- en toetst dus precies deze tweede laag.
  const gainedWhilePaused = await game(() => window.__tijd.G.gained);
  await page.evaluate(() =>
    document.querySelector('#btnGoed').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await page.waitForTimeout(150);
  ok(await game(() => window.__tijd.G.gained) === gainedWhilePaused,
     'er kan nog gescoord worden terwijl het pauzepaneel openstaat');

  // Dezelfde tweede laag voor de pauzeknop zelf: een herhaalde aanroep mag
  // de bevroren tijd niet opnieuw bemonsteren, anders eet elke seconde die
  // er zo bijkomt een seconde van de beurt (zie openPause()).
  // De achterkant van de kaart neemt de bevroren band over bij het openen.
  const band = sel => page.evaluate(s => document.querySelector(s).style.strokeDashoffset, sel);
  const dial = await band('#pauseBand');
  await page.waitForTimeout(1200);
  await page.evaluate(() =>
    document.querySelector('#btnPauze').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await page.waitForTimeout(150);
  ok(await band('#pauseBand') === dial,
     'een herhaalde pauze-tik eet tijd van de beurt');

  await hold(page, '#btnStop', 1400);
  await page.waitForTimeout(250);
  ok(await screen() === 'title', 'stoppen komt niet op de titel uit');
  ok(await page.evaluate(() => history.state === null),
     'op de titel ligt nog een invoer van ons: de terugveeg verlaat de app niet');
  await page.reload();
  await page.waitForTimeout(400);
  ok(await screen() === 'title', 'een gestopt potje komt na een herlaadbeurt terug');
  ok(!await game(() => !!window.__tijd.G), 'een gestopt potje leeft na een herlaadbeurt nog');
  await page.click('#btnStart');
  await page.waitForTimeout(300);
  ok(await screen() === 'handoff', 'de titelknop begint geen vers spel');
  ok(await page.textContent('#hoScoreA') === '0' && await page.textContent('#hoScoreB') === '0',
     'een vers spel begint niet op 0 - 0');

  // --- de laatste kaart geraden terwijl de klok afloopt ---
  // Het punt van de laatste kaart vliegt eerst naar de teller en pas dan
  // eindigt de ronde. Liep de klok in die vlucht af, dan ging ook timeUp()
  // af: de rondewissel werd 700 ms later een beurtwissel voor de andere
  // ploeg, en in ronde 3 viel turnEnd() over het opgeruimde potje. Dat
  // venster is 220 ms en dus niet te raken met echte tikken; hier wordt de
  // vlucht opgerekt tot ruim voorbij de klok, zodat het elke keer raak is.
  // Zelfde reden voor de tik via click(): onder de vijf tellen klopt de
  // kaart, en dan wacht playwright op een knop die "stabiel" moet worden.
  async function lastCardAtBuzzer(round) {
    await page.evaluate(r => {
      const G = window.__tijd.G;
      G.round = r;
      G.pile = G.pile.slice(0, 1);    // de kaart die zo getoond wordt is de laatste
      G.pendingMs = 1500;             // een beurt van anderhalve tel
      document.documentElement.style.setProperty('--t-fly', '2.5s');
    }, round);
    const team = await game(() => window.__tijd.G.team);
    await startTurn();
    await page.evaluate(() => document.querySelector('#btnGoed').click());
    await page.waitForTimeout(4800);  // vlucht voorbij, en de adem erna (BEURT_ADEM) ook
    await game(() => document.documentElement.style.removeProperty('--t-fly'));
    return team;
  }

  const team = await lastCardAtBuzzer(1);
  ok(await screen() === 'handoff', 'laatste kaart op de bel: niet op het overdrachtscherm');
  ok(await game(() => window.__tijd.G.round) === 2,
     'laatste kaart op de bel: de ronde is niet (precies één keer) doorgeschoven');
  ok(await game(() => window.__tijd.G.team) === team,
     'laatste kaart op de bel: dezelfde ploeg speelt de volgende ronde niet door');
  ok(await page.$('#s-handoff.mode-round') !== null,
     'laatste kaart op de bel: de rondewissel werd een beurtwissel');
  // Op de bel gaat er nog MIN_REST mee: na het aftellen is minder geen beurt.
  ok(await page.textContent('#hoSecs span') === '5',
     'de secondenteller toont na een rondewissel op de bel niet MIN_REST');

  await lastCardAtBuzzer(3);
  ok(await screen() === 'winner', 'laatste kaart op de bel in ronde 3: geen winnaarsscherm');

  // --- de eindstand overleeft een herlaadbeurt ---
  // Tot je het scherm verlaat: dan pas is ze weg.
  const eind = () => page.$$eval('#wnPiles .tally .num', n => n.map(x => x.textContent).join('-'));
  await page.waitForTimeout(1800);           // optellen voorbij
  const eindVoor = await eind();
  await page.reload();
  await page.waitForTimeout(2200);
  ok(await screen() === 'winner', 'na een herlaadbeurt op de eindstand is die weg');
  ok(await eind() === eindVoor, `de eindstand na een herlaadbeurt is ${await eind()}, niet ${eindVoor}`);

  // --- weggeklikt of vergrendeld: het paneel gaat open ---
  // De klok bevroor en liep bij terugkomst meteen weer, terwijl het toestel
  // misschien nog in de hand van wie het net ontgrendelde lag. Nu wacht hij
  // op een tik. Een headless browser raakt nooit echt verborgen, dus de
  // toestand wordt nagebootst; delete haalt de getter van het prototype
  // terug.
  const zicht = s => page.evaluate(s => {
    if (s === 'visible') { delete document.visibilityState; delete document.hidden; }
    else {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => s });
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    }
    document.dispatchEvent(new Event('visibilitychange'));
  }, s);
  const paneelOpen = () => page.evaluate(() => !document.querySelector('#pauze').hidden);

  await page.click('#btnAgain');
  await page.waitForTimeout(400);
  await startTurn();
  await page.waitForTimeout(300);
  await zicht('hidden');
  ok(await paneelOpen(), 'wegklikken tijdens een beurt opent het pauzepaneel niet');
  const bevroren = await page.evaluate(() => document.querySelector('#timerBand').style.strokeDashoffset);
  await page.waitForTimeout(400);
  await zicht('visible');
  await page.waitForTimeout(1200);
  ok(await paneelOpen(), 'bij terugkomst is het pauzepaneel alweer dicht');
  ok(await page.evaluate(() => document.querySelector('#timerBand').style.strokeDashoffset) === bevroren,
     'de klok loopt weer zonder dat iemand op verder tikte');
  // Voorwaardelijk, zodat een paneel dat nooit openging hierboven een
  // melding geeft en niet een time-out op een knop die er niet is.
  if (await paneelOpen()) await page.click('#btnResume');
  await page.waitForTimeout(300);
  ok(!await paneelOpen() && await game(() => window.__tijd.G.card) !== null,
     'verder na wegklikken hervat de beurt niet');

  // Wegklikken in de 0,3 s waarin de kaart na verder dichtdraait: het paneel
  // stond dan nog open, dus er werd niet gepauzeerd, en na het omdraaien liep
  // de klok buiten beeld.
  await page.click('#btnPauze');
  await page.waitForTimeout(450);
  await page.click('#btnResume');
  await page.waitForTimeout(60);
  await zicht('hidden');
  const halverwege = await page.evaluate(() => document.querySelector('#timerBand').style.strokeDashoffset);
  await page.waitForTimeout(900);
  ok(await paneelOpen(), 'wegklikken terwijl verder de kaart omdraait, laat de beurt doorlopen');
  ok(await page.evaluate(() => document.querySelector('#timerBand').style.strokeDashoffset) === halverwege,
     'de klok liep verder na wegklikken tijdens het dichtdraaien van de pauze');
  await zicht('visible');
  await page.waitForTimeout(300);
  ok(await paneelOpen(), 'na wegklikken tijdens het dichtdraaien is het paneel bij terugkomst weg');
  if (await paneelOpen()) await page.click('#btnResume');
  await page.waitForTimeout(400);

  // Tijdens het aftellen: afbreken, zoals een tik op het vlak. Anders telde
  // het in de achtergrond uit en begon de beurt op het eerste beeld terug.
  // Wachten tot de kaart is omgedraaid: het huisje staat in de hoek van de
  // achterkant, en die is de eerste 320 ms nog smal.
  await page.click('#btnPauze');
  await page.waitForTimeout(450);
  await hold(page, '#btnStop', 1400);
  await page.waitForTimeout(250);
  await page.click('#btnStart');
  await page.waitForTimeout(400);
  await page.click('#btnStartTurn');
  await page.waitForTimeout(400);
  ok(await page.getAttribute('#countdown', 'hidden') === null, 'het aftellen begon niet');
  await zicht('hidden');
  await page.waitForTimeout(3500);
  await zicht('visible');
  await page.waitForTimeout(300);
  ok(await screen() === 'handoff', 'wegklikken tijdens het aftellen gaat niet terug naar de overdracht');
  ok(await game(() => window.__tijd.G.card) === null, 'wegklikken tijdens het aftellen begon toch een beurt');

  // Wegklikken in de 0,3 s waarin start de opdrachtkaart wegdraait, nog vóór
  // het aftellen: het scherm heette dan nog overdracht, en het aftellen en de
  // beurt begonnen op hun timers buiten beeld.
  await page.waitForTimeout(400);
  await page.click('#btnStartTurn');
  await page.waitForTimeout(80);
  await zicht('hidden');
  await page.waitForTimeout(1500);
  await zicht('visible');
  await page.waitForTimeout(300);
  ok(await screen() === 'handoff', 'wegklikken terwijl start de kaart omdraait, begint toch het aftellen');
  ok(await page.getAttribute('#countdown', 'hidden') !== null, 'het aftellen staat in beeld na wegklikken tijdens het omdraaien');
  ok(await game(() => window.__tijd.G.card) === null, 'wegklikken tijdens het omdraaien van start begon toch een beurt');

  // --- het huisje op de overdracht vasthouden stopt het potje ---
  await hold(page, '#btnStopHo', 1400);
  await page.waitForTimeout(250);
  ok(await screen() === 'title', 'het huisje op de overdracht vasthouden komt niet op de titel uit');
  ok(!await game(() => !!window.__tijd.G), 'het huisje op de overdracht gooit het potje niet weg');

  // --- tikken op goed: schuivend, met een tweede vinger, bij het neerzetten,
  // op de ring ---
  // Met click gingen de eerste twee verloren: de browser maakte van een
  // schuivende vinger een veeg, en twee vingers geven geen klik (een duim die
  // de telefoon vasthoudt). Echte aanraking via CDP, op een touch-toestel.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const tp = await ctx.newPage();
    tp.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await tp.goto(APP_URL);
    await tp.evaluate(() => localStorage.clear());
    await tp.reload();
    await tp.waitForTimeout(400);
    await tp.tap('#btnStart');
    await tp.waitForFunction(() => window.__tijd.screen === 'handoff', null, { timeout: 8000 });
    await tp.waitForTimeout(2500);
    await tp.tap('#btnStartTurn');
    await tp.waitForFunction(() => window.__tijd.screen === 'play' &&
      document.querySelector('#countdown').hidden, null, { timeout: 15000 });
    await tp.waitForTimeout(400);
    const cdp = await ctx.newCDPSession(tp);
    const b = await tp.locator('#btnGoed').boundingBox();
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    const vinger = (px, py, id) => ({ x: px, y: py, id, radiusX: 8, radiusY: 8, force: 1 });
    const raak = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const punten = () => tp.evaluate(() => { const G = window.__tijd.G; return G.scores[G.team][G.round - 1]; });
    const wacht = ms => tp.waitForTimeout(ms);

    let voor = await punten();
    await raak('touchStart', [vinger(x, y, 0)]); await wacht(40);
    await raak('touchMove', [vinger(x + 20, y + 20, 0)]); await wacht(40);
    await raak('touchEnd', []); await wacht(500);
    ok(await punten() === voor + 1, 'een tik op goed die 28 px schuift, telt niet');

    voor = await punten();
    const duim = vinger(4, 500, 1);
    await raak('touchStart', [duim]); await wacht(150);
    await raak('touchStart', [duim, vinger(x, y, 2)]); await wacht(80);
    await raak('touchEnd', [duim]); await wacht(100);
    await raak('touchEnd', []); await wacht(500);
    ok(await punten() === voor + 1, 'een tik op goed met een duim op de rand van het scherm, telt niet');

    // De tik telt bij het neerzetten, niet pas bij het loslaten.
    voor = await punten();
    await raak('touchStart', [vinger(x, y, 3)]); await wacht(120);
    const terwijlNeer = await punten();
    await raak('touchEnd', []); await wacht(500);
    ok(terwijlNeer === voor + 1, 'goed telt pas bij het loslaten, niet bij het neerzetten');

    // De onzichtbare ring van 20 px om goed telt mee.
    voor = await punten();
    await raak('touchStart', [vinger(x, b.y - 12, 4)]); await wacht(60);
    await raak('touchEnd', []); await wacht(500);
    ok(await punten() === voor + 1, 'een tik 12 px boven goed telt niet');
    await ctx.close();
  }

  // --- het huisje vasthouden met een echte vinger ---
  // Een duim die stevig drukt, rolt: de browser nam een vinger die 16 px
  // schoof over als veeg, en de druk brak af. En na een voltooide druk kwam
  // de klik van het loslaten op het tandwiel van de titel terecht.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const tp = await ctx.newPage();
    tp.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await tp.goto(APP_URL);
    await tp.evaluate(() => localStorage.clear());
    await tp.reload();
    await tp.waitForTimeout(400);
    await tp.tap('#btnStart');
    await tp.waitForFunction(() => window.__tijd.screen === 'handoff', null, { timeout: 8000 });
    await tp.waitForTimeout(2500);
    const cdp = await ctx.newCDPSession(tp);
    const b = await tp.locator('#btnStopHo').boundingBox();
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    const raak = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    await raak('touchStart', [{ x, y, id: 0 }]);
    for (let i = 1; i <= 10; i++) {
      await raak('touchMove', [{ x: x - 2 * i, y: y + 2 * i, id: 0 }]);
      await tp.waitForTimeout(40);
    }
    await tp.waitForTimeout(1000);
    await raak('touchEnd', []);
    await tp.waitForTimeout(700);
    const waar = await tp.evaluate(() => window.__tijd.screen);
    ok(waar !== 'handoff', 'het huisje vasthouden met een duim die 28 px rolt, breekt af');
    ok(waar !== 'setup', 'loslaten na het huisje vasthouden opent Instellingen');
    ok(waar === 'title', 'het huisje vasthouden met een echte vinger komt niet op de titel uit: ' + waar);
    await ctx.close();
  }

  // --- het tikvangnet: rollen, een duim op het glas, een dubbele tik ---
  // Een click kwam niet bij een tik die 20 px rolde of met een duim op de
  // rand, en een dubbele tik op het tandwiel opende Instellingen en sloot ze.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const tp = await ctx.newPage();
    tp.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await tp.goto(APP_URL);
    await tp.evaluate(() => localStorage.clear());
    await tp.reload();
    await tp.waitForTimeout(600);
    const cdp = await ctx.newCDPSession(tp);
    const raak = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const v = (x, y, id) => ({ x, y, id, radiusX: 8, radiusY: 8, force: 1 });
    const midden = async sel => { const b = await tp.locator(sel).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
    const waar = () => tp.evaluate(() => window.__tijd.screen);

    let [x, y] = await midden('#btnGear');
    for (let i = 0; i < 2; i++) { await raak('touchStart', [v(x, y, 1)]); await tp.waitForTimeout(40); await raak('touchEnd', []); await tp.waitForTimeout(120); }
    await tp.waitForTimeout(800);
    ok(await waar() === 'setup', 'een dubbele tik op het tandwiel komt niet op Instellingen uit: ' + await waar());
    await tp.click('#btnBack');
    await tp.waitForTimeout(800);

    [x, y] = await midden('#btnStart');
    await raak('touchStart', [v(x, y, 2)]); await tp.waitForTimeout(30);
    await raak('touchMove', [v(x + 14, y + 14, 2)]); await tp.waitForTimeout(30);
    await raak('touchEnd', []);
    await tp.waitForTimeout(800);
    ok(await waar() === 'handoff', 'een tik op start die 20 px rolt, begint geen potje');
    await tp.waitForTimeout(2200);

    [x, y] = await midden('#btnStartTurn');
    const duim = v(6, 600, 3);
    await raak('touchStart', [duim]); await tp.waitForTimeout(100);
    await raak('touchStart', [duim, v(x, y, 4)]); await tp.waitForTimeout(60);
    await raak('touchEnd', [duim]); await tp.waitForTimeout(60);
    await raak('touchEnd', []);
    await tp.waitForTimeout(800);
    ok(await tp.evaluate(() => !document.querySelector('#countdown').hidden),
       'beginnen met een duim op de rand van het scherm begint het aftellen niet');
    await ctx.close();
  }

  ok(!errs.length, 'consolefouten: ' + errs.join(' | '));

  await browser.close();
  if (fails.length) { console.log('\nFOUT:\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
  console.log('  spelverloop in orde');
})();
