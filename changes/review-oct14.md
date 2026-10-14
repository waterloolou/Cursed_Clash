# Playtest review — Oct 14 (branch `review-oct14`, NOT pushed until approved)

## How it was tested
- Two agents who had never played (Player A, Player B) learned the game only from the in-game wiki, move list and tips, then each
  wrote a player that controls all 20 fighters through the keyboard.
- Tournament: A vs B in **every combination** (20 × 20 = 400 pairings) under **online** rules and again under **one-keyboard** rules
  = 800 full matches (90s, 2 lives each), maps rotating Shibuya / Sister School / Shinjuku / Sendai, items on.
  Recorded per match: winner, damage per move, stun-lock time, KOs, falls off the map, items, domains, stuck states, errors.
- Player B was the stronger player overall (553–244), so a fighter's score below is the **average of its win rate in A's hands and
  in B's hands** (each fighter: 80 matches). With 80 matches the noise is about ±6 points: only big outliers were acted on.
- After the changes the whole tournament was run again (800 matches), then the fighters changed in round 2 once more (222 matches).

## Results (average win %, before → after)
Sukuna 71→72 · Jogo 75→69 · **Geto 84→69** · Hakari 69→68 · Megumi 71→68 · Choso 52→51 · Mahito 50→51 · Mechamaru 46→48 ·
Dagon 49→48 · Yuki 46→48 · Takaba 44→46 · Yuta 51→45 · **Todo 36→44** · Naoya 42→44 · Yuji 43→41 · **Gojo 27→39** · Hanami 38→36 ·
Higuruma 36→35 · **Ryu 28→35** · Mei Mei 38→34. Spread (std. dev.) 15.7 → 12.4.

## Bugs found and fixed
1. **Executioner's Sword soft-lock** — Higuruma's sword "EXECUTED" a fighter who was blocking: the block cut the damage, so they
   were put in the dead state with HP left (Choso, 14 HP) → no respawn, no KO, the round could never end.
   Fix: the execution sets HP to 0 directly. Safety net in `simFight`: a fighter "dead" with HP left for 1.5s is set to 0 HP.
   Revert: restore `def.hp=0` without `_rawDmg` / `def._hp=0`, remove the 3-line safety net at the top of `simFight`.
2. (Harness only, not a game bug: Ultimate Mechamaru's 20s mech was flagged as "stuck" by the test; it isn't.)
No JavaScript errors, no fighters leaving the map, no other stuck states in 1,822 matches.

## Balance changes (each line: old → new; revert = put the old value back)
| Fighter | What the playtest showed | Change |
|---|---|---|
| Geto | 84% — Centipedes alone did 84 damage a match (44% of his damage) and broke blocks | Centipede damage 5 → 4, cooldown 6s → 7s, no longer break blocks (Uzumaki curses still do) |
| Jogo | 75% (80% after round 1) — Flame Burst (Max Output 1) spammed: 54–61 dmg/match, knocks everyone away | Flame Burst damage 8 → 6, burn 2.5s → 1.5s, own 9s cooldown (was 6s) |
| Megumi | 71–75% — damage spread over every move, Nue the biggest | Divine Dog bite 6 → 5, Nue 8 → 6 |
| Sukuna | 71% — Cleave 61 dmg/match | Cleave 24 → 21 (3.5 × 6 slashes) |
| Gojo | 27% (lowest) — after the cooldown increase his moves don't do enough | Lapse Blue 16 → 18, Reversal Red 14 → 17, Hollow Purple charge 50 → 45 |
| Ryu | 28% — took the most damage of anyone (+50% at full Output) | Output damage taken +50% → +30% at 100%, Output fills 30%/s → 45%/s, Granite Punch reach 74 → 90px, Granite Blast 14 → 16 dmg, cooldown 7s → 6s |
| Todo | 36% — took the 2nd most damage | Takes 10% less damage, Haymaker 14 → 15 |
| Higuruma | 36% | Long Gavel / Hammer Hit sweep 12 → 14 |
| Mei Mei | 38% | Axe Chop 16 → 18 |
| Hanami | 38% | Cursed Buds 5 → 6 each |
| Yuta | 13.8s and 7s full lockdowns from Rika: Grab | Rika: Grab hold 7s → 5s |
| Naoya | 13s chain of frames + stun on Mechamaru | Frame immunity after a frame 2.5s → 4s |

## Looked at, left alone
- **Hakari** 68–69% and 20 of the 64 time-outs (jackpot = can't die). High but inside the noise of the top group; worth watching.
- **Items**: the side that picked one up won 52% — fair. Kamutoke wasn't an outlier after the earlier nerf.
- **Maps**: Shibuya and Sendai had more 90s time-outs (30 and 26 of 200 vs 3–5 on the others) because fighters end up on different
  floors; no traps, no falls off the map, no spawn problems (0 self-KOs in 1,822 matches).
- Ultimates: Gojo's Infinite Void was cast only once in 80 matches (he rarely fills the bar) — the damage buff should help.
