# Cursed Clash

A Jujutsu Kaisen–inspired 2-player fighting game that runs in your browser — no install, no server.

## ▶ [Play in your browser](https://waterloolou.github.io/Cursed_Clash/)

No download needed — just open the link. (Or download it to play offline, below.)

## Play offline (download)

1. Click the green **Code** button on this page → **Download ZIP**.
2. Unzip it.
3. Double-click **`index.html`** — it opens in your browser (Chrome or Edge recommended).

That's it. Everything is in that one file.

## Modes
- **VS CPU** — single player against a bot (Easy / Normal / Hard). Gives XP.
- **Local 2 player** — two people on one keyboard. *Local matches don't give XP.*
- **Online** — each player on their own computer. One presses **Host online game** and shares the 5-letter code; the other types it in and presses **Join**. Online matches give XP; levels unlock feats like Six Eyes and Kenjaku, and binding vows.
- **Normal** (3 lives, the KO'd fighter respawns from the sky) or **Endless** (kill counter).
- **🎲 Random**: pick the die on the character select screen to get a random fighter (never a banned one).
- **🧪 Training (solo)** — just you, to test any character against a target that stands still and can't die. Includes the **Training Room**, a flat map with distance markers that only appears in training. Number keys: **1** infinite meters · **2** infinite cursed energy · **3** reset · **4** next fighter · **5** online vs classic combat · **0** hide the bar. Shows your combo damage live. No XP.

## Earlier fighter: Yuki Tsukumo

Star Rage: **Garuda Grapple** (her shikigami latches on and reels her in), **Garuda Throw**, and a **Mass Shift** special that cycles Regular → Extreme (+75% damage, slow, burns CE) → Light (very fast, 25% damage) for half her CE and 5 HP. Ultimate: she collapses into a **black hole** that drags everyone in — and then self-destructs, costing her that life. Maximum Output: **Star Rage Rush** and **Uppercut: Garuda Dive**. Anti-domain: Simple Domain (New Shadow Style).

Also recent:
- **Megumi Fushiguro** — Ten Shadows (Rabbit Escape, the Toads, Divine Dog, Chimera Shadow Garden), and the ¥3000 **Meguna** feat that lets Sukuna take the body.
- **Mahito** — see the latest batch above: transfigured humans, Self-Transfiguration, the Body Repel blob, Idle Transfiguration in Maximum Output.
- **Reverse Cursed Technique** is now a shop feat (¥800): regenerate HP for CE when you're out of combat.
- **Naoya Zen'in** — the fastest fighter, 4 lives, the 24 FPS frame prompt (5s freeze).

## Latest: Random fighter (Oct 18)
Full list with revert notes in [`changes/oct18.md`](changes/oct18.md).
- **🎲 Random** is a new tile on the character select screen (the die, after Ryu), in **VS CPU** (for you or the CPU), **local 2 player**, **online** and **training**.
- Lock it in like a fighter: when both players are locked in, each Random player gets a random fighter, revealed during the **READY TO FIGHT!** countdown.
- **Banned fighters never come up**, and the Random tile itself can't be banned.
- Un-locking cancels the roll, so you get a fresh one next time.
- The roster grid is now 11 tiles wide, so 20 fighters + Random still fit in two rows.

## Earlier: single player, levels and the Mahito rework (Oct 17)
Full list with old → new values and revert notes in [`changes/oct17.md`](changes/oct17.md).
- **VS CPU** (Easy / Normal / Hard): a bot that knows every fighter's kit, Black Flash rings and anti-domain included.
- **Levels + XP replace Yen**: win against the CPU or online to level up; every feat and vow unlocks at a level; **17 achievements**. Old saves keep their unlocks and turn coins into XP.
- **Mahito rework**: a **soul bar** that never heals, melee that hits the soul, Transfigured Human Deployment (and the kiss), I Really am a Curse!, Spiky Wall, a deadly new domain, and **Instant Spirit Body of Distorted Killing** after two Black Flashes.
- **Combat**: anyone can **Black Flash** (a random timing ring on finishers), **no i-frames after getting up** (Evasive fills faster instead), supers and ultimates **cost CE**, and **anti-domain is one key** with a prompt.
- **Ryu**: new Granite Blast art, +10% Output per press, homing Output Burst, an aimable ultimate twice the size, takes 20% more, weaker punch. **Yuta**: Cursed Energy Discharge, Rika charges from any damage, domain katanas load your next punch.
- **Maps**: smoother slopes, a **train** through Shibuya B5F, **rockfall** in Shinjuku. **Battle music**: "Delirious". **✕ MENU** to leave anything.

## Earlier: Modulo Yuji, Rika as a fighter, easier maps (Oct 14b)
Full list with old → new values and revert notes in [`changes/oct14b.md`](changes/oct14b.md).
- **Modulo Yuji** lasts a whole minute (shown by the ultimate bar) with a new moveset: **Piercing Blood** (tap: a fast blockable beam for 10 · hold: 5 homing beams, 15 each), an aimed **Cleave** that explodes on contact (22), and a **Dismantle** that chases them down and grabs (35). Cooldowns scale with damage, 6s max. Enchain Sukuna's **Cleave** is now 5 aimed slashes and his **Fuga** is faster with a bigger blast.
- **Yuta**: **Metal Arm** replaces Cursed Fist (choke + throw up close, parry from range). **Summon Rika** is his special: she follows him as her own fighter (75 HP) with **Offensive / Defensive / Support** modes. **Copy** and **True Love Beam** are his Maximum Output moves (Copy also needs a Rika hit; the beam needs Rika out).
- **Domains** are drawn behind everything, so you can see projectiles and effects inside them.
- **Hanami's Wooden Wall** is unbreakable; it goes after 4s, on her death or when a domain opens.
- **Maps**: Sendai's deck and stairs are one-way (no more getting stuck under the deck at spawn), the deck shelters are higher, and **Mechamaru** can tap jump for a short hop. Every fighter can now get from every spawn to every other spawn on every map.

## Earlier: playtest balance patch (Oct 14)
Two brand-new players fought every matchup (400 pairings × online and one-keyboard rules = 800 matches) and the outliers were tuned. Full list with old → new values in [`changes/review-oct14.md`](changes/review-oct14.md).
- **Nerfs**: Geto (Centipedes 4 dmg, 7s, no longer break blocks; Kuchisake-Onna 15), Jogo (Flame Burst 4 dmg + shove, 9s; Flame Dash 6), Megumi (Divine Dog 5, Nue 6, Max Elephant 10), Sukuna (Dismantle 14, Cleave 18), Hakari (jackpot 20%, +8% per miss), Yuta (Rika's Grab 5s), Naoya (frames from hits last 2.2s, 4s immunity after a frame).
- **Buffs**: Gojo (Lapse Blue 20 with a shorter cooldown, Reversal Red 19, Hollow Purple charges faster), Ryu (Granite Blast 18, +20% damage taken at full Output, faster Output, longer punch), Todo (takes 10% less, Haymaker 15), Higuruma (Hammer sweep 16, Large hammer 23), Mei Mei (Axe Chop 20, Axe Spin 7), Hanami (Cursed Buds 7, ult drain halved). Dagon and Ryu fill their ultimate 30% faster from damage they deal, Yuji 60% faster.
- **New Maximum Output moves** replacing redundant ones: Todo **Shoulder Tackle**, Mei Mei **Axe Boomerang**, Mechamaru **Rocket Punch**.
- **Bug fix**: Higuruma's Executioner's Sword on a blocking fighter left them "dead" with HP and the round could never end.

## Newest fighter: Ryu Ishigori
The biggest cursed energy output in the Culling Game. **Granite Punch** (Q): if it lands he steps back, charges and blasts them point-blank (25); whiff it and you're wide open. **Granite Blast** (E): an aimable beam. **Hold R** to pour cursed energy into his **Output** bar — up to +80% damage and much bigger beams, but he takes up to 50% more damage too. Ultimate: **Maximum Granite Blast**, a beam across the whole map. Maximum Output: Output Burst, Granite Barrage.

## Latest: Yuji rework, Sendai, Kamutoke
- **Yuji is a pure brawler now.** **Divergent Fist** (Q): a punch; if it lands, a ring closes on them — press Q again as it meets the inner ring for a **Black Flash** (18, big launch). **Divergent Combo** (E): a long lunge, two punches and a kick (his mobility). Special: a **guaranteed Black Flash** (28).
- **Combo meter** on Yuji's side of the screen: only normal punches fill it, and it never drains on its own. **Maximum Output** spends it: **Manji Kick** (counter stance, longer with more meter, uses 10%) and **The Zone** ("Zoned In": more damage, faster cooldowns, an easier Black Flash ring; uses 20%, lasts longer with more meter).
- **Ultimate**: meter under 75% → **"Enchain"** and **Sukuna takes over** for 15s (Dismantle = a dash across half the map that deletes terrain and slices anyone it touches, an aimable faster/stronger Fuga, the same Cleave). 75%+ → **Modulo**: every Divergent Fist is a Black Flash, more damage and speed.
- **New map: Sendai** (Culling Game colony): the station, the pedestrian deck, a zelkova avenue and a tower under a torn sky.
- **New item: Kamutoke**: call lightning on the nearest foe, 3 strikes.
- **Fits every screen**: the game scales evenly with black bars instead of stretching on tablets, phones and ultrawides.
- Geto's centipedes are slower. Lots of HUD / menu readability fixes and bug fixes — every change is logged in the `changes/` folder (`lead.md`, `bugs.md`, `performance.md`, `quality.md`) so any of it can be reverted.

## Earlier: matchmaking queue + balance batch
- **Queue for a match**: press **QUEUE · NORMAL** or **QUEUE · ENDLESS** on the home screen. Two people queuing for the same mode are paired automatically and go straight to the stage select. Hosting with a code still works for playing a friend.
- **Character select** now shows each fighter's **speed, jump height and health**.
- **Mahito rework**: he carries **5 transfigured humans** (Body Repel, Soul Isomer and his special each use one; killing the opponent restocks them). New special **Self-Transfiguration**: one stat +15%, the others −5% (hold up = jump, down = health, a direction = speed, nothing = damage). **Body Repel** grows a giant blob along the ground that he walks through and the opponent can't (it shoves them for damage). **Idle Transfiguration** moved to Maximum Output.
- **Geto**: Uzumaki lasts 22s, curses break blocks and take **two hits** to kill; **hold the ultimate key** to sacrifice a curse every second for +3% damage, speed and size on the rest. **Giant Catfish** reworked: it bursts out under Geto and swallows terrain, water, projectiles, puppets and soul isomers; a foe who falls in is stuck 5s for 20 damage (32s cooldown). Rainbow Dragon shows a dashed aim line. Stingray: 11s cooldown and a 200px height limit.
- **Sukuna**: when a Dismantle chain ends, Dismantle **and** Cleave go on a very long cooldown (~10 / 16 / 22s).
- **Gojo**: longer cooldowns everywhere; in Maximum Output the ultimate is **Hollow Purple: 200%** — now 4× a normal Purple's size and 170 damage.
- **Yuta's domain** no longer freezes the opponent; katanas keep appearing, and each one charges Jacob's Ladder and swaps his Copy for a random ability.
- **Zoners**: every Flood drop can hurt 10 times and then dries up · Water Prison flashes first (block it to splash it) · Flower Fields wilt after 30s untouched or 2.5 minutes · Lava Mounds fade nearly invisible (embers give them away) · Death Swarm: hold to aim, fish home for 1.5s then fly straight.

## Newest fighter: Suguru Geto
Cursed Spirit Manipulation: **Centipedes** (three red centipede curses rush the foe), **Kuchisake-Onna** (point-blank: press the key she shows or get cut by a barrage of scissors), and the **Mirror Curse** super that sends projectiles back. His dash is a **stingray** you ride for 3s in any direction. Maximum Output: **Rainbow Dragon** (aim it, then it charges in a straight line) and **Giant Catfish** (a giant open mouth that deletes anything that falls in and chews on the enemy). Ultimate: **Maximum: Uzumaki** — his whole curse pool (30 to start) swarms the opponent; curses that die are gone, survivors return for next time.

## Latest: new menus
- **Character select** like a fighting-game roster: a portrait grid with each player's cursor, and a big panel per player with their fighter and a quick summary of the kit (moves, Maximum Output, passive, CE).
- **Character Bans** (shop, ¥20): each player can ban one fighter on the select screen (feat key: **T**, or Right Shift for local Player 2).
- New **stage select** with a big preview, a restyled **mode select**, and a new **home screen**.
- **Your own portraits**: put pictures in the `portraits` folder and list them in `portraits.js` — any character without one uses the in-game drawing.

## Performance + online fixes (merged)
- **Smoother on slow computers**: the game switches to *lite effects* by itself if the frame rate stays low (no glow blur, half the particles), the canvas no longer renders at full 4K on big screens, and particles / damage numbers are capped.
- **Can't freeze any more**: if one frame hits an error, the game logs it and keeps running.
- **Online is sturdier**: paste a whole **invite link** into JOIN, the guest tries every relay server at once, reconnecting/reloading doesn't create a ghost player, keep-alive pings run even in a background tab, the disconnect timeout is 15s, and domains / terrain are sent in much smaller pieces.
- **Dash has no i-frames** any more (it's for repositioning), and Sukuna's Cleave can no longer be dodged just by dashing.
- **Getting up after a knockdown**: no i-frames at the start of a combo, then longer the longer the combo has lasted (up to 1.5s). Evasive still breaks you out.

## Combat overhaul + character batch
- **Evasive** (like JJS): a meter under your CE bar fills over time and when you're hit. When it's full, press **dash** (online) or **down + jump** (one keyboard) while stunned or knocked down to burst free.
- **Variable stun** (bigger hits and longer combos stun longer), **combo follow** (you drift after the target automatically), **uppercuts** (hold jump on the finisher, keep holding to leap after them) and **downslams** (down + attack in the air). Whiffed air punches no longer stall your fall.
- **CE**: regular non-melee moves cost a little (3–8); punches and weapon swings stay free; changing your weapon costs CE. Maximum Output moves cost 18.
- **Domains** now cover the entire map, wherever the fighters are.
- **Gojo**: new art for Hollow Purple, Reversal Red, Lapse Blue and Infinite Void · Blue nerfed · Maximum Output ultimate = **200% Hollow Purple**.
- **Dagon**: Water Prison · Water Jet · **Flood** (special) — water piles up and spills over walls; deeper water = slower foes, faster Dagon. Maximum Output = **octopus body** with Death Swarm and Whirlwind.
- **Higuruma**: **Hammer Size** special (Normal / Long / Large) changes **Hammer Hit**; Gavel Throw is a regular move.
- **Hakari**: shutter doors you can stand on, a jackpot moveset (Fever Rush, Ball Storm), +1 pachinko ball per jackpot, faster.
- **Jogo**: Maximum Output ultimate = giant **Maximum: Meteor**; Ember Insects fly straight in a fan of 5.
- **Sukuna**: Dismantle chain −15% damage and +3s cooldown per link (6s base, max 3 links); Cleave throws them at the end.
- **Naoya**: frames last 3s (24 FPS stays 5s) and can't be chained. **Yuta**: struggle out of Rika's grab. **Hanami**: Root Grab ↔ Flower Field, heals in her flowers. **Megumi**: stronger rabbits you can run with. **Yuki**: light mass a bit slower, extreme mass a bit weaker.
- **Zoners**: water + lava = steam cloud; deep water slows falls.

## Zoners
Jogo, Dagon and Hanami now shape the map, and each counters the next: **Jogo's fire burns Hanami's flowers · Hanami's flowers drink Dagon's water · Dagon's water douses Jogo's lava and mounds.** Their zones stay until a domain opens, their owner dies, or the counter removes them.
- **Jogo**: Lava Mounds are permanent (can't erupt in water); Flame Dash, Maximum Meteor and fire towers leave cracked lava ground that hurts and burns.
- **Dagon**: Flood pours real water that runs off ledges, pools and piles up.
- **Hanami**: Flower Fields stay where they're planted (and heal her).

## Latest: Yuta rework
- **Copy** now depends on your best combo since the last copy: 10+ damage copies the opponent's ability 1, 30+ their ability 2, 50+ their super — works on every fighter.
- **Maximum Output + R summons Rika** for 25s: **Rika: Grab** (7s hold, +125% damage taken), **Rika: Eat** (copies their super), **True Love Beam** on F (100 CE, 85 damage, erases terrain, can be interrupted), and a Rika throw on double jump.
- **Items** are rarer (one every 48s, one at a time), and a weapon item replaces the weapon already in your hands.

## Latest: ultimate reworks
- **Domains** cover the whole map and shatter all of its terrain; it rebuilds ~6s after the domain closes (never right next to a fighter).
- **Hakari**: 25% jackpot per roll, +10% after every miss, and **Jackpot Continuation** (a jackpot can keep going).
- **Naoya**'s vengeful curse only lasts one minute. **Gojo**'s Infinite Void: no moving or fighting except anti-domain. **Higuruma**'s court confiscates jumping.
- **Hanami** Root Rampage 12s / 14 per hit · **Yuki**'s black hole swallows half the map · **Yuta** gets faster with each katana · **Mechamaru**'s Pigeon Viola and Ultra Cannons are bigger and go through walls · **Choso**'s Convergence leaves blood pools · **Mei Mei**'s Bird Strike implodes as a sphere of cursed energy.

## Controls

Every key can be changed: **⌨ CONTROLS** on the home screen (saved in your browser). Press **ESC** in a fight to pause — the pause menu lists every key (and lights up whatever you press), explains the combat system, and shows your fighter's moves and tips. Hold **TAB** in a fight for the move list. The in-game **Wiki** (home screen) covers every character.

| | Online (your own keyboard) | Local P1 | Local P2 |
|---|---|---|---|
| Move / jump / down | A D / W / S | A D / W / S | ← → / ↑ / ↓ |
| Attack | Left click or J | F | / |
| Abilities 1 · 2 · super | Q · E · R | 1 · 2 · 3 | L · K · J |
| Domain / ultimate | F | Q | ; |
| Block · Dash *(online only)* | Right click / C · Shift | — | — |
| Maximum Output on/off (aura lights up) | V | E | I |
| Feat (e.g. Kenjaku swap) | T | T | Right Shift |
| Chat *(online)* | Enter | — | — |
| Pick up item | G | G | Enter |
| Pause | Esc | Esc | Backspace |

## Cursed energy

Every fighter has a **cursed energy (CE)** bar under their health that refills on its own.

- **Regular moves cost a little** (3–8 CE); **melee moves are free** (punches, sword / axe / hammer swings); changing your weapon costs CE (Higuruma's Hammer Size). Supers and domains / ultimates only need their hit charge.
- **Maximum Output** (online **V**, one keyboard **E** / **I**; your aura lights up while it's on): ability 1 / 2 fire stronger versions for **18 CE** each, and your super and domain still work. One Maximum Output move per fighter can be blocked; the other, and every super and ultimate, can only be countered with a perfect block. Every fighter's moves are listed on their wiki page.
- A few extras also use CE: anti-domain techniques, Sukuna's Dismantle chain and Spider Web, Mahito's killing form, Yuki's extreme mass, and the Reverse Cursed Technique feat.
- **Black Flash** makes your CE refill 250% faster for 10s. Hakari's jackpot gives infinite CE.
- The shop's **Six Eyes** and **Cursed Energy Flow** make it refill faster.

## Notes

- In a fight, small tags under each health bar show that fighter's active effects with timers (red = bad for you, e.g. Burning, Sealed, Reshaped; green = buffs, e.g. Simple Domain, Counter stance). Useful notices like *Too early — combo dropped* or *Not enough CE (24)* appear underneath in small text and fade after a couple of seconds.
- Your coins, unlocks and Voice Lab recordings are saved in your browser on that computer. To move your progress to another computer: **👤 Account → GET MY SAVE CODE**, copy it, then on the other computer paste it into **LOAD SAVE CODE**.
- If joining an online game gets stuck, the network may be blocking it (common on school Wi-Fi) — try home Wi-Fi or a phone hotspot.
- To update, download the ZIP again (or just replace `index.html`).

## Credits

- **ThEndNite** — artwork: the cursed energy aura effects (all six colors), the Inverted Spear of Heaven and Hakari's pachinko balls.
