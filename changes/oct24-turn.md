# Oct 24 — Cloudflare TURN relay

## What changed
- **New `server/turn-worker.js`**: a Cloudflare Worker that calls Cloudflare's TURN API
  (`POST rtc.live.cloudflare.com/v1/turn/keys/<id>/credentials/generate-ice-servers`, ttl 24h) with the secret API token. It
  returns `{iceServers}` to the game, drops port-53 URLs (browsers block them), and only answers the game's site (`Origin` check;
  `ALLOWED_ORIGINS` var; localhost is always allowed). Setup: `server/README.md`.
- **`index.html`** (search `Cloudflare TURN relay (Oct 24)`):
  - `TURN_ENDPOINT` (the Worker URL; empty = off), `TURN`, `turnURL()`, `turnFetch()` (4s timeout, cached 12h), `turnReady(ms)`.
    Fetched once at page load.
  - `peerOpts()` puts the Cloudflare servers first. When they're there, the overloaded Metered Open Relay and the duplicate
    Cloudflare STUN entry are dropped. PeerJS's TURN stays as a backup.
  - `netHost` waits up to 1.5s for the login before creating the Peer (split into `netHostPeer`). `netJoin(code, turnWaited)` does
    the same. Both skip the wait when the login is already there (the usual case) or no endpoint is set.
  - `netRouteCheck(conn)`: 1.5s after a link opens, reads WebRTC stats for the selected candidate pair. A `relay` candidate on
    turn.cloudflare.com → `conn.route = 'cf'`, another relay → `'turn'`, otherwise `'direct'`.
  - Status line: DIRECT / VIA CLOUDFLARE / VIA RELAY / VIA BACKUP RELAY (the MQTT fallback, renamed from "VIA RELAY"). Wiki
    "Lag" paragraph updated.
  - URL switches: `?turn=<url>` overrides the endpoint, `?turn=0` disables it, `?turnonly=1` sets `iceTransportPolicy:'relay'`
    (forces the relay, for testing).

## Tests
- A local stack: PeerJS server, a TURN server (node-turn), the real Worker code run in Node against a mocked Cloudflare API, and two
  Chromium pages linked with real WebRTC.
  - Worker: returns the servers with the port-53 URL removed; 403 for another site; CORS preflight 204.
  - With the Worker: ICE list starts with its servers, link DIRECT.
  - `turnonly=1`: linked through the TURN server (route `turn`), snapshots flowing (~330 in 3s), rtt 14ms.
  - Worker unreachable: falls back to the old list, link DIRECT. No endpoint: unchanged.
- `errs.js` clean; `net2.js` (MQTT relay, 3 matchups) bad 0.

## Revert
`TURN_ENDPOINT = ''` turns it off. To remove it fully: delete the `Cloudflare TURN relay (Oct 24)` block and `netRouteCheck`, restore the
old `peerOpts` list (Google STUN ×2, Cloudflare STUN, PeerJS TURN, Metered Open Relay), merge `netHostPeer` back into `netHost`,
and remove the `turnWaited` line in `netJoin`.
