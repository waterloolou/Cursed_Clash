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

## Noticed (not fixed)

## Balance notes for the lead

## Final checks
