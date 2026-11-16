// node analyze.js FILE.jsonl [more.jsonl...]  -> win rates vs targets, lopsided matchups, match length, errors. --json for machine output
const fs = require('fs'); const T = JSON.parse(fs.readFileSync(__dirname + '/targets.json', 'utf8'));
const files = process.argv.slice(2).filter(a => !a.startsWith('--')), asJson = process.argv.includes('--json');
const W = {}, N = {}, pair = {}, dist = {}, mv = {}; let n = 0, errs = 0, bad = 0, tmo = 0, crash = 0, ms = [], draws = 0; const errList = [];
for(const f of files) for(const l of fs.readFileSync(f, 'utf8').split('\n')){ if(!l.trim()) continue; const x = JSON.parse(l);
  if(x.crash){ crash++; continue; } n++;
  if(x.errs && x.errs.length){ errs++; if(errList.length < 8) errList.push(`${x.tA} vs ${x.tB}: ${x.errs[0].slice(0, 160)}`); }
  if(x.bad && x.bad.length){ bad++; if(errList.length < 8) errList.push(`${x.tA} vs ${x.tB}: ${x.bad[0]}`); }
  if(x.timeout) tmo++; ms.push(x.ms);
  for(const [t, o, side, m] of [[x.tA, x.tB, 'A', x.mvA], [x.tB, x.tA, 'B', x.mvB]]){
    N[t] = (N[t]||0) + 1; const w = x.winner===side ? 1 : x.winner==='D' ? 0.5 : 0; W[t] = (W[t]||0) + w;
    const k = t + '>' + o; pair[k] = pair[k] || [0, 0]; pair[k][0] += w; pair[k][1]++;
    (dist[t] = dist[t] || []).push(x.avgDist); mv[t] = mv[t] || {}; for(const s in (m||{})) mv[t][s] = (mv[t][s]||0) + m[s]; }
  if(x.winner==='D') draws++; }
const rows = Object.keys(T.targets).map(t => ({t, wr: N[t] ? 100*W[t]/N[t] : null, n: N[t]||0, target: T.targets[t]})).map(r => Object.assign(r, {gap: r.wr==null ? null : r.wr - r.target, ok: r.wr!=null && Math.abs(r.wr - r.target) <= T.band}));
const lop = Object.entries(pair).filter(([k, v]) => v[1] >= 8 && (v[0]/v[1] >= 0.9)).map(([k, v]) => `${k} ${v[0]}/${v[1]}`);
ms.sort((a, b) => a - b); const avgMs = ms.reduce((a, b) => a + b, 0)/Math.max(1, ms.length);
const top = {}; for(const t in mv){ const tot = Object.values(mv[t]).reduce((a, b) => a + b, 0) || 1; const e = Object.entries(mv[t]).sort((a, b) => b[1] - a[1])[0]; top[t] = [e[0], Math.round(100*e[1]/tot)]; }
const sum = {matches:n, crash, errMatches:errs, badMatches:bad, timeouts:tmo, draws, avgMatchSec: Math.round(avgMs/1000), medianSec: Math.round((ms[ms.length>>1]||0)/1000), outOfBand: rows.filter(r => !r.ok).map(r => r.t), min: Math.min(...rows.map(r => r.wr)), max: Math.max(...rows.map(r => r.wr)), lopsided: lop};
if(asJson){ console.log(JSON.stringify({sum, rows, top, errList})); process.exit(0); }
for(const r of rows) console.log(`${r.t.padEnd(10)} ${r.wr==null ? '  n/a' : r.wr.toFixed(1).padStart(5)}%  target ${r.target}  n=${String(r.n).padStart(3)}  dist ${Math.round((dist[r.t]||[0]).reduce((a,b)=>a+b,0)/Math.max(1,(dist[r.t]||[]).length))}  top ${top[r.t] ? top[r.t].join(' ') + '%' : ''} ${r.ok ? '' : '  <-- OUT'}`);
console.log(JSON.stringify(sum)); if(errList.length) console.log(errList.join('\n'));
