# Oct 24 — missing terrain fixes + performance findings

## Fix 1: terrain (and other state) lost on the relay
- Online snapshots are **deltas** (only what changed is sent). Over the relay (public MQTT brokers, QoS 0 = no resending) a lost
  message was never repaired: lose the one full-terrain message at the start and that player had the wrong / no terrain all match.
- Reproduced with a fake relay dropping 15% of messages: the joiner ended with the wrong map's terrain or 80–32,000 wrong cells in
  3 of 3 runs. After the fix: 0 wrong cells in every run (5%, 15% loss).
- `netSnapshot` numbers every snapshot (`m.n`, per connection). The joiner tracks `NET.snapN`; a gap sends `{t:'rs', full:1}` (at most
  every 0.5s) and the host clears that connection's delta cache and terrain generation, so the next snapshot is complete. Stale
  (older) snapshots are ignored.
- Revert: remove `n:` from `netSnapshot`, the `d.full` branch of the host's `rs` handler, and the gap check in `netOnHostData`.

## Fix 2: canvas memory (blank terrain on tablets / Chromebooks)
- The stage-select screen built a full-size background **and** a full-size preview (up to 2600×1200) for every map and kept them
  all: about 112MB of canvas memory before a match started. Browsers on iPads / Chromebooks cap canvas memory; past the cap, new
  canvases silently come out blank — the terrain canvas is re-created for every map, so it was the one that vanished.
- `getMapPreview` now draws previews at most 960px wide (`MAP_PREV_W`) and frees the full background it borrowed; `getMapBG` keeps only
  the current map's full background (`mapBGFree`). Measured: 112MB → 17MB at the stage select.

## Profiling (headless Chromium, Hard CPU vs Hard CPU on every map)
- Game logic + drawing calls: ~1.7–2.3ms a frame on average. One-off spikes: building a map's background (30–55ms) and its terrain
  canvas (18–49ms) at the start of a match.
- Host network snapshot: 0.24ms and ~2.3KB a frame (≈140KB/s upload per joiner at 60/s); the first one ~20KB.
- So on slow machines the cost is mostly the GPU filling big canvases every frame (and the network), not the game code.
