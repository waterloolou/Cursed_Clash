// How big are the host's snapshots? Runs CPU-vs-CPU fights and builds the snapshot a joiner would get every frame.
//   node netsize.js [--json]   -> bytes per second, split by section, top player fields, time to build
const { open } = require('./harness.js');
const SCEN = [['gojo','sukuna',1],['geto','megumi',2],['dagon','jogo',0],['toji','yuta',5],['mechamaru','ryu',4],['hanami','mahito',1]];
(async () => { const { b, pg } = await open({noRaf:true}); const out = [];
  for(const [a, o, map] of SCEN){
    out.push(await pg.evaluate(([a, o, map]) => {
      window.__liveFight(a, o, {map, cpu:true, bots:true});
      const conn = {cache:{g:{}, p:{}, a:{}, dref:null, dk:{}}, pendFx:[], pendTer:[], terGen:-1, open:true};
      const sec = {g:0, P:0, A:0, D:0, T:0, E:0}, fld = {}, arr = {}; let ts = performance.now() + 500, bytes = 0, build = 0, sent = 0; const F = 1800;
      const wasRole = NET.role; let fxN = 0;
      for(let f = 0; f < F; f++){
        if(f % 420 === 200) for(const pl of [p1, p2]){ pl.domainCharge = DOMAIN_CHARGE_REQ; pl.ce = pl.ceMax; }
        if(phase!=='fight'){ p1.reset(); p2.reset(); p1lives = 3; p2lives = 3; winner = null; roundWinner = null; phase = 'fight'; }
        loopFrame(ts); ts += 1000/60;
        if(typeof NET_SEND_EVERY==='number' && (f % NET_SEND_EVERY)!==0) continue;
        const t0 = performance.now(); const m = netSnapshot(conn); build += performance.now() - t0; sent++;
        if(f < 5) continue;   // the first snapshot is the full state
        const s = JSON.stringify(m); bytes += s.length;
        for(const k in sec) if(m[k]!==undefined) sec[k] += JSON.stringify(m[k]).length;
        if(m.P) for(const r in m.P) if(m.P[r] && m.P[r].f) for(const k in m.P[r].f) fld[k] = (fld[k]||0) + k.length + 4 + JSON.stringify(m.P[r].f[k]).length;
        if(m.A) for(const k in m.A) arr[k] = (arr[k]||0) + JSON.stringify(m.A[k]).length;
      }
      const top = o => Object.entries(o).sort((x, y) => y[1] - x[1]).slice(0, 14).map(([k, v]) => k + ' ' + Math.round(v/(F/60)/102.4)/10);
      return {name: `${a} vs ${o}`, kbps: Math.round(bytes/(F/60)/102.4)/10, perSnap: Math.round(bytes/sent), buildMs: +(build/sent).toFixed(3), sec: Object.fromEntries(Object.entries(sec).map(([k, v]) => [k, Math.round(v/(F/60)/102.4)/10])), fields: top(fld), arrays: top(arr)};
    }, [a, o, map])); }
  if(process.argv.includes('--json')){ console.log(JSON.stringify({worstKBps: Math.max(...out.map(r => r.kbps)), worstBuildMs: Math.max(...out.map(r => r.buildMs)), out})); }
  else { for(const r of out){ console.log(`${r.name.padEnd(20)} ${String(r.kbps).padStart(6)} KB/s  ${r.perSnap} B/snapshot  build ${r.buildMs} ms  `, JSON.stringify(r.sec)); console.log('   fields:', r.fields.join(', ')); console.log('   arrays:', r.arrays.join(', ')); } }
  await b.close(); })();
