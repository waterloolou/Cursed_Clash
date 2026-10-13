# Bug agent log

Test tools (scratch, not committed): `fz_inpage.js` (scripted two-AI fight driver + invariant checker:
NaN/out-of-world/stuck state/CE/cooldowns/domain never ending/entity leaks), `allpairs.js` (19×19 pairs × classic + online rules,
rotating maps 0/1/2/4), plus targeted scripts listed per entry.

## Fixes

### 1. Yuji Black Blur / Black Flash lunge never ends against a terrain wall
- **Bug:** `_tickBlackBlur` phase 0 only ended the lunge after travelling `BB_LUNGE_DIST` or touching the world edge.
  Running into a terrain wall (`_moveTerrain` zeroes the move) left Yuji in `S.BLACKBLUR` forever — no input, no abilities
  (found by the all-pairs fuzz: "P1 stuck in blackblur", x stays 1058 against a wall on Sister School, bbTimer 12000+).
- **Fix:** `_tickBlackBlur`, lunge-cancel condition:
  `if(dist >= BB_LUNGE_DIST || this.x <= 10 || this.x >= W-PW-10)` →
  `if(dist >= BB_LUNGE_DIST || this.x <= 10 || this.x >= W-PW-10 || this.bbTimer > 600)` (normal lunge takes ~100 ms).

### 2. Yuki's Black Hole banks upward velocity on a fighter who is in a non-physics state → launched thousands of px off the map
- **Bug:** `_tickYukiHole` pulls with `d.vy = Math.min(d.vy, 0) + dy/dist*pull*0.8*k` every frame. While the victim is in a
  state that doesn't run `_phys` (e.g. Sukuna's Fuga, casts) `vy` keeps growing (measured −78 after Fuga) and on release the
  fighter rockets to y ≈ −7000, invisible for ~5 s (fuzz: Yuji→Sukuna vs Yuki, "P1 far above world y=−1551 vy=−52").
- **Fix:** `_tickYukiHole`: `d.vy = Math.max(-14, Math.min(d.vy, 0) + dy/(dist||1)*pull*0.8*k);` (−14 ≈ one jump, `JUMP_V` = −13.5).

### 3. Sukuna-in-Yuji's Dismantle dash didn't move when any terrain was in the way (most of the time on real maps)
- **Bug:** `_tickSukDash` carved only a 30 px capsule around the body's middle; fighters are 78 px tall, so head/feet cells
  stayed solid and `_moveTerrain` reverted the whole 40 px step every frame. The dash "ran" its full distance counter
  standing still (trace on Sister School: x stays 1070 while `sdDist` climbs to 1320).
- **Fix:** `_tickSukDash`: after the capsule, also
  `carveRect(Math.min(px, this.x), this.y + 0.51 - T_CELL/2, Math.abs(this.x - px) + PW, PH - 1.02 + T_CELL)` (clears exactly the
  cells the body overlaps along the swept path; floor cells under the feet are untouched).

### 4. Yuji's move list / HUD names / tips / wiki still described the old kit
- **Bug:** after the rework, `MOVE_INFO.yuji` (TAB move list + the ability-box names on the CE HUD), `CHAR_TIPS.yuji` (pause page 3)
  and the wiki section still said Piercing Blood (hold to charge), "3rd hit starts a Black Flash bar", Dismantle ultimate (55).
  None of that exists any more, so the HUD labelled ability 1 "PIERCING BLOOD".
- **Fix (text only):** rewrote `MOVE_INFO.yuji`, `CHAR_TIPS.yuji`, the wiki `<section data-p="yuji">` table rows and the wiki
  sidebar subtitle to the current moves (Divergent Fist ring → Black Flash, Divergent Combo 26, guaranteed Black Flash special,
  Enchain/Modulo ultimate, Manji Kick / The Zone). Numbers taken from the constants (`DIV_*`, `BB_*`, `YUJI_*`, `MANJI_*`, `ZONE_*`).

## Noticed (not fixed)

## Balance notes for the lead

## Final checks
