# Cursed Clash — quality gates

Set on Nov 16, 2026, before any of the work started. The game has to pass **all six gates on the same build** (VFX, section 6, was added on Nov 17).
Each gate is checked by an independent reviewer agent that did not write the code. A reviewer either approves or rejects with a
list of what failed; rejections get fixed and the gate is run again.

Every number below is measured with the scripts in [`tests/`](tests/) (see `tests/README.md`).
"Baseline" is the Oct 30 build (commit `c6a7d3a`), measured the same way.

---

## 1. Art

**Scope.** Stages, effects, HUD, menus and the drawn details on the stick fighters. Character sprite sheets, cursed-energy auras
and item sprites are ThEndNite's work: they are never edited here, and anything drawn here has to sit behind or beside them, not replace them.

**Guidelines**
- A fighter should be recognisable without reading the name tag.
- Text is always readable: dark backing behind light text, never text on top of other text.
- Stages have depth: something far, something near, something moving.
- Hits feel like hits: spark, number, shake scaled to the damage.
- One look across the whole game: the same two typefaces, the same gold / ink palette on every menu.

**Pass criteria**
| # | Criterion | Baseline |
|---|---|---|
| A1 | Every one of the 21 fighters has at least two drawn identifying features besides colour (hair, clothing, mask, weapon…), visible in fights and on the fighter-select tiles. Fighters with a sprite sheet count as passing. | 6 of 21 |
| A2 | No overlapping or clipped text in the HUD, menus, toasts or speech bubbles in the review screenshots at 1280×720, 960×540 and 1920×1080. | fails (name tag over the HP bar, stacked speech bubbles) |
| A3 | HUD and menu text contrast is at least 4.5 : 1 against what is behind it (sampled from screenshots). | not measured |
| A4 | Each of the 5 stages has at least 3 depth layers, at least one ambient animation, and a foreground or lighting pass. | 2 of 5 |
| A5 | Every damaging hit shows a spark and a damage number; hits of 15+ shake the screen; a KO gets a distinct finish effect. | partly |
| A6 | Menus (home, mode, stage, fighter select, pause, results, settings) share typefaces, palette and button style. | home differs |
| A7 | No visual defects in the review set: hard-edged debug rectangles, wrong draw order, flicker, unstyled default controls. | — |
| A8 | Low graphics mode keeps every gameplay-relevant visual (hitboxes' effects, telegraphs, HUD). | no low mode |
| A9 | ThEndNite's assets are byte-identical to the baseline and credited in-game and in `CREDITS.md`. | — |

---

## 2. Performance

**Guidelines**
- Slow school laptops are the target, so everything is measured on software rendering (no GPU) at 1280×720.
- Draw less, not smaller numbers of fighters: no gameplay may be removed for speed.
- Memory stays flat over a session.

**Pass criteria** (benchmark: `node tests/perf.js`, 11 CPU-vs-CPU scenarios, ultimates and domains firing, quiet machine)
| # | Criterion | Baseline |
|---|---|---|
| P1 | High graphics: average CPU time per frame ≤ **11.0 ms** in every scenario, and ≤ **8.5 ms** averaged over all scenarios. | worst 18.3 (27.6 with the training room), mean 12.5 |
| P2 | Low graphics: ≤ **6.0 ms** in every scenario, ≤ **4.5 ms** on average. | no low mode |
| P3 | High graphics: 99% of frames ≤ 25 ms in every scenario; no frame over 50 ms after the first three. | p99 up to 55; max 60 |
| P4 | Canvas memory ≤ 32 MB at any time; JS heap grows ≤ 15 MB over the whole benchmark. | 27.8 MB · 6.1 MB |
| P5 | The headless simulation runs at ≥ 40× real time (keeps the test suite fast). | 22× |
| P6 | Online: the host sends ≤ 75 KB/s in a busy fight, and building a snapshot takes ≤ 0.5 ms. | ~140 KB/s · 0.24 ms |
| P7 | `index.html` ≤ 3.5 MB; the page is interactive ≤ 2 s after load on the test machine. | 3.2 MB |
| P8 | Auto graphics switches to Low after sustained slow frames and says so on screen. | silent, effects only |

---

## 3. Quality

**Guidelines**
- No errors, no soft locks, no fighter leaving the map.
- What the wiki says is what the code does.
- Every check is a script in the repo, so it can be re-run after any future update.

**Pass criteria**
| # | Criterion | Baseline |
|---|---|---|
| Q1 | `tests/smoke.js`: page loads with no console errors; 21 CPU matches with no errors. | passes |
| Q2 | `tests/abilities.js`: every fighter uses every action under both rule sets with drawing on (588 runs): 0 errors, 0 non-finite positions, nobody stuck in a move 15 s later. | not run before |
| Q3 | A full round-robin (every pair, ≥ 4 rounds = 840 matches): 0 errors, 0 out-of-bounds, ≤ 1% time-outs. | 0 · 0 · 0.2% |
| Q4 | `tests/ui.js`: every menu path works by keyboard and by mouse (home → VS CPU → mode → stage → fighter → fight → result → rematch and back out; training; tutorial; settings; wiki; account). | not automated |
| Q5 | `tests/net.js`: host + joiner in two browsers, 5 matchups: both screens agree on HP, lives and phase; terrain identical; 0 errors; still true with 15% of messages dropped. | harness lost |
| Q6 | 30 randomly chosen numbers quoted in the wiki / move list match the constants in the code. | not checked |
| Q7 | `node tests/run-all.js` runs all of the above and exits 0; `tests/README.md` explains each script. | — |
| Q8 | The version label, README and `changes/` log describe this update, with revert notes. | — |

---

## 4. Balancing

**Guidelines**
- Special grades sit at the top, and it slopes down by grade (targets in `tests/targets.json`).
- Nobody is unbeatable and nobody is free.
- Numbers are only trusted with enough matches behind them: at 160 matches a win rate is only good to about ±8, so the
  final check uses 480 per fighter (±4.5).

**Pass criteria** (hard CPU vs hard CPU, all 5 stages, sides alternating)
| # | Criterion | Baseline (80 each) |
|---|---|---|
| B1 | On ≥ 480 matches per fighter (5,040 total) on the final build, every fighter is within **±6** of their target. | 11 of 21 outside ±5 |
| B2 | Every fighter wins between 34% and 66%. | 36–69% |
| B3 | Tier order holds: special-grade average > grade-1 average > the rest. | — |
| B4 | No matchup where one side wins ≥ 22 of 24 when the two fighters' targets are within 8 points of each other; for a wider tier gap, no more than 23 of 24 (no clean sweeps). *Scaled by tier on Nov 17 at the user's decision: with the requested 40–60 tier spread, a CPU 15 points stronger wins nearly every seeded game.* | — |
| B5 | Median match 60–150 s; ≤ 1% time-outs. | 106 s · 0.2% |
| B6 | Playstyles show up in the data: rangers, zoners and summoners stand further away on average than brawlers (≥ 30 px). | — |
| B7 | Difficulty ladder: Hard beats Normal ≥ 60%, Normal beats Easy ≥ 60% (same fighters on both sides). | not measured |
| B8 | The gate re-plays 40 random matches from the log and gets identical results (the data is real). | — |

---

## 5. New features

**Guidelines**
- A feature is finished or it is not shipped: reachable from the menus, explained in the wiki, covered by a test.
- Nothing new may change balance or break online play.

**Features in this update**
| # | Feature |
|---|---|
| F1 | **Graphics setting**: High / Low / Auto in Settings, remembered between visits. |
| F2 | **FPS + ping meter**: a toggle in Settings; shows frame rate, and online the ping and link type. |
| F3 | **Arcade mode** (VS CPU → Arcade): a ladder of 6 fights of rising difficulty ending in a boss, with a progress screen, a result screen and a saved best run. |
| F4 | **Match results screen**: damage dealt, hits landed, best combo, Black Flashes and match time for both players, online too. |
| F5 | **Playstyles in the game**: each fighter's playstyle shown on the fighter-select screen and in the wiki. |

**Pass criteria**
| # | Criterion |
|---|---|
| N1 | Each feature is reachable from the menus with keyboard and mouse, and has a way back out. |
| N2 | Each feature works vs CPU and in local 2-player; F2 and F4 also work online for the joiner. |
| N3 | Each feature has a wiki entry and a README line. |
| N4 | Each feature has an automated test in `tests/features.js`, and it passes. |
| N5 | With every feature at its default, CPU match results are identical to the same build with the features unused (no balance side effects). |
| N6 | Settings survive a page reload; a broken or missing saved setting falls back to the default. |

---

## 6. VFX (added Nov 17 at the user's request)

Added after the first review round, with its own specialist reviewer. The other five gates are unchanged; the game must now pass
all **six** on the same build. "Effect" means anything drawn for a move or a hit: wind-ups, projectiles, beams, trails, sparks,
rings, slashes, bursts, flashes, domain entrances. ThEndNite's auras and sprites are not touched (A9 still applies).

**Guidelines**
- **Crisp**: effects are drawn at the screen's resolution with clean edges, never as blurry stretched bitmaps or hard-edged boxes.
- **Flowing**: an effect has a start, a life and an end — it grows in, moves with what made it, and fades or scatters out; nothing pops.
- **Readable**: effects show what is happening (who hit whom, which way, how hard) and never hide the fighters or the HUD.
- **Identity**: each fighter's effects use their own colours, the same way every time.

**Pass criteria**
| # | Criterion |
|---|---|
| V1 | **Coverage**: every move of all 21 fighters (punch, both abilities, super, ultimate, Maximum Output versions) shows an effect when it starts and, if it can hit, an effect where it hits. Checked by instrumenting `tests/abilities.js`-style runs: 0 moves without a start effect, 0 hitting moves without an impact effect. |
| V2 | **Crisp**: on High at 1280×720 and 1920×1080, no move effect is drawn from a bitmap stretched more than 1.5× without smoothing, and none shows a hard rectangular edge that is not part of its design (reviewer screenshots, zoomed crops). |
| V3 | **No pops**: every effect that lasts longer than 120 ms fades or scales in and out (opacity or size changes over at least 3 frames at both ends). Checked frame by frame on a sample of at least 30 moves across at least 10 fighters. |
| V4 | **Direction and weight**: hit sparks fly away from the attacker (the mean particle direction points away from the attacker on ≥ 90% of hits); hits of 15+ damage add a heavier impact than light hits (bigger burst, ring or flash, and the screen shake already required by A5). |
| V5 | **Trails**: every projectile and beam that travels more than 150 px leaves a trail or motion streak behind it. |
| V6 | **Identity**: each fighter's move effects use colours from that fighter's palette (`charColor` family or their documented technique colour); reviewer check per fighter, 0 fighters with mismatched effects. |
| V7 | **Readable**: no move effect covers more than 60% of a fighter's body for longer than 0.5 s (domains, Rika and other summons excepted), and no effect is drawn over the HUD. |
| V8 | **Budget**: with the effect changes, the Performance gate (P1–P4) still passes, and Low graphics keeps every effect's shape (fewer particles allowed). |
