// node one.js gojo sukuna [map] [seed]  -> one CPU match, full result
const { open } = require('./harness.js');
(async () => { const { b, pg, errs } = await open(); const [a, o, m, s] = process.argv.slice(2);
  const t = Date.now(); const r = await pg.evaluate(([a, o, m, s]) => window.__cpuArena(a, o, {map:+m||0, seed:+s||1}), [a, o, m, s]);
  console.log(JSON.stringify(r), 'wall', Date.now() - t, 'ms', errs.slice(0, 3)); await b.close(); })();
