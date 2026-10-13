# Quality agent log — visuals, maps, character functionality

Base: commit `a38e8a4` = the lead's uncommitted working copy (`/home/claude/cursed_clash/index.html`, 18897 lines) copied into this worktree unchanged, because the worktree branch started from the older `06900b8` without the Yuji rework / Sendai / Kamutoke. Every entry below is relative to that base.

Screenshots: `before/` and `after/` folders in `/tmp/claude-0/-home-claude-cursed-clash/fe3ac253-72d5-5c1c-8fd0-50fac4b1bef1/scratchpad/q/`.

## Changes

### 1. Sendai: hard-edged blue rectangle in the sky
- **Why**: `drawMapAmbient` (map 4) pulsed the torn-sky area with `ctx.fillRect(1500, 0, 600, 600)` in flat translucent blue — on screen it was a clearly visible lighter rectangle with straight edges around the sky fracture (before/map4_x97.png, map4_wide.png).
- **Where**: `drawMapAmbient`, `i===4` branch.
- **Old**: `ctx.fillStyle = \`rgba(120,190,255,${0.03+0.02*Math.sin(t*0.0015)})\`; ctx.fillRect(1500, 0, 600, 600);`
- **New**: a radial gradient centred on the fracture (1750, 260), radius 320, alpha `0.07+0.04*sin` → 0, filled over `1430,-60,640,640`. Same pulse, no edges.

