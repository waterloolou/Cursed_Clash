// Where does a frame's drawing time go? Wraps the game's draw functions, flushing the canvas after each so software-raster
// cost lands on the function that caused it.   node perfbreak.js a b map [frames]
const { open } = require('./harness.js');
(async () => { const [a = 'hanami', o = 'mahito', map = 3, frames = 600] = process.argv.slice(2);
  const { b, pg } = await open({noRaf:true, args:['--disable-gpu', '--disable-accelerated-2d-canvas'], query: process.env.QUERY || ''});
  const r = await pg.evaluate(([a, o, map, frames]) => {
    const names = Object.keys(window).filter(k => /^draw[A-Z]/.test(k) && typeof window[k]==='function').concat(['simFight', 'updateCamera']);
    const T = {}, C = {}; let depth = 0;
    for(const n of names){ const f = window[n]; window[n] = function(){ const t0 = performance.now(); depth++; let r; try{ r = f.apply(this, arguments); } finally { depth--; }
      ctx.getImageData(0, 0, 1, 1); const d = performance.now() - t0; T[n] = (T[n]||0) + d; C[n] = (C[n]||0) + 1; return r; }; }
    for(const m of ['draw']){ const f = Player.prototype[m]; Player.prototype[m] = function(){ const t0 = performance.now(); const r = f.apply(this, arguments); ctx.getImageData(0, 0, 1, 1); T['Player.' + m] = (T['Player.' + m]||0) + performance.now() - t0; return r; }; }
    window.__liveFight(a, o, {map:+map, cpu:true, bots:true}); let ts = performance.now() + 1000; const t0 = performance.now();
    for(let f = 0; f < frames; f++){
      if(f % 300 === 150) for(const pl of [p1, p2]){ pl.domainCharge = DOMAIN_CHARGE_REQ; pl.ce = pl.ceMax; for(const [k, c] of TRAIN_METERS){ if(typeof pl[k]==='number'){ try{ const req = eval(c); if(req > 0) pl[k] = req; }catch(e){} } } }
      if(phase!=='fight'){ p1.reset(); p2.reset(); p1lives = 3; p2lives = 3; winner = null; roundWinner = null; phase = 'fight'; }
      loopFrame(ts); ctx.getImageData(0, 0, 1, 1); ts += 1000/60; }
    const tot = performance.now() - t0;
    return {tot: tot/frames, cw: canvas.width, ch: canvas.height, dpr: devicePixelRatio, rows: Object.entries(T).sort((x, y) => y[1] - x[1]).slice(0, 28).map(([k, v]) => [k, +(v/frames).toFixed(3), C[k]])};
  }, [a, o, map, +frames]);
  console.log(`${a} vs ${o} map ${map}: ${r.tot.toFixed(2)} ms/frame total (nested functions are counted inside their callers too) canvas ${r.cw}x${r.ch} dpr ${r.dpr}`);
  for(const [k, v] of r.rows) console.log(String(v.toFixed(2)).padStart(7), k);
  await b.close(); })();
