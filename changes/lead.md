# Lead change log — Oct 13 batch

Commit `3b72130` (everything below), then the three agent branches were cherry-picked on top
(`changes/bugs.md`, `changes/performance.md`, `changes/quality.md`). Every entry is revertable on its own:
`git revert <commit>` for agent commits; for the lead commit, use the "Revert" notes below.

## Yuji rework (`index.html`)
- **Constants**: new block after `BB_*`: `YUJI_DIV_CD 5000, DIV_REACH 80, DIV_DMG 6, DIV_BF_DMG 18, DIV_MISS_DMG 5, DIV_RING_MS 900,
  DIV_WIN 85 (ms window), DIV_WIN_ZONE 170`, `YUJI_CM_GAIN 1.25`, `MANJI_* `, `ZONE_*`, `YUJI_SUK_MS / YUJI_MOD_MS 15000`,
  `YUJI_ENCHAIN 75`, `MODULO_DMG 1.35, MODULO_SPD 1.2`, `SUKDASH_SPD 40, SUKDASH_DMG 18, SUKDASH_CD 6000`.
  `BB_LUNGE_DIST` raised to 240 (Divergent Combo is now his mobility dash), `BB_DMG_HIT 7`, `BB_DMG_KICK 12`.
- **Ability 1 — Divergent Fist** (`_startDivFist`, `_tickDivFist`, `_divResolve`, state `S.YUJIDIV`): a punch (6). On a hit a ring
  closes on the target; press ability 1 when it meets the inner ring → Black Flash (18, big launch), miss → 5-damage shove.
  Replaces Piercing Blood. The old punch-3 Black Flash bar (`_startBlackFlashMinigame`) is no longer called.
- **Ability 2 — Divergent Combo**: the old Black Blur, now a 240px lunge + two punches + kick (26), with the spark timing for a BF kick.
- **Special — Black Flash**: a lunge that is a guaranteed Black Flash on contact (28). Charge unchanged (40).
- **Combo meter** (`yujiCM`, 0–100): only normal punches raise it (`yujiCmAdd`, 1.25 per damage); it never goes down on its own.
  Drawn as a vertical bar on Yuji's side of the screen.
- **Maximum Output** (`OL_VARS.yuji`): 1 = **Manji Kick** counter stance (0.45s + 0.9s × meter; uses 10% meter; any hit in it is
  nullified and answered with a 10 + 12×meter launching kick — `manjiCounter`), 2 = **The Zone** (uses 20% meter; 5s + 10s × meter;
  `zoneMul` = +15% to +35% damage, cooldowns tick 1.75× faster, Divergent Fist window doubles).
- **Ultimate** (100 damage dealt): meter < 75% → speech bubble "ENCHAIN" and **Sukuna takes over** for 15s (`yujiSukStart` /
  `yujiSukEnd`: type becomes `sukuna` with `baseType='yuji'`). Sukuna-in-Yuji: Dismantle = a very fast dash (`_tickSukDash`) at least
  half the map, deleting terrain it touches and hitting fighters it passes with Dismantle (18); special = Fuga, aimable, faster and
  stronger than base Sukuna's (`yb` flag in Fuga); Cleave as normal; no domain. Meter ≥ 75% → **Modulo** for 15s: +35% damage,
  +20% speed, cooldowns tick 2× faster, every Divergent Fist that lands is a Black Flash.
- **Revert**: `git show 3b72130` — the Yuji parts are everything mentioning `yujiCM`, `DIV_`, `MANJI_`, `ZONE_`, `YUJI_SUK`, `MODULO`,
  `SUKDASH`, `S.YUJIDIV`, `S.YUJIMANJI`.

## Aspect ratio
- New `viewFit(cw, ch)` / `cssToView(e)`: the game is drawn at 960×520 and scaled **uniformly** (letterboxed) to any screen, instead
  of being stretched to the window. All mouse input (aiming, Hanami's root, menus) goes through `cssToView`.
- **Revert**: restore the old canvas resize + `e.offsetX / clientWidth` mouse maths from `06900b8`.

## Geto
- `GETO_CENT_SPD 6.5 → 4.2` (slower centipedes), `GETO_CENT_LIFE 3200 → 4600` so they still cross the screen.

## New item: Kamutoke
- `KAMU_N 3, KAMU_R 560, KAMU_WARN 380, KAMU_DMG 16, KAMU_STUN 800, KAMU_CD 900`. A lightning rod: each use marks the nearest foe
  within 560px with a dashed warning, then lightning strikes there (16 + 0.8s stun). 3 strikes, then it's gone.
  `kamuBolts` (synced), `tickKamu`, `drawKamu`, item icon. Added to the item pool.

## New map: Sendai Colony
- `SND = {W:2400, H:1100, GND:1020}`, `buildSendai`, `paintSendai`, ambient in `drawMapAmbient` (map 4). Station with a run-through
  concourse and ledges, the elevated pedestrian deck with stairs, a zelkova avenue, and a torn-sky tower stump with floating debris.
  `mapChoices()` includes it in stage select and training.

## Knockback direction fixes
- Rainbow Dragon and Yuki's black-hole burst passed a signed `rag` x-velocity *and* a `dir`, so the launch was flipped twice and went
  the wrong way on one side. Now `rag` x is positive and `dir` carries the direction (like every other move).

## After the agents (this session)
- Cherry-picked all agent commits onto `main` (the agents' "sync baseline" commits were skipped: identical to `3b72130`).
  Conflict in Yuji's wiki row / tips / move list (both the bug and quality agents rewrote them): kept the quality agent's text.

## Final pass (lead, after merging)
- **Kamutoke toned down** (quality agent's balance note: 3 × 16 + 0.8s stun with near-chaining stuns was the strongest item):
  `KAMU_DMG 16 → 12`, `KAMU_STUN 800 → 550`, `KAMU_CD 900 → 1400`. Revert: restore those three values on the `const KAMU_N` line.
- Wiki: added a **Kamutoke** row to the items table and a **Sendai** entry on the maps page (text only).
- README: new "Latest" section.

## Testing done on the merged build
- All-pairs fuzz: every fighter vs every fighter (19 × 19 = 361 pairs) under **both** rule sets (one keyboard and online combat),
  maps rotating through Shibuya / Sister School / Shinjuku / Sendai, items on, 900 scripted frames each with two AIs mashing every
  move, Maximum Output, ultimates, block, dash, evasive. Invariants: no JS errors, nobody NaN / out of the world / stuck in a state,
  domains end, CE and cooldowns sane, no entity leaks. **722 runs, 0 issues.**
- Two devices: two browser pages linked as host + guest through the relay code path (`?relay=1`, broker simulated locally), each
  fighter played once on each side over a 9s random-input fight. Guest stayed in sync (snapshot age < 0.7s, same fighters/phase,
  positions agree); one apparent desync (Mei Mei vs Mei Mei, Ui Ui teleport between the two reads) did not reproduce. No errors on
  either page.
- `mvall` (every fighter walks and jumps, both rule sets) and `stress` (classic + online seeds): pass.
