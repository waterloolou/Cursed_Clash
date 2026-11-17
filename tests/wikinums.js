// Q6 — the damage numbers quoted in the move list must exist as damage constants in the code (a stale number in the text after a
// balance change is the usual way the wiki goes wrong).   node wikinums.js [how many to sample, default 30]
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(process.env.GAME || path.join(__dirname, '..', 'index.html'), 'utf8');
const N = +process.argv[2] || 30;
// every numeric constant whose name says it is damage
const dmg = new Map(); for(const m of src.matchAll(/\b([A-Z][A-Z0-9_]*(?:DMG|DAMAGE)[A-Z0-9_]*)\s*=\s*(-?\d+(?:\.\d+)?)\b/g)){ const v = +m[2]; if(!dmg.has(v)) dmg.set(v, []); dmg.get(v).push(m[1]); }
// the move list: MOVE_INFO = { fighter: [[slot, name, text], …], … }
const i0 = src.indexOf('const MOVE_INFO = {'), i1 = src.indexOf('\n};', i0); const block = src.slice(i0, i1);
const quoted = [];
for(const line of block.split('\n')){ const fm = /^\s*([a-z]+)\s*:/.exec(line); if(fm) quoted.cur = fm[1];
  for(const m of line.matchAll(/\['(\w+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\]/g)) for(const n of m[3].matchAll(/\((\d+(?:\.\d+)?)(?:\)|,| dmg| damage)/g)) quoted.push({fighter: quoted.cur, move: m[2], n: +n[1]}); }
let x = 20261116; const rnd = k => (x = (x*1103515245 + 12345) & 0x7fffffff) % k;
const pool = quoted.slice(), sample = []; while(sample.length < N && pool.length) sample.push(pool.splice(rnd(pool.length), 1)[0]);
let bad = 0; for(const q of sample){ const ok = dmg.has(q.n); if(!ok){ bad++; console.log(`MISMATCH ${q.fighter} · ${q.move}: the text says ${q.n}, no damage constant has that value`); } }
console.log(`${quoted.length} damage numbers quoted in the move list, ${sample.length} sampled, ${dmg.size} distinct damage constants in the code`);
console.log(bad ? `WIKI NUMBERS FAILED: ${bad}` : 'WIKI NUMBERS OK'); process.exit(bad ? 1 : 0);
