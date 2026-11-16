// Frame-time benchmark. Drives the game's real frame function (simulation + drawing) by hand with CPUs on both sides,
// software canvas (worst case: Chromebooks / blocked GPUs), meters refilled so ultimates and domains keep firing.
//   node perf.js [--quick] [--json]     prints ms per frame (avg / p95 / p99 / max) per scenario + canvas memory + heap
const { open } = require('./harness.js');
const SCEN = [['gojo','sukuna',1],['geto','megumi',2],['dagon','jogo',0],['hanami','mahito',1],['toji','yuta',5],['mechamaru','ryu',4],['yuki','choso',2],['hakari','higuruma',5],['naoya','todo',0],['meimei','takaba',1],['yuji','geto',4]];
(async () => { const quick = process.argv.includes('--quick'), asJson = process.argv.includes('--json');
  const { b, pg, errs } = await open({noRaf:true, args:['--disable-gpu', '--disable-accelerated-2d-canvas'], query: process.env.QUERY || ''});
  const cdp = await pg.context().newCDPSession(pg); const out = [];
  // CPU time of the page's process (not wall-clock), so a busy machine doesn't distort the average
  const bs = await b.newBrowserCDPSession(), fs = require('fs');
  const rpid = ((await bs.send('SystemInfo.getProcessInfo')).processInfo.filter(p => p.type==='renderer').pop() || {}).id;
  const cpuMs = () => { try{ const f = fs.readFileSync(`/proc/${rpid}/stat`, 'utf8').split(') ')[1].split(' '); return (+f[11] + +f[12]) * 10; }catch(e){ return NaN; } };
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize/1048576; };
  await pg.evaluate(() => { for(let i = 0; i < 30; i++) loopFrame(performance.now()); });
  const heap0 = await heap();
  for(const [a, o, map] of (quick ? SCEN.slice(0, 4) : SCEN)){
    const c0 = cpuMs(), FR = quick ? 600 : 1500;
    const r = await pg.evaluate(([a, o, map, frames]) => {
      window.__liveFight(a, o, {map, cpu:true, bots:true});
      let ts = performance.now() + 1000; const t = [], t0 = performance.now(); let build = 0;
      for(let f = 0; f < frames; f++){
        if(f % 420 === 200) for(const pl of [p1, p2]){ pl.domainCharge = DOMAIN_CHARGE_REQ; pl.ce = pl.ceMax; for(const [k, c] of TRAIN_METERS){ if(typeof pl[k]==='number'){ try{ const req = eval(c); if(req > 0) pl[k] = req; }catch(e){} } } }
        if(phase!=='fight'){ p1.reset(); p2.reset(); p1lives = 3; p2lives = 3; winner = null; roundWinner = null; phase = 'fight'; }
        const s = performance.now(); loopFrame(ts); ctx.getImageData(0, 0, 1, 1); const d = performance.now() - s;
        if(f < 3) build = Math.max(build, d); else t.push(d); ts += 1000/60; }
      t.sort((x, y) => x - y); const q = p => t[Math.min(t.length - 1, Math.floor(t.length*p))];
      return {avg: t.reduce((x, y) => x + y, 0)/t.length, p50:q(0.5), p95:q(0.95), p99:q(0.99), max:t[t.length-1], over16: t.filter(x => x > 16.7).length, over33: t.filter(x => x > 33.4).length, firstFrames:build, canvasMB: window.__canvasMB(), lite: LITE};
    }, [a, o, map, FR]);
    r.cpu = (cpuMs() - c0)/FR;
    r.name = `${a} vs ${o} · map ${map}`; out.push(r);
    if(!asJson) console.log(r.name.padEnd(30), `cpu ${r.cpu.toFixed(2)}  avg ${r.avg.toFixed(2)}  p95 ${r.p95.toFixed(2)}  p99 ${r.p99.toFixed(2)}  max ${r.max.toFixed(1)}  >16.7ms ${r.over16}  >33ms ${r.over33}  first ${r.firstFrames.toFixed(0)}ms  canvas ${r.canvasMB}MB`);
  }
  const heap1 = await heap();
  const sum = {cpu: +Math.max(...out.map(r => r.cpu)).toFixed(2), avg: Math.max(...out.map(r => r.avg)), p95: Math.max(...out.map(r => r.p95)), p99: Math.max(...out.map(r => r.p99)), max: Math.max(...out.map(r => r.max)), over33: out.reduce((s, r) => s + r.over33, 0), canvasMB: Math.max(...out.map(r => r.canvasMB)), heapStartMB:+heap0.toFixed(1), heapEndMB:+heap1.toFixed(1), heapGrowthMB:+(heap1 - heap0).toFixed(1), errors: errs.length};
  console.log(asJson ? JSON.stringify({sum, out}) : 'WORST ' + JSON.stringify(sum)); if(errs.length && !asJson) console.log(errs.slice(0, 5));
  await b.close(); })();
