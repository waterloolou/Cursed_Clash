// Runs every check and prints one line each.   node run-all.js [--quick]
//   --quick: a short version (smoke, wiki numbers, features, menus, replay ×12, online ×2, perf --quick) for use after a small change.
//   The long balance run is separate: see README.md ("Balance").
const { spawnSync } = require('child_process'), path = require('path');
const quick = process.argv.includes('--quick');
const steps = [
  ['Q1 smoke',            'smoke.js', []],
  ['Q6 wiki numbers',     'wikinums.js', []],
  ['N  features',         'features.js', []],
  ['Q4 menus',            'ui.js', []],
  ['B8 replay',           'replay.js', [quick ? '12' : '40']],
  ['Q5 online',           'net.js', [quick ? '2' : '5']],
  ['Q5 online, 15% loss', 'net.js', [quick ? '2' : '5', '--loss=15']],
  ['P  performance High', 'perf.js', quick ? ['--quick', '--check'] : ['--check', '--runs=3']],
  ...(quick ? [] : [['Q2 every move', 'abilities.js', []], ['B7 difficulty ladder', 'ladder.js', []]]),
];
let bad = 0; const t0 = Date.now();
for(const [name, file, args] of steps){ const t = Date.now(); const r = spawnSync('node', [path.join(__dirname, file), ...args], {encoding:'utf8', timeout: 3600e3});
  const last = (r.stdout || '').trim().split('\n').pop() || (r.stderr || '').trim().split('\n').pop() || '';
  const ok = r.status===0; if(!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(22)} ${((Date.now() - t)/1000).toFixed(0).padStart(5)}s  ${last.slice(0, 150)}`); }
console.log(bad ? `\n${bad} CHECK(S) FAILED` : `\nALL CHECKS PASSED (${((Date.now() - t0)/60000).toFixed(1)} min)`); process.exit(bad ? 1 : 0);
