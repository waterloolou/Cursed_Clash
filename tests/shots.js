// Screenshots for visual review: node shots.js OUTDIR [--all]
//   menus (home, mode, stage, fighter select), every map mid-fight, and with --all every fighter using each of their moves.
const fs = require('fs'), path = require('path'); const { open, fight } = require('./harness.js');
(async () => { const out = path.resolve(process.argv[2] || 'shots'), all = process.argv.includes('--all'); fs.mkdirSync(out, {recursive:true});
  const vp = process.env.VP ? {width:+process.env.VP.split('x')[0], height:+process.env.VP.split('x')[1]} : {width:1280, height:720};
  const { b, pg, errs } = await open({viewport: vp}); const shot = n => pg.screenshot({path: path.join(out, n + '.png')});
  await pg.waitForTimeout(900); await shot('01_home');
  const types = await pg.evaluate(() => CHARACTERS.map(c => c.type)), maps = await pg.evaluate(() => MAPS.map((m, i) => i).filter(i => !MAPS[i].training));
  await pg.evaluate(() => { document.querySelectorAll('#lobby').forEach(e => e.style.display = 'none'); NET.role = 'local'; CPU.on = true; phase = 'modeSelect'; }); await pg.waitForTimeout(400); await shot('02_mode');
  await pg.evaluate(() => { phase = 'mapSelect'; }); await pg.waitForTimeout(700); await shot('03_stage');
  await pg.evaluate(() => { phase = 'charSelect'; p1Confirmed = false; p2Confirmed = false; }); await pg.waitForTimeout(700); await shot('04_fighters');
  for(const m of maps){ const a = types[(m * 4) % types.length], o = types[(m * 4 + 9) % types.length];
    await pg.evaluate(([a, o, m]) => window.__liveFight(a, o, {map:m, cpu:true, bots:true}), [a, o, m]);
    await pg.waitForTimeout(600); await shot(`10_map${m}_start`); await pg.waitForTimeout(5200); await shot(`11_map${m}_${a}_vs_${o}`); }
  if(all) for(const t of types){
    for(const [k, nm] of [['ab1','q'], ['ab2','e'], ['ab3','r'], ['ult','f'], ['atk','punch']]){
      await pg.evaluate(([t]) => { window.__liveFight(t, t==='gojo' ? 'sukuna' : 'gojo', {map:0}); p2.x = p1.x + 150; p1.iframes = 0; p2.iframes = 0;
        p1.domainCharge = DOMAIN_CHARGE_REQ; p1.ce = p1.ceMax; for(const [f, c] of TRAIN_METERS){ if(typeof p1[f]==='number'){ try{ const req = eval(c); if(req > 0) p1[f] = req; }catch(e){} } } }, [t]);
      await pg.waitForTimeout(250); await pg.evaluate(k => { window.__held['A1_' + k] = true; }, k); await pg.waitForTimeout(140); await pg.evaluate(k => { window.__held['A1_' + k] = false; }, k);
      await pg.waitForTimeout(k==='ult' ? 900 : 380); await shot(`20_${t}_${nm}`); } }
  await pg.evaluate(() => { window.__liveFight('gojo', 'sukuna', {map:0}); p2lives = 1; p2.hp = 0; }); await pg.waitForTimeout(3600); await shot('30_match_end');
  console.log('shots in', out, 'errors:', errs.length, errs.slice(0, 3)); await b.close(); })();
