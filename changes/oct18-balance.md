# Oct 18 — balance pass (hard-CPU tuned)

**Status: local branch `balance-oct18`, not pushed.** Built from `2c6bd14`.

Seven rounds of "change → 800/1,600-match hard-CPU tournament → adjust" until every fighter won 40–60% of their matches.
Rules for every tournament: hard CPU vs hard CPU, online rules, 2 lives, 90s, maps rotating Shibuya / Sister School / Shinjuku / Sendai, mirrors excluded.

## Result

| Fighter | Before | After (pass 7, 1,520 matches) |
|---|---|---|
| Choso | 59% | 58% |
| Sukuna | 67% | 54% |
| Geto | 59% | 54% |
| Hanami | 53% | 53% |
| Mechamaru | 24% | 52% |
| Mahito | 97% | 51% |
| Takaba | 39% | 51% |
| Hakari | 67% | 51% |
| Higuruma | 33% | 50% |
| Naoya | 39% | 50% |
| Dagon | 51% | 49% |
| Yuki | 43% | 49% |
| Yuta | 64% | 49% |
| Megumi | 70% | 49% |
| Mei Mei | 46% | 48% |
| Jogo | 43% | 48% |
| Yuji | 32% | 47% |
| Gojo | 45% | 46% |
| Todo | 28% | 45% |
| Ryu | 36% | 40% |

Ryu (40%) is the closest to the edge. Each fighter has about a ±4% swing from match-to-match randomness at this sample size.

## How the numbers are applied

