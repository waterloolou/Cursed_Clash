// Injected into the game page by the tests. Adds:
//   __cpuArena(typeA, typeB, {map, seed, maxMs, lives, lvl}) -> runs a whole CPU-vs-CPU match headlessly (no drawing, virtual clock)
//   __liveFight(typeA, typeB, {online, map, cpu})            -> starts a normal rendered fight the test can poke at
//   __held['A1_ab1'] = true                                   -> holds an action for a player in a live fight
(function(){
  function rng(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const idx = t => { const i = CHARACTERS.findIndex(c => c.type===t); if(i < 0) throw new Error('no fighter ' + t); return i; };
  function setup(tA, tB, map, lives){
    NET.role = 'local'; gameMode = 'normal'; mapIdx = map|0; paused = false;
    p1 = buildPlayer(idx(tA), 170, 1, ctrlFor(1), 1); p2 = buildPlayer(idx(tB), 690, -1, ctrlFor(2), 2);
    p1lives = lives || startLivesFor(p1); p2lives = lives || startLivesFor(p2); p1kills = 0; p2kills = 0; clearProjectiles(); bloodPools.length = 0;
    buildTerrain(mapIdx); terrainReset();
    // nothing may leak from the previous match: clocks, item timers, the mouse
    try{ resetItems(); }catch(e){} _itemSeq = 0; terRespawnTick = 0; terDebrisBudget = 0; shakeMag = 0; roundDelay = 0;
    try{ mouseW.in = false; mouseW.x = 0; mouseW.y = 0; mouseW.t = 0; }catch(e){} try{ mstReset(); }catch(e){} try{ NET.remote = {h:0, p:0}; }catch(e){}
    // spread the fighters across bigger maps the way the game does (a third / two thirds)
    activeDomain = null; domainClash = null; domainFlash = 0; timeScale = 1; winner = null; roundWinner = null; phase = 'fight';
  }
  const sides = {};
  function botHeld(n, L){
    const me = n===1 ? p1 : p2, op = n===1 ? p2 : p1, st = sides[n];
    if(!me || !op || me.state===S.DEAD){ st.prev = {}; return {}; }
    st.f++; const m = st.mem;
    m.cfg = Object.assign(m.cfg || {}, {bf:L.bf, noBlock: Math.random() > L.block, abGap:L.abGap, noMO:!L.mo});
    const urgent = (me.bfEvt && !me.bfEvt.res) || (me.state===S.MAHICURSE && me.mcPh==='ring');
    if(st.f % L.every !== 0 && !urgent) return Object.assign({}, st.hold || {});
    const obs = {t:terClock, rules: olOn() ? 'online' : 'classic', me:cpuPub(me, n===1 ? p1lives : p2lives, op), opp:cpuPub(op, n===1 ? p2lives : p1lives, me),
      dx:(op.x - me.x), dy:(op.y - me.y), projectiles:cpuProjectiles(me), items:worldItems.map(i => ({kind:i.kind, x:i.x, y:i.y})),
      domain: activeDomain ? {owner: activeDomain.owner===me ? 'me' : 'opp', type:activeDomain.type} : null,
      map:{w:W, h:H, ground:GND, name:MAPS[mapIdx].name}, solid:(x,y,w,h) => terSolid(x, y, w||1, h||1), mem:m};
    let held = {}; try{ held = CPU_BOT.act(obs) || {}; }catch(e){ st.botErr = String(e && e.stack || e); held = {}; }
    const out = {};
    for(const k in held){ if(!held[k]) continue;
      if(!st.prev[k] && ['ab1','ab2','ab3','ult'].includes(k) && Math.random() < L.drop) continue;
      if(k==='vtog' && !L.mo && !me.varMode) continue; out[k] = true; }
    st.prev = held; st.hold = {}; for(const k of ['left','right','down','block']) if(out[k]) st.hold[k] = true;
    return out;
  }
  window.__cpuArena = function(tA, tB, o){
    o = o || {}; const L = CPU_LEVELS[o.lvl || 'hard'], STEP = 1000/60, maxMs = o.maxMs || 240000;
    const R = Math.random, DN = Date.now, PN = performance.now.bind(performance), ST = window.setTimeout;
    let vt = 0; const base = 1.7e12, timers = [];
    Math.random = rng((o.seed|0) * 7919 + 13);
    Date.now = () => base + vt; performance.now = () => vt + 1000;
    window.setTimeout = (fn, ms) => { timers.push([vt + (ms||0), fn]); return 0; };
    const res = {tA, tB, map:o.map|0, seed:o.seed|0, errs:[], dmgA:0, dmgB:0, mvA:{}, mvB:{}, dSum:0, dN:0, close:0, far:0, bad:[]};
    const wasCpu = CPU.on, wasForce = window._olForce;
    try{
      CPU.on = true; window._olForce = o.classic ? false : true;
      setup(tA, tB, o.map, o.lives);
      sides[1] = {mem:{}, prev:{}, f:0}; sides[2] = {mem:{}, prev:{}, f:0};
      let hA = p1.hp, hB = p2.hp, stuckA = 0, stuckB = 0;
      while(vt < maxMs && phase==='fight'){
        setSlotKeys(1, botHeld(1, L), {}); setSlotKeys(2, botHeld(2, L), {});
        try{ simFight(STEP); }catch(e){ const s = String(e && e.stack || e).slice(0, 400); if(res.errs.length < 5 && !res.errs.includes(s)) res.errs.push(s); res.errN = (res.errN||0) + 1; if(res.errN > 600) break; }
        vt += STEP;
        for(let i = timers.length-1; i >= 0; i--) if(timers[i][0] <= vt){ const f = timers[i][1]; timers.splice(i, 1); try{ if(typeof f==='function') f(); }catch(e){} }
        // bookkeeping: damage by attacker state, spacing, sanity
        if(p2.hp < hB){ const d = hB - p2.hp; res.dmgA += d; const k = p1.state; res.mvA[k] = (res.mvA[k]||0) + d; }
        if(p1.hp < hA){ const d = hA - p1.hp; res.dmgB += d; const k = p2.state; res.mvB[k] = (res.mvB[k]||0) + d; }
        hA = p1.hp; hB = p2.hp;
        if(p1.state!==S.DEAD && p2.state!==S.DEAD){ const d = Math.hypot(p1.x - p2.x, p1.y - p2.y); res.dSum += d; res.dN++; if(d < 150) res.close++; if(d > 350) res.far++; }
        for(const [nm, pl] of [['A', p1], ['B', p2]]){
          if(!(isFinite(pl.x) && isFinite(pl.y) && isFinite(pl.hp))){ if(res.bad.length < 4) res.bad.push(nm + ' NaN ' + pl.state + ' @' + Math.round(vt)); pl.x = isFinite(pl.x) ? pl.x : 200; pl.y = isFinite(pl.y) ? pl.y : 100; }
          else if((pl.x < -400 || pl.x > W + 400 || pl.y > H + 1500 || pl.y < -4000) && pl.state!==S.DEAD && !(pl.respawnT>0)){ if(res.bad.length < 4 && !res.bad.some(b => b.startsWith(nm + ' OOB'))) res.bad.push(nm + ' OOB ' + pl.state + ' ' + Math.round(pl.x) + ',' + Math.round(pl.y) + ' @' + Math.round(vt)); }
        }
      }
      for(const n of [1, 2]) if(sides[n].botErr && res.errs.length < 6) res.errs.push('BOT ' + sides[n].botErr.slice(0, 300));
      res.ms = Math.round(vt); res.livesA = p1lives; res.livesB = p2lives; res.hpA = Math.round(p1.hp); res.hpB = Math.round(p2.hp);
      res.timeout = phase==='fight';
      const sa = p1lives + Math.max(0, p1.hp)/(p1.maxHp||100)/10, sb = p2lives + Math.max(0, p2.hp)/(p2.maxHp||100)/10;
      res.winner = (p1lives<=0 && p2lives<=0) ? 'D' : p1lives<=0 ? 'B' : p2lives<=0 ? 'A' : sa > sb ? 'A' : sb > sa ? 'B' : 'D';
      res.avgDist = res.dN ? Math.round(res.dSum/res.dN) : 0; res.closePct = res.dN ? Math.round(100*res.close/res.dN) : 0; res.farPct = res.dN ? Math.round(100*res.far/res.dN) : 0;
      delete res.dSum; delete res.dN; delete res.close; delete res.far;
    } finally {
      Math.random = R; Date.now = DN; performance.now = PN; window.setTimeout = ST;
      setSlotKeys(1, {}, {}); setSlotKeys(2, {}, {}); CPU.on = wasCpu; window._olForce = wasForce;
      try{ clearProjectiles(); }catch(e){} activeDomain = null; domainClash = null; timeScale = 1; phase = 'home'; winner = null; roundWinner = null;
    }
    return res;
  };
  // ── live fights (real time, rendered): the page's own loop runs; the test holds actions through __held ──
  // total bytes held by every canvas the game has created (needs the harness' canvas tracking)
  window.__canvasMB = () => { let b = 0; const seen = new Set([...(window.__canvases||[]), ...document.querySelectorAll('canvas')]); for(const c of seen) b += c.width*c.height*4; return Math.round(b/1048576*10)/10; };
  window.__held = {};
  window.__liveFight = function(tA, tB, o){
    o = o || {};
    document.querySelectorAll('.home, #home, .hm, #lobby, .overlay').forEach(e => { e.style.display = 'none'; });
    CPU.on = !!o.cpu; if(o.cpu){ CPU.lvl = o.lvl || 'hard'; CPU.mem = {}; CPU.prev = {}; CPU.f = 0; }
    window._olForce = o.online !== false;
    window.__live = true; window.__held = {}; window.__botBoth = !!o.bots;
    sides[1] = {mem:{}, prev:{}, f:0}; sides[2] = {mem:{}, prev:{}, f:0};
    setup(tA, tB, o.map, o.lives);
  };
  // online tests: let the bot play this page's own fighter (slot 1 = the host's)
  window.__netBot = function(on){ window.__live = !!on; window.__botBoth = !!on; sides[1] = {mem:{}, prev:{}, f:0}; };
  // feed __held into the game's key table every frame (after the game's own input pass cleared the slots)
  const ssk = setSlotKeys;
  setSlotKeys = function(n, held, pressed){
    if(window.__live && window.__botBoth && n===1 && phase==='fight'){ try{ held = botHeld(1, CPU_LEVELS.hard); }catch(e){} }
    ssk(n, held, pressed); if(window.__live) for(const k in window.__held){ if(k.startsWith('A' + n + '_')) keys[k] = keys[k] || !!window.__held[k]; } };
})();
