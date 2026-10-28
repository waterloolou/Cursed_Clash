# Oct 27 — Toji rework (stamina, Scope), Maximum: Uzumaki rework, smaller fixes

Everything is in `index.html`. Search for the names given; each change is commented `Oct 27`.

## Toji Fushiguro
Constants and helpers are at the top of the Toji block (search `Oct 27 rework`).
- **Chain of a Thousand Miles** (`TOJI_TOOLS`): reach 250 → **750**, damage ×0.75 → **×0.3**. His moves wind up `TOJI_CHAIN_WIND` (280ms)
  longer with it: the Flurry's first hit (`tfStart`) and the Four-Step Stab's first dash (`trWind`). Basic punches are unchanged (the
  chain never changed their reach).
- **No binding vows or feats**: `buildPlayer` empties `p.lo.feats` / `p.lo.vows` for Toji, so every `_vow()` / `_feat()` check is false.
- **No Black Flash**: `bfEvtRoll` returns for Toji (the ring never appears).
- **Spear nullify only at the end of a full combo**: `_itemOnHit` — Toji's own Spear drains CE / pushes cooldowns / shatters a domain only
  when `this._tjFull` is set: the finisher of a full string (online rules: `oaChain >= 3` on a finisher; one-keyboard rules: the
  combo-3 finisher). His moves (`tojiHit`) only get the item's damage bonus. Replaced the 6s per-target limit (`TOJI_NULL_CD`, no
  longer used).
- **150% stats**: `TOJI_HP` 150 (in `_init`; the select screen shows it). Speed and jump come from stamina (below), starting at 150%.
  `MOVE_PASSIVES.toji` reads 1.5 / 1.5 for the select screen.
- **Stamina** (`tojiStam`, `tojiStamAdd`, `tojiMoveResult`): `TOJI_STAM0` 150 at the start of each life, range `TOJI_STAM_MIN` 40 to
  `TOJI_STAM_MAX` 200. In `_moveStats`, speed = stamina/100 and jump velocity = √(stamina/100), so jump *height* = stamina%.
  - −2 every 5s (`tickToji`).
  - A **move** that misses −20, one that lands +5. Moves are Flurry (any hit), Four-Step Stab (the stab), Gun (the bullet,
    `tjGun` flag in `tickOlShots`) and the Scope shot.
  - **Full combo** (same rule as the Spear above): + the damage that string did. The `hp` setter counts what Toji deals (`_tjDealt`),
    and the string's starting value is `_tjCmbBase`.
  - The HUD's CE bar becomes the stamina bar (`drawCeHud`: "STAMINA · SPEED n%", with a line at 100%).
  - The floor of 40 is ours: the request didn't give one, and 0 would freeze him in place.
- **Fly Heads** (`OL_VARS.toji[1]`, `tickToji`, `drawToji`): the cloud is half the map wide (`TOJI_FLY_HALF` 0.25 × W each side of its
  centre, kept inside the map), full height. He's invisible anywhere inside it.
  - `tojiSeesSelf(pl)`: on a shared screen (one-keyboard / vs CPU), and on his own screen online, he shows as a dashed outline with a
    HIDDEN marker (`drawTojiGhost`).
- **Gun**: always straight ahead in the direction he faces, `vy` 0, no target search, no turning.
- **Ultimate: Scope** replaces Unleashed (`S.TOJISCOPE`, `_tickTojiScope`, `TOJI_SCOPE_*`).
  - Lasts 10s. He stands still, isn't `hittable`, `olHit` ignores him and the `hp` setter takes no damage.
  - Crosshair `scX` / `scY` follows the mouse when it moves, or is steered with the movement keys (9px a frame).
  - Fire: click (`pointerdown` on the canvas), or attack / F.
  - Hit (on the target's body box ±8px): they're stunned, and after 0.3s he teleports next to them with lightning streaks and kills
    them (`_rawHit`, damage = their HP + 999, unblockable).
  - Miss: "MISSED", −20 stamina, over. No shot in 10s: "SCOPE LOST" (no penalty).
  - His screen goes dark outside a scope lens; the opponent sees only a red crosshair and "TOJI IS AIMING".
  - Online: the guest's mouse is sent while scoping (the `ms` input field, as for Hanami's root). A click sends `{t:'tclick', n, x, y}`
    three times (in case the relay drops one), and the host applies each `n` once (`NET.remote.click`).
  - CPU: steers the crosshair with the movement keys, leading the target a little, and fires when lined up (`P.toji`, `cpuPub`
    `scope` / `scX` / `scY`).
  - Removed with Unleashed: the ×6 damage in `_dmgOut`, the +50% speed in `_moveStats`, and the terrain-dash branch in `_olTickCustom`
    (now `&& false`). The `TOJI_ULT_*` / `TOJI_FIN_*` constants and `_tickTojiFin` are left in place, unused.
- Text: wiki Toji section, sidebar, `MOVE_INFO`, `CHAR_TIPS`, `MOVE_PASSIVES`, OL_VARS descriptions.

## Geto — Maximum: Uzumaki
- **No time limit**: `swarmT` no longer counts down. The swarm ends when every curse is dead or back in the pool, i.e. when the
  opponent dies (no live foe → curses fly home), when Geto dies, or at the end of the round.
  - Curses keep chasing a foe who's briefly un-hittable (dashing / invincible) instead of flying home (`getoTarget(...) || olFoes(o)[0]`).
