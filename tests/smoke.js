// Quick check: page loads clean, and a short CPU match per fighter (rotating opponents and maps) throws no errors.
const { open } = require('./harness.js');
(async () => { const { b, pg, errs } = await open(); let bad = 0;
  const types = await pg.evaluate(() => CHARACTERS.map(c => c.type)), maps = await pg.evaluate(() => MAPS.map((m, i) => i).filter(i => !MAPS[i].training));
  for(let i = 0; i < types.length; i++){ const a = types[i], o = types[(i + 7) % types.length];
    const r = await pg.evaluate(([a, o, m, s]) => window.__cpuArena(a, o, {map:m, seed:s, maxMs:60000}), [a, o, maps[i % maps.length], i + 1]);
    if(r.errs.length || r.bad.length){ bad++; console.log('FAIL', a, 'vs', o, JSON.stringify(r.errs).slice(0, 500), r.bad); } }
  if(errs.length){ bad++; console.log('PAGE ERRORS', errs.slice(0, 5)); }
  console.log(bad ? `SMOKE FAILED (${bad})` : `SMOKE OK (${types.length} matches, ${maps.length} maps)`); await b.close(); process.exit(bad ? 1 : 0); })();
