// Balance tuning step. Moves each fighter's damage multiplier (BAL.out in index.html) toward its target win rate.
//   node retarget.js OUT.html build1.html=a.jsonl,b.jsonl [build2.html=c.jsonl …] [--gain=0.7] [--dead=3]
// The LAST build is the current one. Earlier passes are pooled in: their win rates are shifted by what the multiplier change since
// then should have done (about 2 win-rate points per 1% damage, measured) and weighted 0.7 per pass of age, so the estimate gets
// steadier every pass instead of chasing the noise of one tournament (±4 points at 160 matches).
const fs = require('fs'), { execFileSync } = require('child_process');
const args = process.argv.slice(2), opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const [out, ...hist] = args.filter(a => !a.startsWith('--')); const gain = +(opt.gain || 0.7), dead = +(opt.dead || 3), SENS = 200;
const RX = /const BAL = \{\n\s*out:\s*\{([^}]*)\}/;
const mult = html => { const m = fs.readFileSync(html, 'utf8').match(RX); if(!m) throw new Error('BAL.out not found in ' + html); return Object.fromEntries(m[1].split(',').map(kv => kv.split(':').map(x => x.trim())).filter(kv => kv.length===2).map(([k, v]) => [k, +v])); };
const passes = hist.map(h => { const [html, files] = h.split('='); return {html, m: mult(html), A: JSON.parse(execFileSync('node', [__dirname + '/analyze.js', ...files.split(','), '--json'], {maxBuffer: 1 << 26}).toString())}; });
const curP = passes[passes.length - 1], cur = Object.assign({}, curP.m), log = []; let nOut = 0;
for(const r of curP.A.rows){ if(r.wr==null) continue; let sw = 0, sx = 0;
  passes.forEach((p, i) => { const row = p.A.rows.find(x => x.t===r.t); if(!row || row.wr==null) return; const w = row.n * Math.pow(0.7, passes.length - 1 - i);
    sx += w * (row.wr + SENS * Math.log((cur[r.t] || 1)/(p.m[r.t] || 1))); sw += w; });
  const est = sx/sw, gap = r.target - est, old = cur[r.t] || 1;
  if(Math.abs(gap) <= dead){ log.push(`${r.t.padEnd(10)} now ${r.wr.toFixed(1)}  pooled ${est.toFixed(1)}  target ${r.target}  ok`); continue; }
  nOut++; const nw = Math.max(0.5, Math.min(2.2, +(old * Math.exp(gain * gap/SENS)).toFixed(3))); cur[r.t] = nw; log.push(`${r.t.padEnd(10)} now ${r.wr.toFixed(1)}  pooled ${est.toFixed(1)}  target ${r.target}  ${old} → ${nw}`); }
let s = fs.readFileSync(curP.html, 'utf8'); const m = s.match(RX);
s = s.replace(m[0], m[0].replace(m[1], Object.keys(cur).sort().map(k => `${k}:${cur[k]}`).join(', '))); fs.writeFileSync(out, s);
console.log(log.join('\n')); console.log(`pooled estimate outside ±${dead}: ${nOut}   this pass: ${curP.A.sum.min.toFixed(1)}–${curP.A.sum.max.toFixed(1)}, outside ±5: ${curP.A.sum.outOfBand.length}`);