- **Holding the key grows them**: each sacrifice still gives +3% damage and speed (`GETO_SAC_BOOST`), and now also +7% size
  (`GETO_SAC_SIZE`, `getoSwSize`; it used the 3%). Their bite reach grows with it.
- **15 sacrifices → break terrain** (`GETO_UZU_BREAK`, `getoBreaks`): each curse carves a hole every 140ms as it moves
  (`carveCircle`, radius 10 × size). Walkers and crawlers bore through walls instead of climbing them. They already broke blocks
  (`crush`). The HUD shows "n/15 SACRIFICED", then "BREAKING THROUGH".

## Smaller changes
- **Todo**: Boogie Woogie stun `TODO_BW_STUN` 1500 → 750ms.
- **Mechamaru**: jet flight can't climb more than `MECHA_FLY_MAXH` 300px above the liftoff point (`mechaFlyY0`). Geto's stingray
  is 200px.
- **Hanami**: Flower Field damage `FIELD_DMG` 5 → 3.
- **Dagon**: Maximum Output (Death Swarm, Whirlwind) only while standing in water: `req: dagonInWater` on both OL_VARS entries
  ("NEEDS WATER"). The CPU checks it too (`cpuPub.wet`).
- **Jogo**: burn tick `BURN_DMG` 3 → 2 (every 0.5s).
- **Yuji**: bug fix. Modulo refilled his ultimate bar, so he could chain Modulos. Now the bar stays at 0 while `moduloT > 0`, and the
  ultimate can't be started during Modulo.

## Tests
- `func27.js`: Toji at 150 HP, 150% speed / 122% jump velocity (200 stamina → 200% / 141%), feats empty, drain 150 → 148.
  - Stamina: Flurry miss 150 → 130, Flurry hit +5. Chain Flurry hits from 600px for 6 with a 390ms windup.
  - Gun miss −20. Fly Heads: invisible at 24% of the map from the centre, visible at 27%.
  - Full combo: 17 damage → +17.3 stamina, and the finisher drained 30 CE. A Spear jab drains nothing. 200 rolls → 0 Black Flash rings.
  - Scope: not hittable, no damage taken. A miss −20 and ends it; a hit → stun → dead with Toji next to them.
  - Todo stun 750. Yuji's Modulo charge stays 0. Dagon's MO is refused out of water.
  - Geto: the swarm is still out after +30s; at 15 sacrifices size ×2.05 and breaking terrain.
- `mecha27.js`: flight climbs to exactly 300px and holds (online and one-keyboard rules).
- `netscope.js`: guest Toji on the relay. The guest sees the Scope; a guest click kills Gojo on both screens.
- `net2.js` (toji, geto, dagon): bad 0. `errs.js`: clean. `local27.js`: one shared screen, the HIDDEN outline shows; a real mouse click
  on the opponent during the Scope kills them.

## Win rates after this update (hard CPU, every opponent, 80 matches each, maps incl. the theater)
- **Toji 55.0%**: on his special-grade target (56%).
- **Geto 62.5%**: up from the high 50s; the never-ending Uzumaki is strong. About 6 points over his target.
- **Dagon 18.8%** (11.2% before the CPU learned to step into its own water): Death Swarm / Whirlwind were most of his damage.
  He was at 59% before. Left as asked; a damage multiplier (`BAL.out.dagon`) can bring him back if wanted.
- CPU Dagon: when a Max Output move is ready and he's dry, he walks into his own flood first (`P.dagon`, `cpuPub.wetX`).

## Revert
Each constant above has its old value in its comment. For Toji's ultimate, restore the old F block (`Unleashed`), the `_dmgOut` line
`if(this.tojiUltT>0) m *= TOJI_ULT_DMG;`, the `_moveStats` line `if(this.tojiUltT>0) spd *= TOJI_ULT_SPD;` and the `S.DASH && this.tojiUltT>0`
branch, from git history (commit before this one).

## Oct 27b — Dagon and Geto rebalanced
- **Dagon's water rule loosened**: Maximum Output works while he's **wet** — in water, or for `DAGON_SOAK_MS` (6s) after he leaves it
  (`dagonSoakT`, set in `tickZones` while he stands in any water; he drips while soaked, and the status list shows "Soaked").
  `dagonInWater()` covers both. Revert: drop the `dagonSoakT` clause.
- **Multipliers** (`BAL`): Dagon `out` 1.11 → **1.3** and new `in` **0.85** (takes 15% less); Geto `out` 0.955 → **0.86**.
- Passes (80 hard-CPU matches each, every opponent): water-only + Dagon ×1.45 / in 0.8, Geto ×0.88 → Dagon 42.5%, Geto 53.8%.
  With the soak rule, Dagon ×1.3 / in 0.85 and Geto ×0.91 → **Dagon 50.0%** (target 52), **Geto 56.2%** (target 56).
- Confirmation on new seeds: Dagon 50.0% again (160 matches in all). Geto at ×0.91 came out 65% (≈61% over 160), so he was trimmed
  to ×0.86 → **Geto 56.2% over 160 matches**.

## Oct 27c — Dagon: no octopus form while dry
- `_vToggle`: while `dagonInWater()` is false, Dagon can't switch Maximum Output on ("NEEDS WATER"). If it's on when he dries off,
  it switches itself off ("DRIED OFF") — unless he's in the middle of Death Swarm / Whirlwind, which finish first.
- Re-check with this rule (80 hard-CPU matches): **Dagon 48.8%** (was 50.0%), still inside his range (target 52).
