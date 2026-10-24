# Oct 23 — Toji Fushiguro, the Colony theater, Todo rework, dash rework

Everything below is in `index.html` (plus one line in `portraits.js`). Search for the names given; each change is commented `Oct 23`.

## New fighter: Toji Fushiguro (`toji`)
Code block: search `TOJI FUSHIGURO (Oct 23)` (sits just above the Yuki block). Constants `TOJI_*`, tools table `TOJI_TOOLS`.
- **Heavenly Restriction**: no cursed energy. `CE_PROFILE.toji = [1,0]`, `ceNeed()` and `ceVarCost()` return 0 for him, the CE bar
  reads "HEAVENLY RESTRICTION · NO CURSED ENERGY", and `_cePost` skips the ×0.75 CE-era cooldown cut for him (`cdMul`), so his
  cooldowns stay long. No aura (not in `AURA_OF`), no anti-domain. Takes 10% less damage (`TOJI_DMG_IN`, in `_dmgIn`).
- **R — Cursed Tools** (no cooldown): Inverted Spear of Heaven → Chain of a Thousand Miles → Playful Cloud. `tojiHit()`:
  - Spear: `ubk` (only a perfect block stops it), sets `_noDR` on the target so the `hp` setter skips `_dmgIn` (ignores damage
    reduction, Infinity included), drains 8 CE per hit; the big stab drains 30, adds 1.5s to their cooldowns and shatters a domain.
  - Chain: reach 250px, 75% damage. Cloud: 145% damage, 1.6× knockback, 88px reach.
- **Q — Flurry** (`S.TOJIFLURRY`): 6 hits 95ms apart (3.2 each, last 8 + knockback) × tool damage. 5s cooldown.
- **E — Four-Step Stab** (`S.TOJIRUSH`): 4 teleport-dashes closing 40 / 50 / 67 / 100% of the remaining gap, then a 20 × tool stab.
  7.5s cooldown.
