# Cloudflare TURN relay — setup

When two players can't link directly (school Wi-Fi, strict routers), WebRTC sends the game through a **TURN relay**.
The free public relays the game used before are shared with the whole internet and often overloaded. This sets up
our own relay on Cloudflare's network.

- **Cost**: the first 1,000 GB a month are free (shared with Cloudflare's SFU), then $0.05 per GB. A relayed match uses about
  0.5 GB an hour (the host sends ~140 KB/s), so ~2,000 relayed match-hours a month are free. Direct links don't use it at all.
- **How it works**: `turn-worker.js` is a tiny Cloudflare Worker. It holds the TURN key as a secret and hands the game a login that
  expires after 24 hours. The game fetches one when the page loads (`TURN_ENDPOINT` in `index.html`). If the Worker is down,
  the game uses the old public relays, so nothing breaks.

## Setup (about 10 minutes)

1. **Account** — sign up at <https://dash.cloudflare.com/sign-up> (free plan).
2. **TURN key** — in the dashboard open **Realtime** (older menus call it **Calls**) → **TURN Server** → **Create**. Name it
   `cursed-clash`. Copy the two values it shows: the **key / token ID** and the **API token**. The API token is only
   shown once.
3. **Worker** — **Workers & Pages** → **Create** → **Create Worker** (the "Hello World" one) → name it `cursed-clash-turn` →
   **Deploy**. Then **Edit code**, delete everything, paste in all of `turn-worker.js`, and click **Deploy**.
4. **Secrets** — on the Worker: **Settings** → **Variables and Secrets** → **Add**:
   - `TURN_KEY_ID` (type *Text*) = the key / token ID from step 2
   - `TURN_KEY_API_TOKEN` (type *Secret*) = the API token from step 2
   Save / deploy.
5. **Check it** — the Worker's address looks like `https://cursed-clash-turn.<your-name>.workers.dev`. Opening it directly in a
   browser tab shows `{"error":"origin not allowed"}`. That's correct: it only answers the game's own site.
6. **Turn it on** — set `TURN_ENDPOINT` in `index.html` to that address (or send it to Claude), commit and push.

### Test before switching it on
Open the game with `?turn=<worker address>&turnonly=1` on both computers, e.g.
`https://waterloolou.github.io/Cursed_Clash/?turn=https://cursed-clash-turn.<you>.workers.dev&turnonly=1`.
`turnonly=1` forces every link through the relay. Host and join: the bottom line should say **VIA CLOUDFLARE**.

### Keep an eye on it
- **Billing → Notifications**: add a usage / billing alert, so a surprise bill can't happen.
- Other websites can't use the Worker from a browser (it checks the `Origin`), but a script could. If usage ever looks odd,
  regenerate the TURN key's API token and update the secret.
- Allow another site (e.g. a test copy): add a Text variable `ALLOWED_ORIGINS` = `https://waterloolou.github.io,https://other.site`.
  `localhost` is always allowed.

## Revert
Set `TURN_ENDPOINT = ''` in `index.html`. The game goes back to the public relays.