### 2. Speech bubbles: light text colours were unreadable on the white bubble
- **Why**: every `addSpeech` bubble is white with the text in the given colour. Many calls pass light colours (`'#ffd36a'` ZONED IN / MODULO, `'#ffb070'` MANJI KICK, `'#c9a0ff'` DISTORTED KILLING, `'#9fd0b0'` SWALLOWED, Naoya's pale labels…) — they were practically invisible (before/yz_sheet.png, sheet_naoya_ol_1.png shows an "empty" white bubble, sheet_geto_ol_1 "MIRROR CURSE").
- **Where**: new helper `bubbleLight(c)` just above `addSpeech`; speech drawing loop in `drawItems()` (`for(const s of speechFx)`).
- **Old**: `ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.strokeStyle='#111';`
- **New**: `const dk = s.col!=='#fff' && bubbleLight(s.col);` → `fillStyle = dk ? 'rgba(18,16,26,0.94)' : <old white>`, `strokeStyle = dk ? s.col : '#111'`. `bubbleLight` parses `#rgb/#rrggbb/rgb()` and returns luma > 150 (cached). Dark colours (red, black, the default `#fff`→`#111` text) keep the white bubble.

### 3. HUD readability on bright maps (scrim, evasive label, item label)
- **Why**: on Sister School and Shinjuku the HUD panels are only 55–60% black, so dimmed labels (`FUGA [3]` `#555`, `DOMAIN 0%` `#885533`, Gojo's domain text, disabled ability names) and the held-item line (`PLAYFUL CLOUD` red on light grey) were unreadable (before/hudcmp.png). The `EVASIVE READY [..]` label sat on the top edge of the ability boxes.
- **Where / old → new**:
  - `drawHUDOverlay()` first lines: added a cached vertical gradient scrim `fillRect(0,0,W,150)`: `rgba(8,8,14,0.6)` → `0.36` at 75% → `0` (no hard edges, ~invisible on the dark maps).
  - `drawCeHud()` evasive label: font `8px` → `7px`, `textBaseline='middle'` at `ey+2.5` (was alphabetic at `ey+5`), baseline reset after.
  - `Player.drawHUD()` held item: dark plate `rgba(8,8,14,0.6)` behind the `NAME  12s` text (text/colour unchanged).

### 4. Stage select: long stage names spilled out of their card; char select: stat labels overlapped their bars
- **Why**: "SISTER SCHOOL EXCHANGE" at 11px is wider than the 150px card (before/ui_map4.png). On the fighter panels the `SPEED / JUMP / HEALTH` labels were drawn at `ry+5`, touching the 5px bars right above them (before/charpanels_0.png).
- **Where**: `drawMapSelect()` card label; `drawCharSelect()` → `stat()` helper.
- **Old → new**: card label font fixed `700 11px` → starts at 11px and shrinks (min 8px) until it fits `cw-8`. Stat label baseline `ry+5` → `ry+8`.

### 5. Yuji: move names / descriptions still described the old kit
- **Why**: after the rework the char-select panel, the TAB move list, the in-fight tips and the wiki still said ability 1 = "Piercing Blood (hold to charge)", punch 3 = Black Flash bar, ult = "Dismantle (55)". None of that exists any more (`_startBlackFlashMinigame` is never called; ab1 is `_startDivFist`; ult is Enchain/Modulo) — players would press 1 expecting a beam (before/charpanels_0.png).
- **Where** (text only, no logic):
  - `MOVE_INFO.yuji` (all five rows): atk "Normal punches fill his combo meter", ab1 "Divergent Fist", ab2 "Divergent Combo … (26) … Black Flash kick", ab3 "guaranteed Black Flash (28)", ult "Enchain / Modulo".
  - `CHAR_TIPS.yuji`: three new tips (Divergent Fist ring, combo meter, Enchain vs Modulo).
  - Wiki home grid link `<a data-p="yuji">`: "Piercing Blood · …" → "Divergent Fist · Divergent Combo · Black Flash".
  - Wiki `<section data-p="yuji">`: table rewritten (Attack/combo meter, Q Divergent Fist, E Divergent Combo, R Black Flash, F Enchain/Modulo, new Max Output row, Movement), numbers taken from the constants (`DIV_*`, `BB_*`, `YUJI_BF_DMG`, `MANJI_*`, `ZONE_*`, `YUJI_SUK_MS`, `MODULO_*`).

### 6. HUD stacking under each fighter's panel (item line / notices / HITS counter / Yuji combo-meter label)
- **Why**: below each HUD four things were drawn at the same height: the held-item line (`iy = y+bh+138` → 174), the notice feed (`160 + i*13`), the online combo counter (`N HITS` at `y+bh+142` → 178) and Yuji's rotated "COMBO" label beside his meter (x≈21, right where those texts start). With an item + a couple of hits + a notice they were drawn on top of each other (before/sheet_yuji_ol_1.png "3 HITS" over the meter; feed over item).
- **Where / old → new**:
  - new helper `hudItemOff(pl)` (above `drawEffects`) = `(item ? 26 : 0) + (shadowItem ? 18 : 0)`.
  - `drawEffects()` notice feed: base y `160` → `160 + hudItemOff(pl)`.
  - `drawOlHud()` combo counter: `y+bh+142` → `y+bh+142 + hudItemOff(pl) + hudFeed[..].length*13` (DAMAGE line keeps its +14 offset).
  - Yuji HUD combo meter label: rotated "COMBO" beside the bar → 7px "COMBO" under the `%` label (`my+mh+19`, left/right aligned to the screen edge).

### 7. Yuji: The Zone and Modulo had no on-body tell
- **Why**: both are 5–15s power-up states (damage, speed, Black Flash window) but nothing on Yuji showed them once Maximum Output was toggled off — only a small chip under the HUD (before/yz_sheet.png: `zone2`, `mod2` look like plain idle Yuji). The opponent can't see them at all.
- **Where**: `drawOlBody(pl)`, new block right before `if(!olOn()) return;` (so it shows in both rule sets).
- **New**: `zonedT>0` → four short gold streaks (`#ffd36a`) rising past his body; `moduloT>0` → a pulsing gold ellipse at his feet + five small orbiting sparks. Pure drawing, a handful of strokes per frame.

### 8. Sendai: zelkova trunks were solid walls — the avenue was blocked and spawn 2 trapped low jumpers
- **Why (measured)**: `buildSendai` made the three tree trunks with solid `MAT_WOOD` 12px wide and 170 / 200 / 160px tall; jump height is ~175px (Naoya 90% ≈ 158px). Simulated with held keys (`sendai2.js`): Gojo walking/jumping from spawn 2 (x 1640) to the right stopped at x 1688 forever (trunk 1720 is 200px), from x 1800 to the left stopped at 1729; **Naoya spawned at 1640 could not leave the 150px pocket between trunks 1560 and 1720 in either direction**. Only Todo (106% jump) got over.
- **Where**: `buildSendai()`, the `tree` helper.
- **Old**: `terFill(MAT_WOOD, x-6, G-h, 12, h)` → **New**: `terFill(MAT_BEAM, x-6, G-h, 12, h)` (one-way trunk, the same material the Sister School cedar trunks use; canopies stay `MAT_LEAF`, drawn look stays brown). Comment on its own line above the helper.
- **After**: all three test fighters cross the avenue both ways (Gojo 1640→2362 and 1800→352, Naoya 1640→42 and →2362). Re-checked on Sendai: west stairs walkable onto the deck (x 250 → 425, +150), east stairs walkable from the right, station ledges → roof (+360) reachable, deck shelters + sign gantry reachable, tower ledges → top (+517) reachable, lobby walk-out works, drop-and-escape scan every 30px finds no trap, both spawns clear and on the floor.

### 9. Kamutoke: the lightning strike read as a thin pale line
- **Why**: the strike (320ms) was two strokes (7px 70% yellow + 3px white) with nothing at the impact point; frozen at t=400ms it's barely visible against the Sendai night (before/kamuT_sheet.png). It's the new item's whole payoff.
- **Where**: `drawKamu()`, the `else` (strike) branch only. Hit logic / timings untouched.
- **New**: same jagged path (`_hh` points, now built once into `pts`), drawn as 16px glow `rgba(255,214,60,0.3)` + 7px body + 2.6px white core; short forks every 3rd point; a radial impact flash (r 95) at the ground point; `shadowBlur` 0 in LITE mode. All of it fades with the existing `a`.

### 10. Match-end screen named the wrong rematch key for player 2
- **Why**: one-keyboard match end said "Press F or ; for a rematch", but P2's confirm keys are `Slash` / `Enter` (`readLocalInput(BINDS_L2, 1, ['Slash','Enter'], …)`; char select already says "/ TO LOCK IN"). `;` is P2's ultimate.
- **Where**: `drawMatchEnd` text line (`'Press F or ; for a rematch'`).
- **Old → new**: `'Press F or ; for a rematch'` → `'Press F or / for a rematch'`.

### 11. Shibuya: black bars left/right when the camera zooms all the way out
- **Why**: Shibuya (2000×1150) is taller than the view's aspect, so at the minimum zoom the visible world (≈2123px wide) is wider than the map; `drawMapBG` only extended the sky (top) and ground (bottom), leaving ~60px black strips on both sides (before/mapsheet_0.png, `wide`).
- **Where**: `drawMapBG()`, after the two edge fills.
- **New**: only when the camera actually sees past a side (`cam.x < 0 || cam.x + VW/cam.z > W`): `drawImage(bgc, 0,0,1,H, -3000,0,3000,H)` and the same for the right column — the edge column is stretched outward, so the bars become a seamless continuation. Zero cost on the other maps.

### 12. Yuji's Sukuna takeover showed a domain bar that can't be used
- **Why**: during Enchain (`type='sukuna', baseType='yuji'`) the Sukuna HUD kept drawing "DOMAIN 12%" / "MALEVOLENT SHRINE [Q]", but `domEdge` is forced off in that body — pressing Q does nothing. Confusing, and the 15s takeover timer was only a tiny chip.
- **Where**: `Player.drawHUD`, Sukuna block, "Domain charge bar" section: wrapped the old bar in `else { … }` and added a `baseType==='yuji'` branch before it.
- **New**: red bar = `sukT / YUJI_SUK_MS`, text `SUKUNA IN CONTROL 15s · NO DOMAIN`. Normal Sukuna unchanged.
