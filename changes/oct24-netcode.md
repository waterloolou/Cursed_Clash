# Oct 24 — online lag fix for the joiner (client-side prediction)

**Problem**: online play is host-authoritative (the host's browser runs the whole match; the joiner sends inputs and draws snapshots).
So every step the joiner took waited a full round trip: key → host → snapshot → joiner's screen. With 120ms each way, the joiner's
fighter started moving **311ms** after the key press.

**Fix** (search `CLIENT-SIDE PREDICTION (Oct 23)` in `index.html`):
- `netSendInput`: during a fight the joiner sends its input **every frame** (every 33ms on the relay) with a frame number `q`.
- Host: stores `NET.remote.q` when an input arrives and adds `m.q` (the last joiner frame it has received) to that joiner's snapshots.
- Joiner: `netPredictTick(dt)` runs every frame — records the frame's input (`NET.hist`) and moves its own fighter one step with
  `predStep()` (the same walking / jumping / gravity / terrain code the host runs, incl. Gojo's float).
- `netApply` keeps the host's last word on the joiner's movement fields (`NET.auth`, `PRED_FIELDS`: x, y, vx, vy, onGround, facing,
  state, jmpDown). `netReconcile(q)`: drop inputs the host has played, reset to the host's values, re-play the rest, and ease in
  corrections under 70px (`PRED_SNAP`) instead of snapping.
- Prediction only runs in free movement states (idle / walk / air) and not for Mechamaru's jets, the stingray, Dagon's octopus,
  frames, domain freezes, clashes or slow-motion (`netCanPredict`). Everything else (attacks, abilities, hits) is still the host's.
- `NET.predOff = true` (console) turns it off for comparison.
- The bottom status line now says **DIRECT** or **VIA RELAY (slower …)** next to the ping.

**Tested**: two linked pages with 120ms of delay each way: first movement 311ms → **14ms**; after walking and a running jump the
joiner's and host's positions matched exactly; no backward steps (rubber-banding) while walking. The two-page online stress test
(10 random matchups with random inputs from both sides) ran with no errors.

**Revert**: delete the prediction block, the `q` additions in `netSendInput` / the host `in` handler / `netSnapshot`, the `NET.auth`
lines in `netApply`, the `netReconcile` call, and `netPredictTick(dt)` in the main loop.
