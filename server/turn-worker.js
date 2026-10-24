// Cursed Clash — TURN credential Worker (Cloudflare Workers)
//
// The game asks this Worker for short-lived TURN logins, then uses Cloudflare's TURN relay whenever two players can't
// link directly (school Wi-Fi, strict routers). The long-term TURN key never leaves Cloudflare: it lives in this Worker's
// secrets, and the browser only ever sees a login that expires after TTL seconds.
//
// Needs two settings on the Worker (Settings → Variables and Secrets):
//   TURN_KEY_ID          (text)    — the TURN key's ID
//   TURN_KEY_API_TOKEN   (secret)  — the TURN key's API token
// Optional:
//   ALLOWED_ORIGINS      (text)    — comma-separated sites allowed to ask; default https://waterloolou.github.io
//
// Setup steps: server/README.md

const TTL = 86400;   // a login lasts 24h — longer than any session

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || 'https://waterloolou.github.io').split(',').map(s => s.trim()).filter(Boolean);
    const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const ok = allowed.includes(origin) || local;
    const cors = {
      'Access-Control-Allow-Origin': ok ? origin : allowed[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Vary': 'Origin',
      'Cache-Control': 'no-store',
    };
    const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    // Other websites can't borrow the relay from a browser (this doesn't stop scripts — keep a usage alert on the account)
    if (!ok) return json({ error: 'origin not allowed' }, 403);
    if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return json({ error: 'TURN_KEY_ID / TURN_KEY_API_TOKEN not set on the Worker' }, 500);

    let r;
    try {
      r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: TTL }),
      });
    } catch (e) {
      return json({ error: 'could not reach Cloudflare TURN' }, 502);
    }
    if (!r.ok) return json({ error: 'Cloudflare TURN refused the key', status: r.status }, 502);

    const data = await r.json();
    const list = Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers];
    // Browsers block port 53, so a URL on it just times out — drop it
    const iceServers = list.filter(Boolean).map(s => ({ ...s, urls: [].concat(s.urls).filter(u => !/:53(\?|$)/.test(u)) }));
    return json({ iceServers, ttl: TTL });
  },
};
