// node prof.js a b [map] [seed] [--live]  -> where the time goes (top functions by self time) in a headless CPU match
const { open } = require('./harness.js');
(async () => { const [a = 'geto', o = 'megumi', m = 2, s = 1] = process.argv.slice(2);
  const { b, pg } = await open(); const cdp = await pg.context().newCDPSession(pg);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 200}); await cdp.send('Profiler.start');
  const t = Date.now(); const r = await pg.evaluate(([a, o, m, s]) => window.__cpuArena(a, o, {map:+m, seed:+s}), [a, o, m, s]); const wall = Date.now() - t;
  const { profile } = await cdp.send('Profiler.stop'); const self = {}; const dt = profile.timeDeltas, byId = {}; for(const n of profile.nodes) byId[n.id] = n;
  profile.samples.forEach((id, i) => { const n = byId[id], k = (n.callFrame.functionName || '(anon)') + ':' + (n.callFrame.lineNumber + 1); self[k] = (self[k]||0) + dt[i]/1000; });
  const tot = Object.values(self).reduce((x, y) => x + y, 0);
  console.log(`${a} vs ${o}: ${r.ms} ms of game in ${wall} ms wall = ${(r.ms/wall).toFixed(0)}x real time; winner ${r.winner}`);
  for(const [k, v] of Object.entries(self).sort((x, y) => y[1] - x[1]).slice(0, 22)) console.log(String(v.toFixed(0)).padStart(6), 'ms', (100*v/tot).toFixed(1).padStart(5) + '%', k);
  await b.close(); })();
