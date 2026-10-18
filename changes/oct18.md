# Oct 18 — Random fighter on character select

One commit on `main` (base `fb49bba`). Everything is in `index.html`'s CHARACTER SELECT block (search `csRoll`), plus docs.
Nothing about any fighter's kit, the maps or combat changed.

## 1. Random tile (new)
**What:** a 21st tile, **RANDOM**, drawn as a die, at the end of the character grid. It works wherever the grid is used:
VS CPU (your pick and the CPU's pick), local 2 player, online (host and guest each pick their own) and training.

How it works:
- The Random tile is grid index `CHARACTERS.length` (one past the last fighter). `p1CharIdx` / `p2CharIdx` hold that index while
  a player is on it, so cursors, lock-in and online sync use the existing paths.
- New globals / helpers next to `isBanned`: `csRoll = {1:null, 2:null}`, `csN()` (tiles on the grid = fighters + 1),
  `csIsRand(i)`, `csType(i)` (fighter type, `null` for Random), `csRollFighter()` (random index from the fighters not banned;
  falls back to the whole roster if every fighter were banned), `csPick(n)` (the fighter player n will actually play),
  `drawDie(cx, cy, size, face, tilt)`.
- `logicCharSelect`: when both players are locked in, each Random player gets `csRoll[n] = csRollFighter()` once, so the panel
  reveals the fighter during the 1.2s READY TO FIGHT! countdown. The fight starts with `buildPlayer(csPick(1) …)` /
  `buildPlayer(csPick(2) …)` (was `p1CharIdx` / `p2CharIdx`). Training: the dummy copies your rolled fighter
  (`csRoll[2] = csPick(1)`). If either player un-locks, `csRoll` resets to `{1:null, 2:null}`.
- `logicMapSelect` resets `csRoll` with the other character-select state.
- Bans: the feat key on the Random tile does nothing (`csType` is `null`); `csRollFighter` skips banned fighters.
- Online: `csRoll` added to `NET_G` so guests see the reveal. The host does the roll; guests never roll.
- Drawing (`drawCharSelect`): the grid loops over `csN()` tiles; the Random tile shows a die whose faces keep rolling while a
  player hovers it. A player panel on Random shows a big die and three lines on how it works until the roll, then the rolled
  fighter's normal panel with a **🎲 RANDOM PICK** tag next to the name.

**Revert:** delete the block from `// RANDOM tile:` to the end of `drawDie` (just above `const _csPrev`), then:
`csN()` → `CHARACTERS.length` in `csTileXY`, the grid loop, `gridBottom` (`csTileXY(CHARACTERS.length-1)`) and
`logicCharSelect`'s `L`; restore the grid-loop tile body (`const ch = CHARACTERS[i] …`, `csDrawFighter(i, …)`) and the panel
head (`const idx = p===0 ? p1CharIdx : p2CharIdx, ch = CHARACTERS[idx], conf = …`, delete the `if(!ch.type){ … continue; }`
die branch and the `RANDOM PICK` tag); `csType(...)` → `CHARACTERS[...].type` in the ban / lock-in lines; delete the two
`csRoll[...] =` roll lines; `csPick(1)` / `csPick(2)` → `p1CharIdx` / `p2CharIdx` in `buildPlayer`; restore
`} else window._bothConfirmedTimer = 0;`; remove `csRoll = {1:null, 2:null}` from `logicMapSelect`; remove the `csRoll`
entry from `NET_G`. Or restore `index.html` from `fb49bba`.

## 2. Grid width
`CS_COLS 10 → 11`, `CS_TW 82 → 78` (`CS_TH 72`, `CS_GAP 4` unchanged). With 10 columns the Random tile started a third row,
which squeezed the player panels. 11 columns of 78px plus gaps is 898px wide (was 856px, out of 960) and keeps two rows (11 + 10).
**Revert:** set `CS_COLS = 10, CS_TW = 82` (only together with item 1, or the Random tile gets its own third row).

## 3. `isBanned(null)` fix (found while testing item 1)
**Why:** `isBanned(type)` compared `type` with both ban slots, and an empty ban slot is `null`, so `isBanned(null)` was `true`
whenever a player hadn't banned anything. No caller passed `null` before, but the Random tile's type is `null`, so it could
never be locked in. Found by the key-press test below (lock-in on Random did nothing).
**Change:** `return charBans[1]===type || charBans[2]===type` → `return !!type && (charBans[1]===type || charBans[2]===type)`.
Real fighter types are non-empty strings, so nothing else changes.
**Revert:** only together with item 1.

## 4. Docs
- Wiki → Modes & online play: new **🎲 Random fighter** section.
- Shop: the Character Bans description now says Random never rolls a banned fighter.
- README: Modes bullet and a new "Latest: Random fighter (Oct 18)" section (Oct 17 renamed to "Earlier").

## Testing
All with the `cursed-clash-testing` scripts plus two new scratch scripts (not committed): `rnd_test.js` (real key presses) and
`net_rand.js` (online host + guest through the fake relay).
- `rnd_test.js` — **21 / 21 pass**:
  - local 2 player: both cursors reach Random (P1 left wraps from Sukuna, P2 left twice), both lock in, both get a roll during the
    countdown, the fight starts with exactly the rolled fighters, un-locking clears the roll.
  - VS CPU (Normal): you lock in Random, then pick Random for the CPU; both rolled; the fight starts and the bot keeps playing for 3s.
  - training: Random gives a random fighter and the dummy is the same fighter.
  - bans: 3,000 rolls with Gojo and Yuji banned never gave either of them and gave all 18 other fighters (147–189 each);
    the feat key on the Random tile bans nothing; a ban by P2 leaves P1 locked in on Random.
  - no page errors in any mode.
- `net_rand.js` — **pass**: host and guest each move to Random with their own keys and lock in; the guest sees the same rolls as the host
  (`{1:2, 2:3}`), and both pages start the fight as Yuji vs Yuta. No errors on either page.
- `net2.js ryu,yuki` (existing online check, goes through character select): 4 pairings ok, 0 bad.
- `allpairs.js` spot check, one shard of the Sukuna pairs (8 matches, both rule sets, 600 frames): 0 with issues. No fighter
  code changed, so the full fuzz and `nav.js` were not run.
- Screenshots of the die tile, the die panel, the countdown reveal and the online guest's view checked by eye.
