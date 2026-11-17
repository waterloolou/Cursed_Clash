// One matchup, many seeds: node mu.js A B [n=24] — prints A's wins and how both spent their time (for matchup fixes, B4)
const { open } = require('./harness.js');
(async () => { const [a, o, n0] = process.argv.slice(2), N = +n0 || 24; const { b, pg } = await open({noRaf:true});
  const maps = await pg.evaluate(() => MAPS.map((m, i) => i).filter(i => !MAPS[i].training)); let w = 0, dA = 0, dB = 0; const mvA = {}, mvB = {};
  for(let k = 0; k < N; k++){ const flip = k % 2; const r = await pg.evaluate(([x, y, m, s]) => window.__cpuArena(x, y, {map:m, seed:s}), flip ? [o, a, maps[k % maps.length], 7000 + k] : [a, o, maps[k % maps.length], 7000 + k]);
    const sa = flip ? 'B' : 'A', sb = flip ? 'A' : 'B'; if(r.winner===sa) w++; dA += r['dmg'+sa]; dB += r['dmg'+sb];
    for(const [mv, src] of [[mvA, r['mv'+sa]], [mvB, r['mv'+sb]]]) for(const q in src) mv[q] = (mv[q]||0) + src[q]; }
  const top = mv => { const t = Object.values(mv).reduce((x, y) => x + y, 0); return Object.entries(mv).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([q, v]) => q + ' ' + Math.round(100*v/t) + '%').join(', '); };
  console.log(`${a} beats ${o}: ${w}/${N}  dmg ${Math.round(dA/N)} vs ${Math.round(dB/N)}\n  ${a}: ${top(mvA)}\n  ${o}: ${top(mvB)}`); await b.close(); })();