New `BAL` table next to the Mahito constants, applied in the `hp` setter through `balMul(def, att)`, so it covers **every** source of damage (melee, moves, projectiles, entities, domains):
- `BAL.out[type]` — everything that fighter deals: Gojo ×1.12, Hakari ×0.8, Higuruma ×1.3, Jogo ×1.08, Mahito ×0.72, Mechamaru ×1.0, Mei Mei ×1.08, Naoya ×1.08, Ryu ×1.16, Sukuna ×0.8, Takaba ×1.12, Todo ×1.14, Yuji ×1.26, Yuki ×1.2, Yuta ×0.88
- `BAL.in[type]` — everything that fighter takes: Higuruma ×0.92, Mahito ×1.25, Yuji ×0.9
- `BAL.lingOut[type]` / `BAL.lingIn[type]` — only hits that land while the attacker isn't in a move or a domain (shikigami, projectiles, walls, lingering entities): Megumi ×0.8; takes: Todo ×0.85
- `soulHit` also multiplies soul damage by `BAL.out` (so Mahito's soul damage follows his multiplier).

**Revert everything:** `git checkout 2c6bd14 -- index.html` (or drop the branch). **Revert only the multipliers:** empty the four objects in `BAL`.

## Specific changes (with old values)

### Pass 1
- **Mahito** (nerf): Kiss: 30 → 18, now scaled by his normal damage reduction (was unreduced); cooldown 7s → 12s
- **Mahito** (nerf): I Really am a Curse! Black Flash: 24 → 18
- **Mahito** (nerf): Self-Embodiment of Perfection: explode on the spot under 30% soul (was 50%)
- **Mahito** (nerf): Head-split Evasive: about 1.2s untouchable (run 650 → 450ms, pick 1500 → 750ms, merge 420 → 300ms)
- **Megumi** (nerf): Shikigami / projectile damage −15%
- **Sukuna** (nerf): Malevolent Shrine damage over time: 5/s → 4/s
- **Hakari** (nerf): Idle Death Gamble jackpot chance: 20% → 15%
- **Yuta** (nerf): Cursed Energy Discharge: 15 → 12
- **Ryu** (buff): CE cost multiplier: 1.6× → 1.3×
- **Higuruma** (buff): Gavel throw 8 → 10; Executioner's Sword after GUILTY +20% (22/46/30 → 26/52/36); trial 5.5s → 4s
- **Yuji** (buff): Divergent Fist lunge 7 → 11; combo meter gain 1.25 → 1.9 per point
- **Todo** (buff): Takes 15% less damage from projectiles and lingering entities; CPU uses Boogie Woogie much more
- **Mechamaru** (buff): Drill Drive 22 → 25; Mini Cannon 16 → 18
- **Naoya** (buff): Damage +11% (output multiplier 0.9 → 1.0)

### Pass 2
- **Mahito** (nerf): All damage dealt −15%, damage taken +12%
- **Hakari** (nerf): All damage dealt −14%; each missed gamble roll raises the odds by 6% (was 8%)
- **Yuta** (nerf): All damage dealt −11%
- **Megumi** (nerf): Shikigami / projectile damage −20% total (was −15%)
- **Gojo** (buff): All damage dealt +6%
- **Ryu** (buff): All damage dealt +9%
- **Higuruma** (buff): All damage dealt +10%; verdict screen 2.3s → 1.6s (less stalling)
- **Todo** (buff): All damage dealt +10%
- **Yuki** (buff): All damage dealt +10%
- **Yuji** (buff): All damage dealt +10%, damage taken −5%
- **Takaba** (buff): All damage dealt +12%

### Pass 3
- **Mahito** (nerf): Damage dealt −22% total (was −15%); damage taken +20% (was +12%)
- **Sukuna** (nerf): All damage dealt −8%
- **Hakari** (nerf): Damage dealt −20% total (was −14%)
- **Yuta** (nerf): Damage dealt −15% total (was −11%)
- **Gojo** (buff): Damage dealt +12% total (was +6%)
- **Yuki** (buff): Damage dealt +16% total (was +10%)
- **Mei Mei** (buff): All damage dealt +8%
- **Yuji** (buff): Damage dealt +22% total (was +10%); damage taken −10% (was −5%)
- **Higuruma** (buff): Damage dealt +22% total (was +10%); damage taken −8%

### Pass 4
- **Mahito** (nerf): Soul damage now follows his damage multiplier too (−22%); kiss 18 → 14, cooldown 12s → 14s
- **Sukuna** (nerf): Damage dealt −15% total (was −8%)
- **Yuta** (buff): Damage dealt −12% total (was −15%, overshot)
- **Ryu** (buff): Damage dealt +16% total (was +9%)
- **Todo** (buff): Damage dealt +18% total (was +10%)

### Pass 5
- **Mahito** (nerf): Instant Spirit Body of Distorted Killing (true form): 60s → 20s, 125 → 110 HP, Ten (punch) 14 → 11, slam 32 → 24. Diagnostics showed the true form was his biggest damage source
- **Sukuna** (nerf): Damage dealt −20% total (was −15%)
- **Mechamaru** (nerf): All damage dealt −5% (overshot after pass 1 buffs)
- **Jogo** (buff): All damage dealt +8%
- **Naoya** (buff): All damage dealt +8% on top of pass 1

### Pass 6
- **Mahito** (nerf): Damage dealt −25% total (was −22%)
- **Higuruma** (buff): Damage dealt +30% total (was +22%)
- **Yuki** (buff): Damage dealt +20% total (was +16%)
- **Todo** (nerf): Damage dealt +14% total (was +18%, edging past 60%)

### Pass 7
- **Mahito** (nerf): Damage dealt −28% total (was −25%); damage taken +25% (was +20%)
- **Mechamaru** (buff): Removed the pass 5 −5% damage cut
- **Yuji** (buff): Damage dealt +26% total (was +22%)

## Constants touched (old → new)
- Mahito: `KISS_DMG` 30 → 14 and no longer divided by `mahiHpMul` (so it gets his normal reduction), `KISS_CD` 7000 → 14000, `CURSE_BF_DMG` 24 → 18, new `MAHI_DOM_BURST` 0.3 (was a hardcoded 0.5), `MSPLIT_RUN/PICK/MERGE` 650/1500/420 → 450/750/300, `IBDK_MS` 60000 → 20000, `IBDK_HP` 1.25 → 1.1, `IBDK_TEN_DMG` 14 → 11, `IBDK_SLAM_DMG` 32 → 24
- Sukuna (and Meguna's shrine): `DOMAIN_SLASH_DMG` 5 → 4
- Hakari: `GAMBLE_ODDS` 0.2 → 0.15, `GAMBLE_ODDS_UP` 0.08 → 0.06
- Yuta: `YUTA_DISCH_DMG` 15 → 12
- Ryu: `CE_TYPE_MULT.ryu` 1.6 → 1.3
- Higuruma: `HIGU_THROW_DMG` 8 → 10, `HIGU_IDLE` 22/46/30 → 26/52/36, `COURT_TRIAL` 5500 → 4000, `COURT_VERDICT` 2300 → 1600
- Yuji: `YUJI_CM_GAIN` 1.25 → 1.9, Divergent Fist lunge `vx` 7 → 11
- Todo: CPU Boogie Woogie — swaps incoming projectiles from 160px (was 110), drags opponents in from 220–700px every 2.5s (was 350–650px every 6s)
- Mechamaru: Drill Drive 22 → 25, `MUC_DMG` 16 → 18
- Naoya: `NAO_DMG_OUT` 0.9 → 1.0

Wiki / MOVE_INFO text updated to match (Sukuna shrine 4/s, Yuji lunge, Yuta Discharge 12, Drill 25, Mini Cannon 18, Hakari 15% + 6%, Mahito kiss/Black Flash/domain/true form, Ryu 30% more CE).
