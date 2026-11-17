// B8 / N5 — reproducibility: the same matchup, map and seed must give the same result every time, in a fresh page and whatever the
// graphics settings are.   node replay.js [matches, default 40]
const { open } = require('./harness.js');
(async () => { const N = +process.argv[2] || 40; const sig = r => [r.winner, Math.round(r.ms), r.lives, (r.hp||[]).map(h => Math.round(h*100)/100), Math.round(r.dmgA), Math.round(r.dmgB)].join('|');
  const picks = []; let x = 12345; const rnd = n => (x = (x*1103515245 + 12345) & 0x7fffffff) % n;
  const A = await open({noRaf:true}); const types = await A.pg.evaluate(() => CHARACTERS.map(c => c.type)), maps = await A.pg.evaluate(() => MAPS.map((m, i) => i).filter(i => !MAPS[i].training));
  for(let k = 0; k < N; k++){ const a = types[rnd(types.length)]; let o = types[rnd(types.length)]; if(o===a) o = types[(types.indexOf(a) + 1) % types.length]; picks.push([a, o, maps[rnd(maps.length)], 900 + k]); }
  const run = async pg => { const out = []; for(const p of picks) out.push(sig(await pg.evaluate(([a, o, m, s]) => window.__cpuArena(a, o, {map:m, seed:s}), p))); return out; };
  const r1 = await run(A.pg); await A.b.close();
  const B = await open({noRaf:true, query:'?gfx=low'}); await B.pg.evaluate(() => { try{ GFX.meter = true; }catch(e){} }); const r2 = await run(B.pg); await B.b.close();
  let diff = 0; for(let k = 0; k < N; k++) if(r1[k]!==r2[k]){ diff++; if(diff <= 5) console.log('DIFF', picks[k].join(' '), '\n  ', r1[k], '\n  ', r2[k]); }
  console.log(diff ? `REPLAY FAILED: ${diff} of ${N} differ` : `REPLAY OK (${N} matches identical across two pages and both graphics modes)`); process.exit(diff ? 1 : 0); })();