- **Max Output 1 — Fly Heads**: `tojiClouds` swarm for 6s (16s cooldown). `tickToji` sets `pl.tojiInvis` while he's inside it; `draw()`
  returns early, `olNearest` skips him (homing / auto-aim can't lock on) and the CPU only sees the swarm's centre (fog in `CPU_BOT.act`).
- **Max Output 2 — Gun** (blockable): `olShot` kind `bullet`, 14 + stagger, 12s cooldown. New SFX `gunshot`.
- **F — Unleashed**: `tojiUltT` 8s, `TOJI_ULT_SPD` 1.5 (in the move-speed code), `TOJI_ULT_DMG` ×6 in `_dmgOut`, dash cooldown held at 0 and
  dashes go through terrain (`_olTickCustom`, `S.DASH` branch). F again → `S.TOJIFIN`: blink to the nearest foe within 520px and stab for
  `TOJI_FIN_DMG` 95 with `_rawHit` (the `hp` setter skips every multiplier), ending Unleashed.
- **Inventory curse**: `TOJI_STORE` (`kamu`, `speech`) + `canStore()`; `megShadowStore` / `megShadowPull` now also serve Toji for those two
  items (dash, or G while holding one, stores it; G with empty hands pulls it out; Kamutoke keeps its strikes — `kamuN` is saved,
  which also fixes Megumi's shadow resetting Kamutoke's strikes). HUD reads "IN THE CURSE".
- Registries: `CHARACTERS`, `S` states, `_updateCore` dispatch, `MOVE_PASSIVES`, `CE_PROFILE`, `CE_LORE`, `CE_SLOTS`, `VOICE` + lines + `VL_NAMES`,
  `OL_VARS.toji`, `CHAR_TIPS`, `MOVE_INFO`, `CHAR_ROLE`, wiki sidebar / home card / `<section data-p="toji">`, HUD block (`// Toji HUD`),
  `cpuPub` (`tool`, `tojiUlt`, `invis`, `fogX/Y`), CPU plan `P.toji`, `SYNC_ARR` (`tojiClouds`), `clearProjectiles`, `portraits.js`.
- Select screen shows "NO CURSED ENERGY" for a fighter with 0 refill, and his R chip isn't labelled "(super)".
- **Revert**: delete the `TOJI FUSHIGURO` block and every line containing `toji` / `TOJI` / `tojiClouds`.

## New map: Tokyo No. 1 Colony Theater (map 5)
Search `TOKYO NO. 1 COLONY THEATER (Oct 23)`: `THR`, `thrRake`, `buildTheater`, `paintTheater`, `drawTheaterLight`, `drawMapFore`.
- Layout: balcony (one-way, two columns, box ledges up), raked stalls (solid slope) with one-way seat rows, front aisle, stage 110px up
  with side steps and the bathtub (metal, breakable; drawn as a tub over its block), ledges up stage right to a catwalk and a batten.
- New material `MAT_SEAT = 18` (one-way, red velvet; `T_ONEWAY` gained an 18th entry, `_terCell` colour).
- Lighting: dead house lights; a follow spot from the booth at the back of the balcony pooled on the tub (painted beam + live overlay
  `drawTheaterLight`: darkness outside the pool, additive beam, slight flicker), green 非常口 exit signs, two amber par cans on the batten,
  dust turning in the beam (`drawMapAmbient` case 5). `drawMapFore(mapIdx)` is called right after the fight is drawn (skipped in domains).
- Added to `MAPS`, `getMapBG`'s paint list, `mapChoices` (training list too), wiki maps page.
- Research: the fight is in a theatre in Ikebukuro, Tokyo Colony No. 1, that Higuruma uses as his base; Yuji finds him lying fully clothed
  in a bathtub of water in the middle of the stage; the fight goes through the rows of seats and the tub gets smashed (JJK ch. 163–166 /
  anime S3 ep. 8–9). Written sources don't describe the lighting; the dark house with a single spot on the tub follows the promo art.
- **Revert**: remove the `THR` block, the `MAPS` entry, `paintTheater` from the paint list, `5` from `mapChoices`, the `drawMapFore` call,
  the `i===5` ambient case and `MAT_SEAT`.

## Todo
- Haymaker `TODO_PUNCH_DMG` 15 → 18, `TODO_PUNCH_CD` 3500 → 3000; it can hit a ragdolled foe (`ragHittable` in `_tickTodoPunch`).
- Boogie Woogie `TODO_BW_CD` 7000 → 6000. After the swap Todo turns to face them but **they keep their facing** (so they have their back
  to him) and are stunned `TODO_BW_STUN` 1.5s, at most once per `TODO_BW_STUN_IMM` 6s (stops Unlimited Boogie stun-locking).
  Old line: `this.facing = tgt.x > this.x ? 1 : -1; if(!phys) tgt.facing = -this.facing;`
- Max Output 1: **Feint Clap → Grab & Slam** (`S.TODOGRAB`, `_tickTodoGrab`, `TODO_GRAB_*`): grabs the foe in front (even ragdolled),
  lifts them over his head for 0.48s, slams them down in front of him: 12, knockdown, unblockable, 9s cooldown (`cd:9000`). Old Feint Clap: clap, opponent within
  600px turned around and frozen 0.4s.
- Shoulder Tackle 10 → 12 and it can hit a ragdolled foe.
- CPU uses the grab up close (also on a knocked-down foe).

## Dash (online rules)
- `OL.DASH_CD` 620 → 6000. In `_evasiveTick`, the moment the Evasive bar becomes full the dash cooldown resets (`_evaFull` edge).
- HUD: a small DASH bar at the end of the Evasive line (label hidden while EVASIVE READY shows).
- **Revert**: `DASH_CD:620` and delete the `_evaFull` block.

## Ragdoll hits
- Helpers above `olFront`: `ragHittable`, `ragBox`, `ragPrep`, `olAreaR`, `olHitR`. Moves that use them: Toji's Flurry, Four-Step Stab
  and killing blow; Todo's Haymaker, Shoulder Tackle and Grab & Slam; Mahito's Sky Crash.
- A hit on a ragdolled fighter (`olHitR` / `ragOpts` / `ragBounce`) does its damage and bounces them but strips any launch / stun, so it
  can't restart the ragdoll (the first version let Todo juggle forever: 88–91% win rate in testing).

## Rika and Mechamaru's puppet
- `RIKA_HP` 75 → 50. `PUPPET_HP` 30 → 20.

## Balance pass goes live
- The Oct 18 balance pass (`changes/oct18-balance.md`) was merged into main and pushed before this update.

## Balance multipliers (BAL table)
- `BAL.out.todo` 1.14 → 0.93: his kit buffs (stun, grab, Haymaker 18) took him from 45% to 88% in testing; the multiplier brings him to
  about the low 50s, still well above where he was.
- `BAL.out.toji` 1.2 (new fighter, aimed at the special-grade tier).

## Results (hard-CPU tournament, 1,764 matches, all 21 fighters, maps incl. the theater, 0 errors)
Every fighter wins 36–61%. Toji 51% (special-grade target 56, inside the ±5% band), Todo 54% (was 45% before his buffs).
17 of 21 are within ±5% of their tier target. Drifted after the dash change and the new fighter: Yuta 49 (target 56), Dagon 59 (52),
Hakari 39 (51), Ryu 56 (49) — left for a follow-up pass rather than shipping untested numbers.
Tier averages: special grade 54%, special-grade curses 54%, grade 1 (special-grade level) 48%, grade 1 48%, grade 2 and below 40%.

## Oct 23b — Toji balancing
- **Tools = the items.** `TOJI_TOOLS` entries carry `item:'isoh'` / `item:'cloud'`; new `effItem(p)` returns the item whose effects apply
  (Toji's tool counts as that item). Every place that checked `this.item==='cloud'` / `'isoh'` for punch reach, punch speed and on-hit
  effects now uses `effItem`. So with the Spear his punches get +22 reach, +2 a hit, drain 30 CE, add 2.5s to their cooldowns and
  shatter domains; with Playful Cloud +34 reach, +3 a hit and faster swings — exactly like a player holding the items.
- His moves use base damage plus the item's on-hit (`_itemOnHit(def, mult, lite)`; `lite` = damage bonus only). Flurry: 3.2 a hit, 8 on the
  finisher (×1.6 bonus), the drain / cooldown push only on the first hit per target. The chain is unchanged (250px, ×0.75).
- Removed the old custom Spear (unblockable + ignore damage reduction) and Cloud (×1.45 damage, ×1.6 knockback) stats.
- **Can't pick up** the ISOH or Playful Cloud items (`_tryPickup`: "ALREADY CARRIES ONE"). Kamutoke / Inumaki's Recording still work.
- **Natural stats**: `MOVE_PASSIVES.toji` speed 1.18 → 1.0, jump 1.12 → 1.0; removed `TOJI_DMG_IN` (10% less damage taken) and
  `BAL.out.toji` (×1.2). Health stays 100.
- **Four-Step Stab rework** (`_tickTojiRush`): dashes alternate sides of the target — past them, back in front, past them again — each
  landing at 55% of the previous distance (`TOJI_RUSH_MAX` 6 dashes, `TOJI_RUSH_STEP` 120ms), until he's in reach, then a hard stab:
  `TOJI_RUSH_DMG` 24 + 2.5× the item bonus, big knockback. If there's no room past them (map edge) he stays on his side.
- Tuning from focused tests (Toji vs every fighter, 160 matches each): item-exact Spear + natural stats = 74%. Flurry `TOJI_FLURRY_CD`
  5s → 7s, Four-Step Stab `TOJI_RUSH_CD` 7.5s → 10s, Unleashed `TOJI_ULT_MS` 8s → 6s → 65%. Trimming his move damage did nothing (64%) and
  was reverted. Without the Spear he was 51%, so the item's every-punch nullify was the cause: with the user's OK, Toji's own Spear keeps
  the item's +2 damage and +22 reach but its nullify (30 CE drain, +2.5s cooldowns, domain shatter) lands on the same target at most once
  every `TOJI_NULL_CD` 3s (`_itemOnHit`, `def._tojiNullAt`). A real ISOH item in anyone else's hands is unchanged.
