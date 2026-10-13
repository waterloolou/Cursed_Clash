# Quality agent log — visuals, maps, character functionality

Base: commit `a38e8a4` = the lead's uncommitted working copy (`/home/claude/cursed_clash/index.html`, 18897 lines) copied into this worktree unchanged, because the worktree branch started from the older `06900b8` without the Yuji rework / Sendai / Kamutoke. Every entry below is relative to that base.

Screenshots: `before/` and `after/` folders in `/tmp/claude-0/-home-claude-cursed-clash/fe3ac253-72d5-5c1c-8fd0-50fac4b1bef1/scratchpad/q/`.

## Changes

### 1. Sendai: hard-edged blue rectangle in the sky
- **Why**: `drawMapAmbient` (map 4) pulsed the torn-sky area with `ctx.fillRect(1500, 0, 600, 600)` in flat translucent blue — on screen it was a clearly visible lighter rectangle with straight edges around the sky fracture (before/map4_x97.png, map4_wide.png).
- **Where**: `drawMapAmbient`, `i===4` branch.
- **Old**: `ctx.fillStyle = \`rgba(120,190,255,${0.03+0.02*Math.sin(t*0.0015)})\`; ctx.fillRect(1500, 0, 600, 600);`
- **New**: a radial gradient centred on the fracture (1750, 260), radius 320, alpha `0.07+0.04*sin` → 0, filled over `1430,-60,640,640`. Same pulse, no edges.
