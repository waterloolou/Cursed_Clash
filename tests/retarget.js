// Balance tuning step. Reads tournament results, moves each fighter's damage multiplier (BAL.out in index.html) toward its target.
//   node retarget.js IN.html OUT.html results.jsonl [more.jsonl…] [--gain=0.7] [--dead=3]
// A fighter 10 points under target gets about +3.5% damage at gain 0.7 (measured: ~2 win-rate points per 1% damage).
const fs = require('fs'), { execFileSync } = require('child_process');
const args = process.argv.slice(2), opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const [inp, out, ...files] = args.filter(a => !a.startsWith('--')); const gain = +(opt.gain || 0.7), dead = +(opt.dead || 3);
const A = JSON.parse(execFileSync('node', [__dirname + '/analyze.js', ...files, '--json'], {maxBuffer: 1 << 26}).toString());
let s = fs.readFileSync(inp, 'utf8'); const m = s.match(/const BAL = \{\n\s*out:\s*\{([^}]*)\}/); if(!m) throw new Error('BAL.out not found');
const cur = Object.fromEntries(m[1].split(',').map(kv => kv.split(':').map(x => x.trim())).filter(kv => kv.length===2).map(([k, v]) => [k, +v])); const log = [];
for(const r of A.rows){ if(r.wr==null) continue; const old = cur[r.t] || 1, gap = r.target - r.wr;
  if(Math.abs(gap) <= dead) continue; const nw = Math.max(0.5, Math.min(2.2, +(old * (1 + gain * gap/200)).toFixed(3))); cur[r.t] = nw; log.push(`${r.t} ${r.wr.toFixed(1)}→${r.target}: ${old} → ${nw}`); }
const line = Object.keys(cur).sort().map(k => `${k}:${cur[k]}`).join(', ');
s = s.replace(m[0], m[0].replace(m[1], line)); fs.writeFileSync(out, s);
console.log(log.join('\n') || 'no changes'); console.log('out of ±' + dead + ':', log.length, ' range', A.sum.min.toFixed(1), '–', A.sum.max.toFixed(1));
