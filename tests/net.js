// Online play test: a host and a joiner in two browser pages, linked through a local signaling server (real WebRTC).
// The host's fighter is played by the CPU, the joiner mashes keys. Several times per matchup the host is frozen and the two
// screens are compared exactly: phase, lives, health, positions, every synced array and the terrain. Then the same again with
// LOSS% of the joiner's snapshots thrown away (what a lossy relay does).
//   node net.js [matchups=5] [--loss=15]
const http = require('http'), fs = require('fs'), path = require('path'); const H = require('./harness.js');
const N = +(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 5), LOSS = +((process.argv.find(a => a.startsWith('--loss=')) || '').split('=')[1] || 0);
const PAIRS = [['gojo','geto'],['mechamaru','megumi'],['dagon','hanami'],['toji','yuta'],['sukuna','mahito'],['jogo','choso'],['todo','naoya'],['yuki','hakari']];
(async () => {
  const { ExpressPeerServer } = require('peer'), express = require('express'); const app = express(), ps = http.createServer(app).listen(9311, '127.0.0.1'); app.use('/', ExpressPeerServer(ps, {path: '/'}));   // (bound to IPv4: some sandboxes have no IPv6)
  const root = path.dirname(H.GAME); const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/' + path.basename(H.GAME)));
    fs.readFile(f, (e, d) => { if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'Content-Type': f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream'}); r.end(d); }); }).listen(9312, '127.0.0.1');
  const b = await H.chromium.launch({args: ['--mute-audio']}); const ctx = await b.newContext({viewport: {width: 1000, height: 600}});
  const errs = {H: [], G: []}; const mk = async n => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs[n].push(e.message)); pg.on('console', m => { if(m.type()==='error' && !/favicon|404|net::|WebSocket|mqtt|Failed to load/i.test(m.text())) errs[n].push(m.text()); });
    await pg.goto('http://127.0.0.1:9312/?peerhost=127.0.0.1&peerport=9311&mqtt=wss://127.0.0.1:1/x&turn=0'); await pg.waitForFunction(() => typeof CPU_BOT!=='undefined'); await pg.addScriptTag({path: path.join(__dirname, 'arena.js')}); return pg; };
  const Hp = await mk('H'), Gp = await mk('G'); let bad = 0; const fail = m => { bad++; console.log('FAIL', m); };
  await Hp.evaluate(() => document.getElementById('btnHost').click());
  await Hp.waitForFunction(() => NET.code && NET.peer && NET.peer.open, null, {timeout: 20000}).catch(() => {});
  const code = await Hp.evaluate(() => NET.code);
  await Gp.evaluate(c => { document.getElementById('joinCode').value = c; document.getElementById('btnJoin').click(); }, code);
  await Gp.waitForFunction(() => !!NET.host && NET.role==='guest', null, {timeout: 25000}).catch(() => {});
  if(!(await Gp.evaluate(() => !!NET.host))){ console.log('NET FAILED: could not connect'); process.exit(1); }
  if(LOSS) await Gp.evaluate(L => { const f = netOnHostData; let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647; netOnHostData = function(d){ if(d && d.t==='s' && r() < L/100) return; return f(d); }; }, LOSS);
  const snap = () => { const srt = v => Array.isArray(v) ? v.map(srt) : (v && typeof v==='object') ? Object.fromEntries(Object.keys(v).sort().map(k => [k, srt(v[k])])) : v; const enc = v => JSON.stringify(srt(netEnc(v, 0))); const o = {phase, l:[p1lives, p2lives], map: mapIdx};
    for(const [n, pl] of [['p1', p1], ['p2', p2]]) if(pl) o[n] = [pl.type, Math.round(pl.hp*10)/10, pl.state, Math.round(pl.x), Math.round(pl.y), Math.round(pl.ce||0), Math.round(pl.domainCharge||0)];
    o.arr = {}; for(const k in SYNC_ARR) if(SYNC_ARR[k].length) o.arr[k] = enc(SYNC_ARR[k]);
    let h = 0; for(let i = 0; i < terCur.length; i++) h = (h * 31 + terCur[i]) | 0; o.ter = h; o.dom = activeDomain ? activeDomain.type : null; return o; };
  const keys = ['KeyA','KeyD','KeyW','KeyJ','KeyK','KeyL','KeyU','KeyI','KeyC','KeyP','KeyV','KeyS']; let seed = 99; const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  for(let i = 0; i < N; i++){ const [a, o] = PAIRS[i % PAIRS.length], map = [0, 1, 2, 4, 5][i % 5];
    await Hp.evaluate(([a, o, map]) => { p1CharIdx = CHARACTERS.findIndex(x => x.type===a); p2CharIdx = CHARACTERS.findIndex(x => x.type===o); mapIdx = map; gameMode = 'normal'; charBans = {1:null, 2:null};
      p1Confirmed = true; p2Confirmed = true; window._bothConfirmedTimer = 1190; paused = false; phase = 'charSelect'; }, [a, o, map]);
    await Hp.waitForFunction(() => phase==='fight', null, {timeout: 15000}).catch(() => {});
    await Hp.evaluate(() => window.__netBot(true));
    for(let c = 0; c < 4; c++){
      const until = Date.now() + 4500; let down = [];
      while(Date.now() < until){ for(const k of down) await Gp.keyboard.up(k); down = keys.filter(() => rnd() < 0.22); for(const k of down) await Gp.keyboard.down(k); await Gp.waitForTimeout(120 + rnd()*200);
        if(rnd() < 0.3) await Hp.evaluate(() => { for(const pl of [p1, p2]) if(pl){ pl.domainCharge = Math.max(pl.domainCharge||0, DOMAIN_CHARGE_REQ*0.9); } }); }
      for(const k of down) await Gp.keyboard.up(k);
      await Hp.evaluate(() => { paused = true; }); await Gp.waitForTimeout(LOSS ? 1500 : 700);
      const [hs, gs] = [await Hp.evaluate(snap), await Gp.evaluate(snap)];
      // the joiner predicts its own fighter's movement, so its position may lead the host's by a few frames: compare that one loosely
      if(hs.p2 && gs.p2 && Math.abs(hs.p2[3] - gs.p2[3]) < 90 && Math.abs(hs.p2[4] - gs.p2[4]) < 90 && [hs.p2[2], gs.p2[2]].every(st => ['idle','walk','air'].includes(st))){ gs.p2[2] = hs.p2[2]; gs.p2[3] = hs.p2[3]; gs.p2[4] = hs.p2[4]; }
      // the host's numbers are sent rounded to 2 decimals: allow that much
      for(const k of ['p1','p2']) if(hs[k] && gs[k] && hs[k].length===gs[k].length) hs[k].forEach((v, i) => { if(typeof v==='number' && typeof gs[k][i]==='number' && Math.abs(v - gs[k][i]) <= (i===1 ? 0.11 : 1)) gs[k][i] = v; });
      const diff = []; for(const k of ['phase','l','map','p1','p2','ter','dom']) if(JSON.stringify(hs[k])!==JSON.stringify(gs[k])) diff.push(`${k}: host ${JSON.stringify(hs[k])} joiner ${JSON.stringify(gs[k])}`);
      for(const k of new Set([...Object.keys(hs.arr), ...Object.keys(gs.arr)])) if(hs.arr[k]!==gs.arr[k]) diff.push(`array ${k}: host ${(hs.arr[k]||'').slice(0, 140)} | joiner ${(gs.arr[k]||'').slice(0, 140)}`);
      if(diff.length) fail(`${a} vs ${o} check ${c+1}: ` + diff.slice(0, 3).join(' ;; '));
      await Hp.evaluate(() => { paused = false; if(phase!=='fight'){ p1.reset(); p2.reset(); p1lives = 3; p2lives = 3; winner = null; roundWinner = null; phase = 'fight'; } });
    }
    await Hp.evaluate(() => window.__netBot(false));
  }
  // F2 / F4 online: both meters show a real ping and the link type; a finished match gives both screens the same results table
  { const [hm, gm] = [await Hp.evaluate(() => meterText()), await Gp.evaluate(() => meterText())];
    for(const [who, m] of [['host', hm], ['joiner', gm]]) if(!/PING [1-9]\d* ms · (DIRECT|RELAY|CLOUDFLARE|BACKUP RELAY)/.test(m)) fail(`${who} meter shows no ping / link: ${m}`);
    await Hp.evaluate(() => { paused = false; p2lives = 1; p2.hp = 0; }); await Hp.waitForFunction(() => phase==='end', null, {timeout: 15000}).catch(() => {}); await Gp.waitForTimeout(1500);
    const [hr, gr] = [await Hp.evaluate(() => JSON.stringify(mstPub())), await Gp.evaluate(() => phase==='end' && typeof MST!=='undefined' ? JSON.stringify(MST.pub || null) : 'joiner not on the results screen')];
    if(!gr || gr==='null' || JSON.stringify(JSON.parse(hr))!==JSON.stringify(JSON.parse(gr.startsWith('{') ? gr : '{}'))) fail(`results differ — host ${hr} joiner ${gr}`); }
  if(errs.H.length || errs.G.length) fail('errors — host: ' + errs.H.slice(0, 3).join(' | ') + ' — joiner: ' + errs.G.slice(0, 3).join(' | '));
  console.log(bad ? `NET FAILED (${bad})` : `NET OK (${N} matchups × 4 exact comparisons${LOSS ? `, ${LOSS}% of snapshots dropped` : ''})`);
  await b.close(); srv.close(); try{ ps.close && ps.close(); }catch(e){} process.exit(bad ? 1 : 0); })();
