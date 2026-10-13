# Performance agent — change log

Branch: `worktree-agent-a8e39bb99075b9ab1`. First commit syncs the worktree to the lead's current working copy
(`/home/claude/cursed_clash/index.html`, with Yuji rework / Sendai / Kamutoke) because the worktree was created from the
older HEAD; every later commit is one perf change and can be reverted on its own.

## How it was measured
- Harness (scratch, not in repo): `perf.js` drives the real `loopFrame()` by hand with synthetic 16.67 ms timestamps
  inside Playwright Chromium, forces the canvas to rasterise each frame (`getImageData(0,0,1,1)`), and reads the
  renderer main thread's **CPU time** from `/proc/<pid>/schedstat` (the 2-core sandbox was shared with other agents'
  stress runs, so wall-clock times were 2–6× noisy; CPU time is not affected by that). Chromium runs with
  `--disable-gpu --disable-accelerated-2d-canvas` = software canvas = the worst case (Chromebooks / blocklisted GPUs).
  `AB=1` interleaves the untouched baseline and the current file in two browsers so both see the same machine load.
- CDP `Emulation.setCPUThrottlingRate` 4×/6× for the weak-laptop numbers, CDP `Profiler` for hotspots,
  stub-out ablation (`STUB=fn`) to find what the raster time is spent on.
- Scenarios: idle fight, all 5 maps, char select, home, every character mashing every ability with full meters
  (`spam_<type>`), every domain (`dom_<type>`), long matches, online host snapshot.

## Changes

### 1. Incremental terrain repaint — `rebuildTerrainCanvas()` (+ new `_terCell()`, `_terDrawn`, `_terDrawnKey`)
- **Why**: `terCanvas` was cleared and every cell (59k–81k cells, 6–11k filled) repainted with a template-string colour
  + 2–6 `fillRect`s **every time any single cell broke or regrew** (`terDirty`). In a fight that is most hits.
  Measured (software canvas, 1×, one 6-cell break): Shibuya 22–31 ms, Sister School 23–34 ms, Shinjuku 16–24 ms,
  Sendai 9–14 ms per repaint (max 40–110 ms) — a visible hitch per hit, ×4–6 on a Chromebook.
- **What**: keep a copy of the cells last painted (`_terDrawn`); on `terDirty`, diff `terCur` against it and repaint only
  changed cells and their 4 neighbours (their edge shading depends on them): `clearRect` the 6×6 cell + same drawing
  code. More than 3000 changed cells, a map change or a canvas resize → full repaint as before.
  The old loop body is unchanged, just moved into `_terCell(g, r, c)` (`continue` → `return`).
- **Result**: 0.3–0.4 ms median per break (max 1–8 ms) on every map. Output is pixel-identical to a full repaint
  (checked with `getImageData` diff = 0 on all 5 maps after 12 rounds of breaks).
- **Revert**: restore the old `rebuildTerrainCanvas` (single function with the loop, ending in `terDirty = false;`).
