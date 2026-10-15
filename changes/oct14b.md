# Oct 14 (b) — Modulo Yuji, Yuta / Rika overhaul, Wooden Wall, domain layer, map traversal

Everything is in one commit on `main`. Each section says what changed (old → new) and how to revert it on its own.
Base Yuji (Divergent Fist, Divergent Combo, Black Flash, meter, Manji Kick, The Zone) and the Enchain Dismantle dash are **unchanged**.

## Yuji — Modulo (meter ≥ 75% ultimate)
- Duration `YUJI_MOD_MS` 15000 → **60000** (the ultimate bar drains to show what's left).
- `MODULO_DMG` 1.35 → **1.1**. `MODULO_SPD` stays 1.2. Modulo no longer makes cooldowns tick 2× faster (`cdSpeed` is The Zone only now).
- New moveset (constants `MOD_PB_*`, `MOD_CLEAVE_*`, `MOD_DIS_*`; synced arrays `yujiBloods`, `yujiCleaves`; `tickYujiProj` / `drawYujiProj`):
  - **Q Piercing Blood** (`S.YUJIPB`, `_tickModPB`): tap → 0.24s wind-up with a dashed warning line, then a fast beam (speed 26): **10**.
    Hold 0.7s → **5 homing beams** (speed 4.6, about Uzumaki-curse speed), **15** each; a beam dies after 3 walls or 6s.
  - **E Cleave** (`S.YUJIMCLEAVE`, `_tickModCleave`): 0.38s aim (line shows the path), a big slash (r 30) aimed at the opponent that flies
    straight and explodes on contact (blast r 90): **22**.
  - **R Dismantle** (`S.YUJICHASE`, `_tickModChase`): only if the opponent is within 480px — he chases them (up to 1.4s) and grabs: **35**.
  - Cooldowns from `modCd(dmg) = min(6000, max(1500, dmg × 200))`: tap PB 2s, held PB 6s, Cleave 4.4s, Dismantle 6s.
  - Divergent Fist hits are still Black Flashes in Modulo.
- **Revert**: restore the `YUJI_MOD_MS / MODULO_DMG` line, delete the `MOD_*` block, `modCd`, `yujiBloods` / `yujiCleaves` (+ their SYNC_ARR /
  clearProjectiles entries), the four states and their ticks, and the `moduloT>0` routing at the top of the Yuji ability block.

## Yuji — Enchain (Sukuna in Yuji's body, meter < 75%)
- **Cleave** (`S.YUJISCLEAVE`, `_tickEncCleave`): was base Sukuna's point-blank Cleave → **5 slashes**, each after a 0.2s flash, aimed at
  the opponent (`olShot kind:'sslash'`, speed 10 — slower than Sukuna's Dismantle), **7** each, 6s cooldown. Consts `ENC_CLEAVE_*`.
- **Fuga** (special): hitbox 44 and a 130px blast at walls (was base Fuga size), still faster than Sukuna's.
- Dismantle dash unchanged.
- **Revert**: remove `ENC_CLEAVE_*`, `S.YUJISCLEAVE` and the `baseType==='yuji'` ab2 branch; restore the Fuga size check.

## Yuta — Rika is a fighter now (other dev was on Yuta: review before merging with their branch)
- **E Cursed Fist (28 slam, 4.9s) → Metal Arm** (`S.YUTAMETAL`, `_startMetalArm`, `_tickMetalArm`): within 86px a 2s choke (2 every 0.5s)
  then a throw (10) = 18; out of range a 0.45s parry (`yParryT`, checked in `guardFilter` → `yutaParry`: the hit does nothing, the
  attacker is stunned 0.9s). 6s cooldown (`YUTA_METAL_CD`, stored in `yutaFistCooldown`).
- **R Copy → R Summon Rika** (special, same 40 charge). Rika (`p.rk`, `tickRikaNpc`, `drawRika`) lasts 45s with **75 HP** (`RIKA_HP`),
  flies after Yuta (leash teleport past 900px, so she can't get stuck), can be hit by melee and projectiles and is dispelled at 0 HP.
  Press R again to cycle the mode (side bar in the HUD):
  - **Offensive**: Slam 10 (3.2s) + Bite 6 (2s).
  - **Defensive**: enemy projectiles that reach her are destroyed and she takes the damage; she shoves the opponent away from Yuta.
  - **Support**: Grab a stunned opponent for 2.5s (9s cd); jump in the air → she throws Yuta up (`JUMP_V × 1.9`, 3s cd, no HP cost).
- **Maximum Output**: was Rika: Grab / Rika: Eat → **1 Copy** (old Copy rules + Rika must have damaged them since the last copy; `rikaDmg`)
  and **2 True Love Beam** (moved off the ultimate key; needs Rika out + 100 CE, 85 damage, 20s cooldown).
- Old Max Output Rika summon (25s), Rika Grab (5s, +125% damage), Rika Eat and the 4-HP double-jump throw are gone.
- **Revert**: `git show <this commit> -- index.html` — Yuta parts are everything with `RIKA_`, `METAL_`, `rk.`, `rikaDmg`, `yParryT`,
  `S.YUTAMETAL`, and the `yuta` OL_VARS block; the old OL_VARS.yuta is in the parent commit.

## Domain drawn behind fighters / projectiles
- `drawFight`: `drawDomain(); drawLoveKatanas();` moved to the start of the list, so effects and projectiles inside a domain are visible.
- **Revert**: move those two calls back to where they were (after the projectile draws).

## Hanami — Wooden Wall
- Now an **unbreakable** barrier (`MAT_BARRIER = 16`, colour green): `_terBreak` skips it, it counts as anchored. It goes after 4s, when
  Hanami dies, or when a domain opens (`hanaWalls`, `tickHanaWalls`, cleared in `terrainReset`). Before: ordinary root terrain that could be
  broken and only went when terrain respawned.
- **Revert**: in OL_VARS.hanami[2] fill with the old material and drop `hanaWalls` / `tickHanaWalls` / `MAT_BARRIER`.

## Maps — easier to get around
Found with a new navigator test (every fighter walks / jumps from each spawn to the other spawn and the map centre on all 4 maps).
- **Sendai**: the pedestrian deck and both stairs were solid stone; a fighter at spawn 1 (under the deck) walked into the underside of the
  east stairs and could not get to spawn 2, and the deck shelters were only 46px above the deck, so you had to jump them.
  Now the deck and stairs are `MAT_STAIR = 17` (new one-way stone: walk under, jump up through, stand on top; same colours as stone),
  and the shelters moved from G-196 to **G-256** so you can walk under them on the deck.
- **Mechamaru** had no normal jump (only hold-to-fly), so any small step on Shibuya, Sister School and Shinjuku stopped him until he
  charged flight. **Tap jump (< 0.2s) is now a short jet hop** (`MECHA_HOP 0.74` × jump, ~95px); holding still charges flight.
- Result: 21 fighters × 4 maps × 6 routes = 504 routes, **all reachable** (before: Sendai spawn 1 → 2 failed for every fighter,
  Mechamaru failed on every map).
- **Revert**: Sendai — change `MAT_STAIR` back to `MAT_STONE` in `buildSendai` and the shelters to `G-196`. Mechamaru — delete the
  `MECHA_HOP` line and the `_mHold` lines.

## Docs
- Wiki: Yuji (Enchain / Modulo rows), Yuta (Metal Arm, Summon Rika, Max Output), Mechamaru (jump), Hanami (Max Output row), Sendai text
  and terrain rules. `MOVE_INFO`, `CHAR_TIPS`, `MOVE_PASSIVES` (Mechamaru), OL_VARS descriptions.

## Testing
- Kit checks: Metal Arm choke (18) + parry; Rika modes, Copy gate, beam; Modulo tap PB, 5 homing beams, Cleave, Dismantle chase-grab;
  Enchain 5-slash Cleave; Wooden Wall survives a carve and goes after 4s.
- Navigator: 504 / 504 routes. Mechamaru trap scan only flags spots where he has to fly (expected).
- All-pairs fuzz (both rule sets, rotating maps), stress (classic + online seed), walk/jump check (same results as before the batch,
  plus Mechamaru now jumps), two-device host/guest.
