// B7 — the difficulty ladder: Hard should beat Normal, and Normal should beat Easy, at least 60% of the time (mirror-free random matchups).
//   node ladder.js [matches per rung, default 60]
const { open } = require('./harness.js');
(async () => { const N = +process.argv[2] || 60; const { b, pg } = await open({noRaf:true});
  const types = await pg.evaluate(() => CHARACTERS.map(c => c.type)), maps = await pg.evaluate(() => MAPS.map((m, i) => i).filter(i => !MAPS[i].training));
  let fail = 0;
  for(const [hi, lo] of [['hard','normal'], ['normal','easy']]){ let w = 0, n = 0;
    for(let k = 0; k < N; k++){ const a = types[(k*7 + 3) % types.length], o = types[(k*11 + 8) % types.length]; if(a===o) continue;
      const flip = k % 2===1;   // the stronger level alternates sides so the side itself cannot help
      const r = await pg.evaluate(([a, o, m, s, lA, lB]) => window.__cpuArena(a, o, {map:m, seed:s, lvlA:lA, lvlB:lB}), [a, o, maps[k % maps.length], 5000 + k, flip ? lo : hi, flip ? hi : lo]);
      if(r.winner==='D') continue; n++; if((r.winner==='A') !== flip) w++; }
    const pct = 100*w/n; console.log(`${hi} beats ${lo}: ${w}/${n} = ${pct.toFixed(1)}%`); if(pct < 60) fail++; }
  console.log(fail ? 'LADDER FAILED' : 'LADDER OK'); await b.close(); process.exit(fail ? 1 : 0); })();
