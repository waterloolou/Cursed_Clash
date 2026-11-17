// Q4 — every menu path, driven with real key presses and real mouse clicks.   node ui.js
const { open } = require('./harness.js');
(async () => { const { b, pg, errs } = await open({viewport:{width:1280, height:720}}); await pg.waitForTimeout(900);
  const fails = []; let checks = 0;
  const S = () => pg.evaluate(() => ({phase, paused, train:isTraining(), tut:TUT.on, cpu:CPU.on && CPU.lvl, arc:ARC.on, p1c:p1Confirmed, p2c:p2Confirmed, p1i:p1CharIdx, p2i:p2CharIdx, map:mapIdx, msel:mapSelectIdx, mode:modeSelectIdx, gm:gameMode,
    lobby:getComputedStyle(document.getElementById('lobby')).display!=='none', panel:[...document.querySelectorAll('.hm-list')].filter(e => !e.hidden).map(e => e.dataset.panel).join(),
    wiki:getComputedStyle(document.getElementById('wiki')).display!=='none', acct:getComputedStyle(document.getElementById('acct')).display!=='none', keys:!document.getElementById('keysPanel').hidden,
    gfx:document.getElementById('gfxBtn').textContent.replace(/[^\x20-\x7e]/g, ''), fps:document.getElementById('fpsBtn').textContent.replace(/[^\x20-\x7e]/g, '')}));
  const ok = async (label, fn) => { checks++; const s = await S(); let pass = false; try{ pass = !!fn(s); }catch(e){} if(!pass) fails.push(label + '  ← ' + JSON.stringify(s)); };
  const key = async (k, w) => { await pg.keyboard.press(k); await pg.waitForTimeout(w || 350); };
  const click = async (sel, w) => {   // a real mouse click on the middle of the element (it has to be visible and on top)
    const r = await pg.evaluate(sel => { const e = document.querySelector(sel); if(!e) return null; const q = e.getBoundingClientRect(), x = q.left + q.width/2, y = q.top + q.height/2, t = document.elementFromPoint(x, y); return q.width > 0 && t && (t===e || e.contains(t)) ? [x, y] : null; }, sel);
    if(!r) fails.push('not clickable: ' + sel); else await pg.mouse.click(r[0], r[1]); await pg.waitForTimeout(w || 350); };
  // click a point given in the game's 960×520 view units
  const cv = async (x, y, opt, w) => { const p = await pg.evaluate(([x, y]) => { const r = canvas.getBoundingClientRect(), f = viewFit(canvas.clientWidth, canvas.clientHeight); return [r.left + f.ox + x*f.s, r.top + f.oy + y*f.s]; }, [x, y]);
    await pg.mouse.move(p[0] - 3, p[1] - 3); await pg.mouse.move(p[0], p[1]); await pg.waitForTimeout(120); if(opt!=='move') await pg.mouse.click(p[0], p[1], {button: opt==='right' ? 'right' : 'left'}); await pg.waitForTimeout(w || 400); };
  const tile = i => pg.evaluate(i => { let q; withView(() => { q = csTileXY(i); }); return [q.x + CS_TW/2, q.y + CS_TH/2]; }, i);
  const mapTile = i => pg.evaluate(i => { const n = mapChoices().length + 1, gap = 12, cw = Math.min(150, Math.floor((VW - 40 - (n-1)*gap)/n)); return [VW/2 - (n*cw + (n-1)*gap)/2 + i*(cw+gap) + cw/2, 52 + 600*VH/VW + 14 + 20]; }, i);
  const until = async (ph, ms) => { try{ await pg.waitForFunction(ph => phase===ph, ph, {timeout: ms || 15000}); }catch(e){} await pg.waitForTimeout(500); };
  const toMain = async () => { if((await S()).panel!=='main') await key('Escape'); };   // leaving a match can return to the panel you started from
  const ko = async () => { await until('fight'); await pg.evaluate(() => { p2lives = 1; p2.hp = 0; }); await until('end', 20000); await pg.waitForTimeout(600); };

  // ── 1. keyboard: home → VS CPU → Normal → stage → fighters → fight → pause → results → rematch → out ──
  await ok('home at start', s => s.phase==='home' && s.lobby && s.panel==='main');
  await key('ArrowDown'); await key('Enter'); await ok('kbd: VS CPU panel', s => s.panel==='cpu');
  await key('ArrowDown'); await key('Enter', 600); await ok('kbd: Normal → mode select (the ENTER does not also confirm it)', s => s.phase==='modeSelect' && s.cpu==='normal' && !s.lobby);
  await key('Space', 600); await ok('kbd: mode → stage select', s => s.phase==='mapSelect');
  await key('ArrowRight'); await ok('kbd: stage cursor moves', s => s.msel===1);
  await key('Space', 600); await ok('kbd: stage → fighter select', s => s.phase==='charSelect');
  await key('ArrowRight'); await key('ArrowRight'); await ok('kbd: fighter cursor moves', s => s.p1i===2);
  await key('Space', 500); await ok('kbd: lock in', s => s.p1c && !s.p2c);
  await key('Space', 500); await key('Space', 300); await until('fight'); await ok('kbd: fight starts', s => s.phase==='fight');
  await key('Escape'); await ok('kbd: pause', s => s.paused); await key('Escape'); await ok('kbd: resume', s => !s.paused && s.phase==='fight');
  await ko(); await ok('results screen', s => s.phase==='end');
  await key('Space', 700); await ok('kbd: rematch → mode select', s => s.phase==='modeSelect');
  await key('ArrowRight'); await ok('kbd: mode cursor', s => s.mode===1); await key('ArrowLeft');
  await key('Escape', 700); await ok('kbd: back out to home', s => s.phase==='home' && s.lobby);
  // leave a match from the pause screen
  await toMain(); await key('ArrowDown'); await key('Enter'); await key('Enter', 600); await key('Space', 500); await key('Space', 500); await key('Space', 400); await key('Space', 400); await key('Space', 300); await until('fight');
  await ok('kbd: second fight', s => s.phase==='fight'); await key('Escape'); await key('KeyM', 700); await ok('kbd: M on the pause screen leaves the match', s => s.phase==='home' && s.lobby);

  // ── 2. mouse: the same path with clicks only ──
  await toMain();
  await click('[data-panel="main"] [data-open="cpu"]'); await ok('mouse: VS CPU panel', s => s.panel==='cpu');
  await click('#btnCpuH', 700); await ok('mouse: Hard → mode select', s => s.phase==='modeSelect' && s.cpu==='hard');
  await cv(310, 260, 'left', 700); await ok('mouse: click Normal → stage select', s => s.phase==='mapSelect');
  { const [x, y] = await mapTile(2); await cv(x, y, 'move'); await ok('mouse: pointing at a stage selects it', s => s.msel===2); await cv(x, y, 'left', 700); }
  await ok('mouse: click → fighter select', s => s.phase==='charSelect');
  { const [x, y] = await tile(5); await cv(x, y, 'move'); await ok('mouse: pointing at a fighter moves the cursor', s => s.p1i===5 && !s.p1c); await cv(x, y, 'left'); await ok('mouse: click locks in', s => s.p1c && s.p1i===5); }
  { const [x, y] = await tile(9); await cv(x, y, 'left', 500); await ok("mouse: click picks the CPU's fighter", s => s.p2c && s.p2i===9); }
  await until('fight'); await ok('mouse: fight starts', s => s.phase==='fight');
  await ko(); await ok('mouse: results screen', s => s.phase==='end');
  await cv(480, 260, 'left', 700); await ok('mouse: click → rematch (mode select)', s => s.phase==='modeSelect');
  await cv(700, 260, 'move'); await ok('mouse: pointing at Endless selects it', s => s.mode===1);
  await cv(300, 260, 'left', 600); await ok('mouse: click Normal → stage select', s => s.phase==='mapSelect' && s.gm==='normal');
  await cv(480, 30, 'right', 500); await ok('mouse: right click goes back', s => s.phase==='modeSelect');
  await cv(480, 30, 'right', 700); await ok('mouse: right click out to home', s => s.phase==='home' && s.lobby);
  if((await S()).panel!=='cpu') await click('[data-panel="main"] [data-open="cpu"]'); await click('[data-panel="cpu"] [data-open="main"]'); await ok('mouse: BACK button', s => s.panel==='main');

  // ── 3. training, tutorial ──
  await click('#btnTrain', 700); await ok('training: stage select', s => s.train && s.phase==='mapSelect');
  await key('Space', 600); await key('Space', 300); await until('fight'); await ok('training: in the room after one pick', s => s.phase==='fight' && s.train);
  await key('Escape'); await key('KeyM', 700); await ok('training: leave', s => s.phase==='home' && s.lobby);
  await toMain(); await click('#btnTut', 300); await until('fight'); await ok('tutorial starts', s => s.tut && s.phase==='fight'); await key('Escape'); await key('KeyM', 700); await ok('tutorial: leave', s => s.phase==='home' && !s.tut);

  // ── 4. local 2 player: each side locks in with its own key ──
  await toMain(); await click('#btnLocal', 700); await ok('local: mode select', s => s.phase==='modeSelect' && !s.cpu);
  await key('Space', 600); await key('Space', 600); await ok('local: fighter select', s => s.phase==='charSelect');
  await key('KeyF'); await ok('local: P1 locks with F', s => s.p1c && !s.p2c); await key('Slash', 300); await until('fight'); await ok('local: P2 locks with / and the fight starts', s => s.phase==='fight');
  await key('Escape'); await key('KeyM', 700); await ok('local: leave', s => s.phase==='home');

  // ── 5. settings, wiki, account, controls ──
  await toMain(); await click('[data-panel="main"] [data-open="settings"]'); await ok('settings panel', s => s.panel==='settings');
  { const g0 = (await S()).gfx; await click('#gfxBtn'); await ok('graphics button cycles', s => s.gfx!==g0); await click('#gfxBtn'); await click('#gfxBtn'); await ok('graphics back to where it was', s => s.gfx===g0); }
  { const f0 = (await S()).fps; await click('#fpsBtn'); await ok('FPS meter toggles', s => s.fps!==f0); await click('#fpsBtn'); }
  await click('#btnKeys'); await ok('controls screen opens', s => s.keys); await key('Escape'); await ok('controls screen closes', s => !s.keys);
  await key('Escape'); await ok('ESC leaves settings', s => s.panel==='main');
  await click('#btnWiki'); await ok('wiki opens', s => s.wiki); await key('Escape'); await ok('wiki closes', s => !s.wiki);
  await click('#btnAcct'); await ok('account opens', s => s.acct); await key('Escape'); await ok('account closes', s => !s.acct);
  await click('#acChip'); await ok('account chip opens it too', s => s.acct); await key('Escape');
  await click('[data-panel="main"] [data-open="online"]'); await ok('online panel', s => s.panel==='online'); await key('Escape'); await ok('ESC leaves online panel', s => s.panel==='main');

  for(const f of fails) console.log('FAIL', f); if(errs.length) console.log('page errors:', errs.slice(0, 4));
  const bad = fails.length + errs.length; console.log(bad ? `UI FAILED: ${fails.length} of ${checks} checks, ${errs.length} page errors` : `UI OK (${checks} checks, keyboard and mouse)`); await b.close(); process.exit(bad ? 1 : 0); })();
