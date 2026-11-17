# Nov 16 — quality gates update (v1.9)

Worked to the written specifications in [`GATES.md`](../GATES.md): five categories (Art, Performance, Quality, Balancing, New
features), each with pass criteria, each reviewed by an independent reviewer. Every check is a script in [`tests/`](../tests/README.md).
Branch `gates`; merged into `main` only once all five reviewers approved the same build.

Each entry: what changed → how to revert.

## New features
| # | Feature | Revert |
|---|---|---|
| F1 | **Graphics setting** (Settings → GRAPHICS: Auto / High / Low). Low renders at 960×540, no glow, half the particles. Auto drops to Low after ~2.5 s of slow frames and says so. Saved in `localStorage` `cc_gfx`; `?gfx=low` in the URL forces it. | Remove `GFX`, `gfxSave/gfxApply/gfxSet`, the `#gfxBtn` button; restore `LITE` as a constant. |
| F2 | **FPS + ping meter** (Settings → FPS METER). | Remove `meterText`, `drawMeter`, `#fpsBtn`. |
| F3 | **Arcade Ladder** (VS CPU → ARCADE LADDER): six CPU opponents in a row (Easy ×2, Normal ×2, Hard ×2), the last a special-grade boss with an extra life; best stage, clears and best time saved in `cc_arcade`. | Remove the `ARC…` block (`arcStart` … `drawArcade`), `#btnArcade`, the `arcade` phase lines in `loopFrame`. |
| F4 | **Match results screen**: damage dealt, hits, best combo, Black Flashes, match time and stage for both fighters; the joiner gets the same numbers online. | Restore the old `drawMatchEnd`; remove `MST`, `mstTick`, `mstEvt`, `NET_G.mst`. |
| F5 | **Playstyles shown**: a chip on the fighter-select panel, a Playstyles wiki page, a line on every fighter's wiki page. | Remove `PLAYSTYLE_COL/DESC`, the chip block in `drawCharSelect`, the wiki generator lines. |
| — | **Mouse on the canvas menus**: point to select, left click to confirm, right click to go back. | Remove `mouseV`, `menuMouseStep`, `menuHover` and the three `menuHover(…)` blocks. |

## Art
| Change | Revert |
|---|---|
| **Fighter looks**: hair, face marks and outfits for 14 stick fighters (`LOOKS` table, drawn from `_stick`). ThEndNite's sprites and auras are untouched. | Delete `LOOKS` / `drawLook` and the one `drawLook(…)` call in `_stick`. |
| Fighter-select tiles show the whole head (bust offset 0.30 → 0.42). | Put 0.3 back in `csDrawFighter`. |
| **HP bars** green → amber → red (were grey), names in white with a dark outline; the account name sits above the bar instead of on top of the health fill. | Restore the old `col` line and the two `fillText` lines in `drawHUD`. |
| **Speech bubbles** no longer overlap: a bubble that would cover another is pushed above it. | Remove the `_placed` lines in the bubble loop. |
| **Stage lighting** on Shibuya, Sister School, Shinjuku and Sendai (the theater already had it): painted once into a quarter-size layer. High graphics only. | Remove `FORE_PAINT`, `drawStageLight`; `drawMapFore` back to the theater only. |
| **Hit feedback safety net** (`hitFxNet`): any HP loss without a number or spark gets one; 15+ damage in one tick shakes the screen. **KO finish** (`koFinish`): white flash, two shock rings, burst. | Remove both functions and their two call sites in `simFight`. |
| Home menu items use Rajdhani like every other menu (the logo stays in Cinzel). | `.hm-it` font back to `700 27px 'Cinzel',serif; letter-spacing:2px`. |

## Performance
| Change | Result | Revert |
|---|---|---|
| Background and terrain layers drawn without bilinear filtering. | About half of a frame's cost on software rendering. | Remove the two `imageSmoothingEnabled = false` lines in `drawMapBG` / terrain draw. |
| Cooldown / charge field names cached per fighter (`plKeys`). | Headless simulation 22× → ~54× real time. | Use `Object.keys(pl)` again in `tickStatus`, `_cePre`, the cooldown-rate loop. |
| Theater lighting cached in a quarter-size layer. | Theater was the slowest stage; now in line with the rest. | Restore the three per-frame gradients in `drawTheaterLight`. |
| Domain backdrops drawn through a layer (Low: every 4th frame; High: only Mahito's domain). | hanami vs mahito 15.2 → ~5 ms. | `drawDomainScene` back inline. |
| Stage-select previews 960 → 640 px wide. | Less canvas memory. | `MAP_PREV_W = 960`. |
| **Online upload**: per-field array deltas, long arrays every other snapshot, host-only bookkeeping (`_kc`, `_cdLast`) left out. | 58–254 → 24–61 KB/s. | Restore whole-array sync in `netSnapshot` / `netApply`. |

## Bugs fixed (found by the new tests)
1. **Hanami's Rampage roots could stop hitting after a rematch** (`hanaRootHit` was never cleared). Fix: cleared in `terrainReset`.
2. **Joiner's own fighter drifted during moves** online (prediction kept running in states it cannot predict). Fix: `netReconcile` snaps to the host's values there.
3. **Speech bubbles doubled on the joiner** (replayed effects appended to arrays the host had already sent). Fix: synced arrays truncated back after replay.
4. **Graphics settings could change a fight's dice** (particles shared the game's random generator). Fix: particles use their own (`fxRnd`).
5. **M on the pause screen missed quick taps** and also toggled the music. Fix: latched on key-down; no music toggle while paused.
6. **ENTER on a home button also confirmed the next screen** (VS CPU → Normal skipped the mode screen). Fix: a confirm press is dropped on the frame a screen opens.
7. Mechamaru's Drill Drive damage was an unnamed `25` in the code. Now `DRILL_DMG`. No gameplay change.
Revert any of these by undoing the named line; none changes a move's numbers.

## Balancing
Damage multipliers (`BAL.out`) re-tuned on the fixed build with the pooled method (`tests/retarget.js`), five passes of 1,680
matches, then verified with 5,040 matches (480 per fighter). Old → new:

| Fighter | Oct 30 | Nov 16 | | Fighter | Oct 30 | Nov 16 |
|---|---|---|---|---|---|---|
| Choso | 1.184 | 1.228 | | Megumi | 0.827 | 0.836 |
| Dagon | 1.04 | 1.04 | | Mei Mei | 0.962 | 0.994 |
| Geto | 0.831 | 0.80 | | Naoya | 1.02 | 1.03 |
| Gojo | 1.259 | 1.308 | | Ryu | 0.941 | 0.941 |
| Hakari | 0.765 | 0.733 | | Sukuna | 1.042 | 1.042 |
| Hanami | 1.066 | 0.876 | | Takaba | 1.106 | 1.153 |
| Higuruma | 1.323 | 1.336 | | Todo | 0.907 | 0.926 |
| Jogo | 1.182 | 1.182 | | Toji | 0.869 | 0.865 |
| Mahito | 0.844 | 0.936 | | Yuji | 1.579 | 1.672 |
| Mechamaru | 1.179 | 1.155 | | Yuki | 1.485 | 1.552 |
| | | | | Yuta | 1.15 | 1.17 |

Hanami's large drop is the Rampage fix: her roots now always hit, so she needed less help. The wiki now shows each fighter's
multiplier on their page. Revert: paste the Oct 30 column back into `BAL.out`.

## Tests added
`tests/`: smoke, abilities, tourney + analyze + retarget, ui, net, netsize, wikinums, features, replay, ladder, perf, shots, run-all.
See [`tests/README.md`](../tests/README.md).
