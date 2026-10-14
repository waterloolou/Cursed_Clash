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

## Move reworks (redundant Maximum Output moves)
Picked from the playtest: moves that did ~0% of their fighter's damage *and* duplicated another move in the same kit.
| Fighter | Old (why it went) | New |
|---|---|---|
| Todo (Max Output 2, blockable) | Stone Swap — a second place-swap next to Boogie Woogie, 0% of his damage | **Shoulder Tackle**: charges up to 230px, the first foe in his path takes 10 and is sent flying |
| Mei Mei (Max Output 1) | Ui Ui: Exchange — needed Ui Ui placed, the same trick as her super, 0% | **Axe Boomerang**: the axe spins out ~300px through everything (8) and hits again on the way back |
| Mechamaru (Max Output 2) | Puppet Decoy — a weaker second puppet next to his super, 1% | **Rocket Punch**: a fast straight forearm rocket, 12 damage and a big knockback |
Revert: restore the three `OL_VARS` entries from commit `98619ca` (`todo[2]`, `meimei[1]`, `mechamaru[2]`).
Tested: each fires and hits under both rule sets (Tackle 10, Boomerang 8 out + 8 back, Rocket Punch 12), no errors.
Yuta's Cursed Fist was also flagged (1% of his damage, overlaps Slice & Dice) but left alone — another developer is working on Yuta.

## Second balance pass (found in the working tree, merged as-is) + text sync
Constants changed outside this session, kept and documented here (old → new):
Higuruma sweep 14→16, Large hammer 20→23, its cooldown 7s→6.5s · Hakari jackpot 25%→20%, +10%→+8% per miss · Mei Mei Axe Chop 18→20,
Axe Spin 6→7 · Jogo Flame Dash 8→6 dmg, 7s→8s; Flame Burst 6→4 dmg with a short stun + shove instead of a ragdoll, burn 0.8s ·
Hanami Cursed Buds 6→7, ult drain 25→12 · Gojo Lapse Blue 18→20, cooldown 10s→9s, Reversal Red 17→19 · Sukuna Cleave slash 3.5→3 (18 total),
Dismantle 16→14 · Naoya frame from hits 3s→2.2s · Megumi Max Elephant 12→10 · Geto Kuchisake-Onna cut 3→2.5 (15 total) ·
Ryu Granite Blast 16→18, Output damage taken +30%→+20% · new: Dagon and Ryu get +30% ultimate charge from damage they deal; Yuji +60%.
Wiki, move list, tips and Max Output descriptions updated to these numbers.

## Bug fix found in the final tournament
- **Ultimate Mechamaru frozen for good**: Naoya's frames ignored the mech's super armour; when the frame ended the mech couldn't leave the
  framed state (super armour refused the change), so it stayed frozen until the mech ran out. Fix: `framePlayer` skips a fighter in
  Ultimate Mechamaru, and a frame that ends during the mech returns it to `MECHULT`. Revert: remove the `mechUltPhase` checks in
  `framePlayer`, `tickFramed` and the `case S.FRAMED` line.

## Final check (all changes together)
800-match tournament on the merged build: 0 errors, 0 stuck states after the fix above. Average win % (before → final):
Geto 84→80 · Sukuna 71→76 · Megumi 71→75 · Jogo 75→72 · Hakari 69→59 · Dagon 49→52 · Mahito 50→50 · Todo 36→49 · Choso 52→49 ·
Yuki 46→45 · Takaba 44→45 · Yuta 51→43 · Hanami 38→43 · Mechamaru 46→41 · Yuji 43→39 · Higuruma 36→39 · Ryu 28→39 · Gojo 27→38 ·
Naoya 42→35 · Mei Mei 38→32. Geto, Sukuna and Megumi are still the top three and Mei Mei / Naoya the bottom — next pass.
