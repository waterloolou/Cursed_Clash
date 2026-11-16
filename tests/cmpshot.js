// node cmpshot.js OUT.png a b map [query] : one deterministic-ish mid-fight frame (idle fighters) for visual comparison
const { open } = require('./harness.js');
(async () => { const [out, a, o, map, q = ''] = process.argv.slice(2); const { b, pg } = await open({query: q});
  await pg.evaluate(([a, o, map]) => { window.__liveFight(a, o, {map:+map}); p2.x = p1.x + 260; }, [a, o, map]); await pg.waitForTimeout(1500);
  await pg.screenshot({path: out}); await b.close(); })();
