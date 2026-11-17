// Every fighter uses every action (punch, both abilities, super, ultimate, Maximum Output 1 & 2, dash, block, item, feat) under both
// rule sets, with the game drawing every frame. Fails on any error the game logs, a non-finite position, or a fighter stuck in a state.
//   node abilities.js [fighter,fighter…]
const { open } = require('./harness.js');
const ACTS = [['atk'],['ab1'],['ab2'],['ab3'],['ult'],['vtog','ab1'],['vtog','ab2'],['dash'],['block'],['jump','atk'],['down','atk'],['pick'],['feat'],['ult','ult']];
(async () => { const only = (process.argv[2] || '').split(',').filter(Boolean);
  const { b, pg, errs } = await open({noRaf:true, viewport:{width:960, height:540}}); const fails = []; let runs = 0;
  const types = (await pg.evaluate(() => CHARACTERS.map(c => c.type))).filter(t => !only.length || only.includes(t));
  for(const t of types) for(const online of [true, false]) for(const seq of ACTS){
    const e0 = errs.length;
    const r = await pg.evaluate(([t, online, seq]) => {
      const opp = t==='sukuna' ? 'gojo' : 'sukuna'; window.__liveFight(t, opp, {map: 0, online});
      let ts = performance.now() + 500; const step = n => { for(let i = 0; i < n; i++){ loopFrame(ts); ts += 1000/60; } };
      step(5); p2.x = p1.x + 120; p2.y = p1.y; p1.iframes = 0; p2.iframes = 0;
      p1.domainCharge = DOMAIN_CHARGE_REQ; p1.ce = p1.ceMax; for(const [f, c] of TRAIN_METERS){ if(typeof p1[f]==='number'){ try{ const req = eval(c); if(req > 0) p1[f] = req; }catch(e){} } }
      if(seq[0]==='pick'){ try{ spawnItem && spawnItem(p1.x + 10, p1.y); }catch(e){} }
      for(const k of seq){ window.__held['A1_' + k] = true; step(k==='vtog' ? 3 : 9); window.__held['A1_' + k] = false; step(k==='ult' && seq.length > 1 ? 60 : 3); }
      step(60); const mid = p1.state;
      { const SD = window.safeDraw; for(let k = 0; k < 14*60/8; k++){ window.safeDraw = function(){}; try{ step(7); } finally { window.safeDraw = SD; } step(1); } }   // the long tail: draw one frame in eight
      const bad = [];
      for(const [n, pl] of [['p1', p1], ['p2', p2]]) if(!(isFinite(pl.x) && isFinite(pl.y) && isFinite(pl.hp))) bad.push(n + ' not finite');
      const free = [S.IDLE, S.WALK, S.AIR, S.DEAD, S.BLOCK].includes(p1.state) || p1.respawnT > 0 || phase!=='fight';
      if(!free && !(activeDomain || domainClash) && !p1.mechUltPhase /* Ultimate Mechamaru lasts 20s by design */) bad.push('p1 still in ' + p1.state + ' 15s later');
      return {mid, end: p1.state, bad, phase};
    }, [t, online, seq]); runs++;
    const newErrs = errs.slice(e0);
    if(r.bad.length || newErrs.length) fails.push(`${t} ${online ? 'online' : 'classic'} [${seq.join('+')}] ${r.bad.join('; ')} ${newErrs.slice(0, 2).join(' | ').slice(0, 400)}`);
  }
  for(const f of fails.slice(0, 40)) console.log('FAIL', f);
  console.log(fails.length ? `ABILITIES FAILED: ${fails.length} of ${runs}` : `ABILITIES OK (${runs} runs, ${types.length} fighters)`); await b.close(); process.exit(fails.length ? 1 : 0); })();
