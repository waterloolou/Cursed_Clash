# Oct 18 — home screen, tutorial, Mahito / Sukuna / Yuta / Ryu fixes, CPU, anti-domains

Each area is its own commit (listed at the bottom), so any one can be reverted with `git revert <commit>`.

## Home screen
- The two-column lobby card → a centered menu over a full-window **night sky** (nebula, twinkling stars, a shooting star, pink horizon
  glow, two hill silhouettes, mist) with a slowly turning **magic circle** behind it (`drawHomeSky`, drawn across the whole window,
  not letterboxed). Title in Cinzel, menu items as text with a gold selected state (lines above/below + a ✕ rune), like the reference.
- Main menu: Play Online · VS CPU · Local 2 Player · Training · **Tutorial** · Account & Levels · Wiki · Settings. Play Online, VS CPU
  and Settings open panels with a Back item (`homePanel`). ↑ ↓ / W S + Enter / Space, Esc = back, mouse hover selects (`homeMenuInit`).
- Account badge top-left (level shown), version tag top-right. Every old button id is kept, so all the old handlers still work.
- Revert: restore the old `#lobby` markup, drop the `.hm-*` CSS, `drawHomeSky`, `homeMenuInit` and the `drawBG` home early-return.

## Tutorial
- New mode (`tutStart`): training map, you're Sukuna vs a Jogo dummy that can't die; you can't lose either. 14 steps, each checked live
  (`tutTick`): move, jump, 3 punches, finisher, block (the dummy attacks), dash, Dismantle, Cleave, Fuga (charge given), Maximum Output,
  Black Flash (the ring is guaranteed in this step), Evasive (the dummy combos you, meter kept full), domain, anti-domain (the dummy
  opens Coffin of the Iron Mountain). Panel at the top with the step, instruction (your real keys) and a progress bar.
- Revert: delete the TUTORIAL block (`TUT`, `TUT_STEPS`, `tut*`, `drawTut`) and its hooks.

## Mahito
- **Soul refills after a death** (it used to carry over for the whole match). Still no regeneration during a life.
- **Evasive = head split** (`mahiSplitStart`, `S.MAHISPLIT`): 5 heads run out (0.65s), pick one with left / right and press attack /
  jump / dash (or wait 1.5s); they converge (0.42s) and he reforms there. Untouchable throughout, no moves. The CPU picks the head
  farthest from you. (Not in his true form, which already ignores knockback.)
- Revert: drop the `mahito` branch in `_evasiveTick` and the split code; remove the soul refill on the death line.

## Sukuna
- **Spider Web was spammable**: it ignored the Dismantle / Cleave cooldowns and only cost 30 CE. Now it needs both off cooldown, has its
  own **14s cooldown** (`SUK_WEB_CD`, `sukWebCd`) and costs **45 CE** (`SUK_WEB_CE` 30 → 45).

## Yuta
- **Every attack can hurt Rika**: any area attack covering her (`rikaAreaHit` inside `olArea`, 6 every 0.3s) and projectiles in every
  mode (Defensive still eats them; other modes they pass through after hitting her). Before: only punches, and projectiles in Defensive.
- **Copy never takes the F ultimate**: a copy no longer fills the domain/ultimate bar while active (`domainCharge` skipped in
  `_yutaStartCopy`), so the copied fighter's ultimate can't fire. Tiers unchanged (10+ ability 1, 30+ ability 2, 50+ super).

## Ryu
- Every move costs **60% more CE** (`CE_TYPE_MULT.ryu = 1.6`: abilities 6 → 10, Max Output 18 → 29, ultimate 80 → 128) and Output
  12 → **20** CE a press.

## CPU
- **Uses moves more**: if its plan didn't press an ability this beat, it throws whatever is ready (ultimate, special, ability 1 / 2,
  Maximum Output) every 650ms on Hard / 1.1s Normal / 1.8s Easy (`abGap`). Measured over 5 matchups: 24 moves fired vs 14 before.

## Anti-domain techniques now differ (`tickAdEffects`, `AD_KIND_TXT`)
- **Hollow Wicker Basket** (Sukuna): slows you (as before) but the enemy domain burns out 50% faster while it's up.
- **Falling Blossom Emotion** (Gojo, Kenjaku): counters — the domain's caster takes 4 every second; still −20% damage taken.
- **Simple Domain** (Todo, Yuki, Mechamaru's sealed charges): a 110px circle where you cast it — protected only while inside, and enemy
  projectiles entering it are cut down.
- **Domain Amplification** (Jogo, Hanami, Higuruma): as before (no abilities, −30% damage) plus enemy projectiles touching you dissolve.
- **Ui Ui's box** (Mei Mei): unchanged.

## Testing
- Home: screenshots desktop + phone width, panels and keyboard nav, no errors. Tutorial: played through all 14 steps with scripted
  inputs. Character fixes in both rule sets: split (5 heads, untouchable, reforms), soul refill (20 → 150), Spider Web refused on the
  second press, Ryu costs, Rika takes area damage (75 → 69), Copy tier at a 60 combo = super (the 50+ tier was briefly removed, then restored). Anti-domain kinds vs a real domain
  (basket drained the timer, blossom dealt 8, circle created, amp on). Fuzz Mahito / Sukuna / Yuta / Ryu vs everyone, both rule sets:
  0 issues.
- The hard-CPU tournament and balance report come next; balance changes from it are NOT in this update.
