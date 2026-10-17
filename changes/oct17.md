# Oct 17 — notes-file batch: single player, levels, Mahito rework, combat changes, maps, art + music

Built from the team's notes file (everything in it) plus the Ryu art and the battle music. It landed as 7 local commits (one per area,
listed below), so any area can be reverted with `git revert <commit>`. Old → new values are given for every number.

| Commit | Area |
|---|---|
| `d5efbee` | Ryu Granite Blast art + Delirious battle music |
| `47dce4b` | Ryu + Yuta balance |
| `1555b80` | Mahito rework |
| `28ec600` | Combat-wide: Black Flash ring, wake-up i-frames, CE costs, anti-domain |
| `0662210` | VS CPU |
| `67ef9c3` | Levels + achievements, leave-match button |
| `81e758b` | Maps: smooth ramps, Shibuya train, Shinjuku rockfall |

## Art + music
- **Granite Blast start-up**: the 6-frame 128×128 strip plays at Ryu's hand during the wind-up of Granite Blast and Maximum Granite Blast
  (`RYU_ART`, `ryuDrawCharge`; scaled ×0.75 for the beam, ×1.5 for the ultimate, bigger with Output). The orb is anchored at (13, 64).
- **Beam**: the 5-frame 256×128 tile is tiled along every Ryu beam (`ryuDrawBeamTile`, 55ms a frame); the 40px core band is scaled to
  the beam's height. The old line-drawn beam is the fallback while the image loads.
- **Battle music**: `audio/delirious.mp3` (a separate file next to index.html) loops in every fight, domains and Hakari's fever
  included, with ~1.2s fades; menus keep the procedural soundtrack; your own music file still takes priority; if the mp3 can't load
  the procedural fight track plays (`battleMusicTick`).
- Revert: delete `RYU_ART_SRC`…`ryuDrawCharge` and restore the old `drawRyu`; delete `battleMusicTick` and its call, and `audio/`.

