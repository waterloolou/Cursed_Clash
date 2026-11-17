# Tests

Everything here runs the real `index.html` in headless Chrome (Playwright). Nothing is mocked: the scripts press keys, click, and
read the game's own variables.

```
cd tests
npm install            # once: the local PeerJS server used by the online test
node run-all.js        # every check below except the long balance run
node run-all.js --quick   # short version
```
Set `GAME=/path/to/other.html` to test a different build. The pass limits are in [`../GATES.md`](../GATES.md).

| Script | Checks | Gate |
|---|---|---|
| `smoke.js` | The page loads with no console errors; every fighter plays a full CPU match; every stage is used. | Q1 |
| `abilities.js [fighters]` | Every fighter uses every action (punch, abilities, super, ultimate, Maximum Output, dash, block, item, feat) under both rule sets with drawing on: no errors, no broken positions, nobody stuck in a move 15 s later. 588 runs. | Q2 |
| `tourney.js OUT.jsonl [rounds] [shard] [shards]` | CPU round robin, every pair, results appended one JSON line per match. `analyze.js` reads them. | Q3, B1–B6 |
| `analyze.js files… [--json]` | Win rates against `targets.json`, tier order, lopsided matchups, match length, time-outs, spacing per playstyle, errors, out-of-bounds. | Q3, B1–B6 |
| `ui.js` | Every menu path by keyboard and by mouse: home, VS CPU, mode, stage, fighter select, fight, pause, results, rematch, back out; training; tutorial; local 2-player; settings; controls; wiki; account. 57 checks. | Q4 |
| `net.js [matchups] [--loss=15]` | A host and a joiner in two browsers on a local PeerJS server: both screens must agree on HP, lives, phase and terrain, with and without dropped messages. | Q5 |
| `netsize.js` | Host upload in KB/s and the time to build a snapshot. | P6 |
| `wikinums.js [n]` | Damage numbers quoted in the move list exist as damage constants in the code. | Q6 |
| `features.js` | Graphics setting, FPS meter, Arcade ladder, match results, playstyle chips: reachable, saved, survive a reload and a broken save. | N1–N6 |
| `replay.js [n]` | The same matchup, stage and seed give the same result in a fresh page and in both graphics modes. | B8, N5 |
| `ladder.js [n]` | Hard beats Normal and Normal beats Easy at least 60% of the time. | B7 |
| `perf.js [--quick] [--check]` | CPU time per frame on software rendering at 1280×720, p99, slowest frame, canvas memory, heap growth. `QUERY='?gfx=low'` measures Low graphics. | P1–P4 |
| `shots.js OUTDIR [--all]` | Screenshots for visual review: menus, every stage, and with `--all` every fighter's every move. `VP=1920x1080` changes the size. | Art |
| `one.js A B [map] [seed]` | One CPU match, full result. For debugging. | — |

## Balance
```
node tourney.js out_s0.jsonl 24 0 2 &     # 24 rounds = 5,040 matches = 480 per fighter, split over two processes
node tourney.js out_s1.jsonl 24 1 2 &
wait; node analyze.js out_s0.jsonl out_s1.jsonl
```
`retarget.js` proposes new damage multipliers from one or more of these runs (it pools every run it is given, so one unlucky
160-match sample cannot swing a fighter). At 160 matches a win rate is only good to about ±4 points; at 480, about ±2.3.

## How the arena stays fair
`arena.js` runs matches with a seeded random generator and a virtual clock, with sound switched off, so a match can be replayed
exactly. Both sides use the game's own CPU (`CPU_BOT`) with the fighter's playstyle; `lvlA` / `lvlB` set a level per side.
