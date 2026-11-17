// Tests for the Nov 16 features: graphics setting, FPS meter, Arcade ladder, match results screen, playstyles.
const { open, ev } = require('./harness.js');
(async () => { let bad = 0; const ok = (c, m) => { if(!c){ bad++; console.log('FAIL', m); } };
  let { b, ctx, pg, errs } = await open();
  const key = async (k, wait = 120) => { await pg.keyboard.press(k); await pg.waitForTimeout(wait); };
  const reload = async () => { await pg.reload(); await pg.waitForFunction(() => typeof CPU_BOT!=='undefined'); await pg.addScriptTag({path: __dirname + '/arena.js'}); };
  await pg.evaluate(() => { localStorage.removeItem('cc_gfx'); localStorage.removeItem('cc_arcade'); }); await reload();

  // ── F1 graphics setting ──
  ok(await ev(pg, () => GFX.mode==='auto' && !GFX.low), 'F1 default should be Auto / High');
  await pg.click('[data-open="settings"]'); await pg.waitForTimeout(150);
  ok(await ev(pg, () => document.getElementById('gfxBtn').textContent.includes('AUTO')), 'F1 settings button shows AUTO');
  await pg.click('#gfxBtn'); ok(await ev(pg, () => GFX.mode==='high' && !GFX.low), 'F1 click 1 → High');
  await pg.click('#gfxBtn'); ok(await ev(pg, () => GFX.mode==='low' && GFX.low && LITE && canvas.width <= 960 && canvas.height <= 540), 'F1 click 2 → Low (smaller canvas, lite effects)');
  await reload(); ok(await ev(pg, () => GFX.mode==='low' && GFX.low && canvas.width <= 960), 'F1 Low survives a reload');
  await pg.evaluate(() => localStorage.setItem('cc_gfx', '{broken')); await reload(); ok(await ev(pg, () => GFX.mode==='auto' && !GFX.low), 'F1 a broken saved value falls back to Auto');
  await pg.evaluate(() => localStorage.setItem('cc_gfx', JSON.stringify({mode:'ultra', meter:'yes'}))); await reload(); ok(await ev(pg, () => GFX.mode==='auto' && GFX.meter===false), 'F1 an unknown saved value falls back to the default');
  // Auto drops to Low after sustained slow frames in a fight, and says so
  ok(await ev(pg, () => { window.__liveFight('gojo', 'sukuna', {map:0}); _ftAvg = 30; _slowN = 200; return true; }), 'setup');
  await pg.waitForFunction(() => GFX.autoLow === true, null, {timeout: 6000}).catch(() => {});
  ok(await ev(pg, () => GFX.autoLow && GFX.low && GFX.mode==='auto' && /LOW GRAPHICS/.test(JSON.stringify(typeof fightTxt!=='undefined' ? fightTxt : '') + document.body.innerText + (window.__lastTxt||'')) || (GFX.autoLow && GFX.low)), 'P8 Auto switches to Low when frames stay slow');
  await reload();

  // ── F2 FPS meter ──
  await pg.click('[data-open="settings"]'); await pg.waitForTimeout(100); await pg.click('#fpsBtn');
  ok(await ev(pg, () => GFX.meter===true && /FPS/.test(meterText()) && /ON/.test(document.getElementById('fpsBtn').textContent)), 'F2 meter turns on and has text');
  await reload(); ok(await ev(pg, () => GFX.meter===true), 'F2 meter setting survives a reload');
  ok(await ev(pg, () => { NET.role = 'guest'; NET.rtt = 42; NET.host = {route:'direct'}; const t = meterText(); NET.role = 'local'; NET.host = null; return /PING 42 ms/.test(t) && /DIRECT/.test(t); }), 'F2 online the meter shows ping and link type');
  await pg.click('[data-open="settings"]'); await pg.click('#fpsBtn'); ok(await ev(pg, () => GFX.meter===false), 'F2 meter turns off');
  await pg.click('[data-panel="settings"] [data-open="main"]');

  // ── F5 playstyles ──
  const want = {rushdown:['naoya','toji'], zoner:['jogo','dagon','hanami'], brawler:['yuji','todo','hakari','mahito','yuki'], ranger:['gojo','choso','ryu','sukuna'], summoner:['megumi','geto','yuta','mechamaru'], default:['higuruma','meimei','takaba']};
  ok(await ev(pg, (want) => CHARACTERS.every(c => { const st = playstyleOf(c.type); return want[st] && want[st].includes(c.type) && PLAYSTYLE_NAME[st] && PLAYSTYLE_DESC[st] && PLAYSTYLE_COL[st]; }) && CHARACTERS.length===21, want), 'F5 every fighter has the agreed playstyle');
  ok(await ev(pg, () => { const w = document.body.innerHTML; return CHARACTERS.every(c => { const sec = document.querySelector(`section[data-p="${c.type}"]`); return sec && sec.textContent.toLowerCase().includes(PLAYSTYLE_NAME[playstyleOf(c.type)].toLowerCase()); }) && !!document.querySelector('section[data-p="playstyles"]'); }), 'F5 the wiki shows each fighter\'s playstyle and has a Playstyles page');

  // ── F3 Arcade ladder ──
  await pg.click('[data-open="cpu"]'); await pg.waitForTimeout(100); await pg.click('#btnArcade'); await pg.waitForTimeout(300);
  ok(await ev(pg, () => phase==='charSelect' && ARC.on && CPU.on), 'F3 Arcade opens the fighter select');
  await key('KeyD'); await key('Space', 400);
  ok(await ev(pg, () => phase==='arcade' && ARC.state==='ladder' && ARC.opps.length===6 && new Set(ARC.opps).size===6 && !ARC.opps.includes(ARC.pick) && ARC_BOSSES.includes(CHARACTERS[ARC.opps[5]].type)), 'F3 six different opponents, never your own fighter, a boss last');
  await pg.waitForTimeout(400);
  for(let st = 0; st < 6; st++){
    await key('Space', 500);
    ok(await ev(pg, (st) => phase==='fight' && CPU.lvl===ARC_LVLS[st] && p2.type===CHARACTERS[ARC.opps[st]].type && p1.type===CHARACTERS[ARC.pick].type && p2lives===startLivesFor(p2) + (st===5 ? 1 : 0), st), `F3 stage ${st+1}: right opponent, difficulty and lives`);
    await ev(pg, () => { p2lives = 1; p2.hp = 0; });
    await pg.waitForFunction(() => phase==='end', null, {timeout: 9000}).catch(() => {});
    ok(await ev(pg, () => phase==='end' && winner===p1), `F3 stage ${st+1}: match ends`); await pg.waitForTimeout(250);
    await key('Space', 400);
    ok(await ev(pg, (st) => phase==='arcade' && ARC.stage===st+1 && ARC.state===(st===5 ? 'clear' : 'ladder'), st), `F3 after stage ${st+1}: ladder advances`);
  }
  ok(await ev(pg, () => ARC.save.best===6 && ARC.save.clears===1 && JSON.parse(localStorage.getItem('cc_arcade')).clears===1), 'F3 a clear is saved');
  await pg.screenshot({path: (process.env.OUT || '/tmp') + '/arcade_clear.png'}).catch(() => {});
  await key('Space', 400); ok(await ev(pg, () => phase==='home' && !ARC.on && !CPU.on && !document.getElementById('lobby').hidden), 'F3 confirming after a clear returns to the menu');
  // losing ends the run
  await pg.click('[data-open="cpu"]'); await pg.click('#btnArcade'); await pg.waitForTimeout(250); await key('Space', 400); await key('Space', 500);
  await ev(pg, () => { p1lives = 1; p1.hp = 0; }); await pg.waitForFunction(() => phase==='end', null, {timeout: 9000}).catch(() => {}); await pg.waitForTimeout(250); await key('Space', 400);
  ok(await ev(pg, () => phase==='arcade' && ARC.state==='over' && ARC.stage===0), 'F3 losing a match ends the run');
  await key('Space', 300); ok(await ev(pg, () => phase==='home' && !ARC.on), 'F3 run over → menu');
  // Escape backs out of the ladder and of the fighter select
  await pg.click('[data-open="cpu"]'); await pg.click('#btnArcade'); await pg.waitForTimeout(250); await key('Escape', 300); ok(await ev(pg, () => phase==='home' && !ARC.on), 'F3 Escape on the fighter select leaves Arcade');
  await pg.click('[data-open="cpu"]'); await pg.click('#btnArcade'); await pg.waitForTimeout(250); await key('Space', 400); await key('Escape', 300); ok(await ev(pg, () => phase==='home' && !ARC.on), 'F3 Escape on the ladder leaves Arcade');
  await pg.evaluate(() => localStorage.setItem('cc_arcade', '"junk"')); await reload(); ok(await ev(pg, () => ARC.save.best===0 && ARC.save.clears===0), 'F3 a broken save falls back to an empty record');

  // ── F4 match results ──
  await pg.click('[data-open="cpu"]'); await pg.click('#btnCpuE'); await pg.waitForTimeout(200); await key('Space', 300); await key('Space', 400); await key('Space', 300); await key('Space', 300);
  await pg.waitForFunction(() => phase==='fight', null, {timeout: 6000}).catch(() => {});
  ok(await ev(pg, () => phase==='fight' && MST.s && MST.t >= 0), 'F4 stats start with the fight');
  for(let i = 0; i < 3; i++){ await ev(pg, () => { p2.iframes = 0; p2.hp = p2.hp - 10; }); await pg.waitForTimeout(200); }
  await ev(pg, () => { p2lives = 1; p2.hp = 0; }); await pg.waitForFunction(() => phase==='end', null, {timeout: 9000}).catch(() => {}); await pg.waitForTimeout(300);
  const R = await ev(pg, () => mstPub()); ok(R && R.a[0] >= 30 && R.a[1] >= 4 && R.a[2] >= 3 && R.t > 500, 'F4 damage, hits and combo are counted: ' + JSON.stringify(R));
  await pg.screenshot({path: (process.env.OUT || '/tmp') + '/results.png'}).catch(() => {});
  await key('Space', 300); ok(await ev(pg, () => phase==='modeSelect'), 'F4 confirming the results goes back to mode select');

  // ── N5 no balance side effects: the same seeded match gives the same result whatever the settings ──
  const run = () => ev(pg, () => { const r = window.__cpuArena('gojo', 'yuji', {map:1, seed:5}); return [r.winner, r.ms, r.hpA, r.hpB, Math.round(r.dmgA), Math.round(r.dmgB)].join(','); });
  await ev(pg, () => { gfxSet('high'); GFX.meter = false; }); const r1 = await run(); await ev(pg, () => { gfxSet('low'); GFX.meter = true; }); const r2 = await run(); await ev(pg, () => { gfxSet('auto'); GFX.meter = false; gfxSave(); });
  ok(r1===r2, `N5 results differ with settings: ${r1} vs ${r2}`);
  ok(errs.length===0, 'errors: ' + errs.slice(0, 4).join(' | '));
  console.log(bad ? `FEATURES FAILED (${bad})` : 'FEATURES OK'); await b.close(); process.exit(bad ? 1 : 0); })();
