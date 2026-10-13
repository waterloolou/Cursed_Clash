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
