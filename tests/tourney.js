// Round-robin CPU tournament. Every pair of fighters meets once per round (sides and maps rotate).
//   node tourney.js OUT.jsonl [rounds=2] [shard=0] [shards=1]      env FOCUS=toji,geto limits it to pairs with those fighters
const fs = require('fs'); const { open } = require('./harness.js');
(async () => { const [out, rounds = 2, shard = 0, shards = 1] = process.argv.slice(2); if(!out){ console.log('usage: node tourney.js OUT.jsonl [rounds] [shard] [shards]'); process.exit(1); }
  const R0 = +(process.env.ROUND0 || 0), focus = (process.env.FOCUS || '').split(',').filter(Boolean);
  let { b, pg } = await open(); const types = await pg.evaluate(() => CHARACTERS.map(c => c.type));
  const maps = process.env.MAPS ? process.env.MAPS.split(',').map(Number) : await pg.evaluate(() => MAPS.map((m, i) => i).filter(i => !MAPS[i].training)); let k = 0, done = 0;
  for(let r = R0; r < R0 + (+rounds); r++) for(let i = 0; i < types.length; i++) for(let j = i + 1; j < types.length; j++){
    if(focus.length && !focus.includes(types[i]) && !focus.includes(types[j])) continue;
    if((k++) % (+shards) !== (+shard)) continue;
    const swap = (i + j + r) % 2 === 1, a = swap ? types[j] : types[i], o = swap ? types[i] : types[j];
    const opt = {map: maps[(i * 3 + j + r) % maps.length], seed: r * 10007 + i * 211 + j + 1};
    let res; try{ res = await pg.evaluate(([a, o, opt]) => window.__cpuArena(a, o, opt), [a, o, opt]); }
    catch(e){ res = {tA:a, tB:o, crash:String(e).slice(0, 200)}; try{ await b.close(); }catch(_){ } ({ b, pg } = await open()); }
    res.round = r; fs.appendFileSync(out, JSON.stringify(res) + '\n'); done++;
  }
  console.log('done', done); await b.close(); })();