## Ryu
- Special: hold to fill 45%/s (15 CE/s) → **each press +10% Output** (12 CE, 1.2s cooldown, 0.32s cast). `RYU_OUT_STEP/CAST/CD`.
- **Takes 20% more damage** always (`RYU_DMG_IN 1.2`), on top of the Output penalty (up to +20%).
- Max Output 1 Output Burst: 8 + shove within 120px → **5 homing lasers**, 5 each (`olShot kind:'ryulaser'`, `RYU_LASER_*`).
- Ultimate: height 90 + 90×Output → **180 + 180×Output** (twice as big); aim range 0.9 → **1.35 rad** (`RYU_AIM_MAX`), left / right turns
  him around, and a dashed **aim guide** (with the beam's width for the ultimate) shows where it goes. Same for Granite Blast.
- Granite Punch: 25 → **18** (`RYU_PUNCH_DMG`).
- Revert: restore `RYU_PUNCH_DMG 25`, `RYU_ULT_H/H_OUT 90`, the old `RYU_OUT_RATE` line and `_tickRyuCharge` (hold), the old Output Burst.

## Yuta
- Summon Rika charge: only Slice & Dice / Cursed Fist hits, 40 → **any damage he deals, 30** (`YUTA_COPY_ULT_REQ`; charged in the HP setter).
- Metal Arm → **Cursed Energy Discharge**: 0.26s wind-up, 150px burst, 15 damage + launch, chips terrain, 25 CE, 6s (`YUTA_DISCH_*`).
  The parry is gone (the `yParryT` hook stays, unused).
- Domain: a katana used to swap his stored Copy (fired with Max Output Copy) → it **loads his next punch** with a random copied move
  (`yKatanaCopy`, checked right after the attack edge in `update`).
- Rika mode switching (R while she's out) is free of CE.

## Mahito (full rework)
- **Soul bar** for his opponent (`soulInit`, `soulHit`): max HP + 0.5 × CE pool; never regenerates (persists across lives); caps their CE at
  pool × soul/soulMax; 0 = instant death (`_soulKill`). Yuji, Sukuna and Meguna are immune.
- Mahito's HP damage × 0.6 / 0.45 / 0.32 / 0.25 by opponent lives lost (`MAHI_HP_MUL`, in `_dmgOut`), except in his true form.
- Melee (`S.ATCK` / `S.DIVE`) damages the soul: 2.5 × the HP dealt (`MAHI_MELEE_SOUL`), not while Self-Transfiguration is on.
- Humans: 5 → **10**; kill restock → **+6 on a soul kill** (max 16).
- Q **Transfigured Human Deployment** (down + Q cycles): 3 small humans (1 TH, 3 dmg + flinch, die to any hit, 7s) · Body Repel (2 TH,
  now breaks terrain while it grows, has 40 HP and stays until broken, max 2) · Soul Isomer (2 TH, damage 16 → **26**). 0 TH → **the kiss**
  (520px lips, 30 unblockable except perfect block, not reduced).
- E **I Really am a Curse!**: dash 230ms; on contact a Black Flash ring (0.9s, window 90ms): BF 24 + 12 soul, else 6 + 10 soul. 6s.
- R **Idle Transfiguration**: 8 dmg + 3-touch kill → **50 soul damage**; charge 14 → **40**.
- Max Output: Black Flash / Idle Transfiguration → **Spiky Wall** (2 TH; floor to ceiling/top of map, 6 dmg touch, blocks the opponent,
  bounces non-CE projectiles (`SOUL_NON_CE`: axe, crow, gavel, pachinko), 8s) / hold down with 4+ TH: **omni Body Repel** (4 TH, 18, r 230,
  breaks terrain) · **Self-Transfiguration** toggle (+25% speed, +20% jump, no soul damage, 6 CE/s). The old "Max Output = Distorted
  Killing form" and the old Self-Transfiguration special (stat shifts) are gone.
- Domain: hand sign 1.1s → **2.4s**, protected only for the last 8% (was after 1/3). Effect 6 dmg / 1.1s → **under 50% soul: explode;
  else one touch from Mahito kills** (soul-immune fighters still take the 6 dmg ticks).
- **Instant Spirit Body of Distorted Killing**: 2 Black Flashes this life (`bfLife`, reset on death) + 75% ultimate → F starts it for 60s:
  ×1.5 speed, 125 max HP, no stun/knockback (`ss` refuses), normal damage. Q Tendril Grab (420px, 14) · E Sky Crash (grab, fly, crash, 32) ·
  R Counter (0.42s, anyone who hits him dies; 15s; in `guardFilter`).
- Revert: `git revert 1555b80` (self-contained).

## Combat-wide
- **Black Flash ring**: on any combo finisher at a stunned target, 25% (40% Yuji/Todo/Mahito) chance a ring appears (`bfEvtRoll`); the
  finisher holds (`bfEvtHold`) for up to 0.62s; attack within ±85ms of 78% → Black Flash ×2.5 (`bfEvtLand`). Presses in the first 150ms
  are ignored (mash). Replaced "perfect finisher = BF for Yuji/Todo/Mahito" (a perfect finisher is now a CRITICAL for everyone).
- **Wake-up i-frames**: up to 1.5s → **0** (`WAKE_IF_MAX`). Evasive regen ×3 while stunned/knocked down (`EVA_STUCK_MUL`), per damage
  1.6 → 2.4 (`EVA_COMBO_DMG`).
- **CE costs** (`ceNeed`): supers free → 12% of the pool (12–35); ultimates free → 25%, domains → 40%; abilities with no cost table →
  5 CE. Melee stays free; Ryu's Output, Yuki's Mass Shift and Yuta's Discharge charge their own CE (`CE_OWN`).
- **Anti-domain**: just the ultimate key while an enemy domain is up or being cast (`enemyDomainNear`, `adCast`), in **both rule sets**
  (one keyboard didn't have it before), with a pulsing prompt over the fighter (`drawAdPrompt`). Attack + F still works.

## VS CPU (single player)
- Home screen: 🤖 VS CPU · EASY / NORMAL / HARD. You pick your fighter, then the CPU's. Online combat rules, full online layout.
- `CPU_BOT` = the Oct 14 playtest bot (player_B, won 553/800), with new plans for Modulo Yuji, Yuta (Rika, Discharge, Copy, beam,
  katana punch), Mahito (all new moves, true form, kiss), Ryu (tap Output), plus Black Flash ring answers and one-key anti-domain.
- Difficulty (`CPU_LEVELS`): thinks every 3 / 2 / 1 frames, drops 40% / 15% / 0% of ability presses, guards 35% / 80% / 100%, answers
  25% / 55% / 90% of Black Flash rings, Easy never uses Maximum Output.
- Revert: `git revert 0662210`.

## Levels + achievements (replaces Yen)
- XP: CPU win 20 / 40 / 70 (loss 40%), online win 60 / loss 25, + 1 per 10 damage (max 20). Local 2P and training: none.
- Level n needs 50·n·(n−1) total XP. Unlocks by level: Bans 2 · Glass Cannon / Iron Body / Last Stand 3 · CE Flow / Overtime /
  Domain Sacrifice 4 · Heavenly Restriction 5 · Six Eyes 7 · RCT 9 · Kenjaku 11 · Meguna 15. Unlocked items are equipped in Loadout.
- Migration (`accMigrate`): old saves keep everything owned; xp = (coins + prices of owned items) × 2.
- 17 achievements (`ACH`, 30–300 XP) with toasts; count in VS CPU and online only. Saved in the profile (`ach`, `st`), Firestore `data`
  JSON and save codes (`x`, `a`, `s`).
- UI: chip "LV n", Account → wallet shows level/XP, Unlocks tab (was Shop) shows 🔒 LEVEL n, new Achievements tab, match-end XP bar.
- **Leaving**: ✕ MENU button top-right everywhere (double-click in a fight), and M in the pause menu (`leaveToMenu`). Before this there
  was no way to quit a match.
- Revert: `git revert 67ef9c3` (coins logic comes back; xp/ach fields are ignored by the old code).

## Maps
- Terrain ramps (`_terRamps`): every step on a top surface or underside gets a ramp from halfway along the lower run — slopes, mounds
  and stairs read as diagonals. Visual only, drawn on full terrain rebuilds.
- **Shibuya**: the parked B5F subway car (terrain) → a **train hazard** every 32s (first at 20s): 3s warning (red lights, horn, text),
  then a 620px train at 34 px/frame along the B5F floor: 20 damage + launch. Three canopies (one-way, GND−112) added to climb out.
- **Shinjuku**: **rockfall** every 15s (first at 12s): 3 chunks on the rubble field, 1.1s growing shadow, 10 damage + stun, small crater.
- Hazards: host only, synced (`mapHaz` in SYNC_ARR), off during domains and in training (`MAPHAZ_SHB`, `MAPHAZ_SJK`).
- Navigator check after the change: every spawn reaches every other spawn and the centre for the 5 fighters tested.
- Revert: `git revert 81e758b`.

## Testing
- Art: screenshots of the start-up frames and the beam in a match. Music: the file loads on file:// and fades in on fight start.
- Ryu / Yuta kit checks, both rule sets: punch 16.2 vs Todo (18 × 0.9), Output 10% → 20%, dmgIn 1.248 at 20%, homing lasers 19.8,
  Discharge 13.5, Rika charge 13.5 from it, katana punch fires Reversal Red.
- Mahito, both rule sets: soul 150 vs Todo, melee soul, minis, Body Repel cycle, kiss, Curse ring timed (BF) and early, Idle
  Transfiguration 150 → 100 soul, Spiky Wall floor-to-ceiling, Self-Transfiguration speed 1.275, true form (125 HP, ×1.53 speed),
  Sky Crash, Counter kill. Fuzz: Mahito / Ryu / Yuta vs everyone, both rule sets, 222 runs, 0 issues.
- Combat: BF ring shows and lands (both rule sets), Sukuna super 28 CE / domain 92 CE, domain refused at 5 CE, one-key Simple Domain.
- VS CPU: every fighter as the Hard CPU engages and deals damage, 0 bot errors; full menu flow (button → mode → map → pick both →
  fight) works.
- Levels: old save (¥300 + Glass Cannon) → 1000 XP, level 5, 8 unlocks; a Hard CPU win → +88 XP and 4 achievements; ✕ MENU (two clicks)
  and pause + M return to the menu.
- Maps: train hits the player on the tracks (18 vs Todo), rockfall hits (9), navigator: all routes reachable.
- The full all-pairs fuzz of the final build was stopped early at the team's request (the reworked fighters were fuzzed earlier: 222 runs, 0 issues).
