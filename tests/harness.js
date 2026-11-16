// Shared test harness: opens the game in headless Chromium (Playwright) and exposes helpers.
//   GAME=/path/to/index.html overrides which build is tested (default: ../index.html)
const path = require('path'), fs = require('fs');
if(!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
let chromium; try{ ({chromium} = require('playwright')); }catch(e){ ({chromium} = require('/opt/npm-tools/node_modules/playwright')); }
const GAME = path.resolve(process.env.GAME || path.join(__dirname, '..', 'index.html'));
const IGNORE = /favicon|ERR_|Failed to load resource|net::|peerjs|mqtt|WebSocket|fonts\.g|AudioContext|autoplay/i;

async function open(opts = {}){
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio', ...(opts.args || [])]});
  const ctx = await b.newContext({viewport: opts.viewport || {width:1280, height:720}});
  const pg = await ctx.newPage(); const errs = [];
  // track every canvas the game creates (for memory checks); noRaf: the test drives frames itself
  await pg.addInitScript((noRaf) => { const ce = document.createElement.bind(document); window.__canvases = [];
    document.createElement = function(t, o){ const e = ce(t, o); if(String(t).toLowerCase()==='canvas') window.__canvases.push(e); return e; };
    if(noRaf) window.requestAnimationFrame = () => 0; }, !!opts.noRaf);
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if(m.type()==='error' && !IGNORE.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await pg.goto('file://' + GAME + (opts.query || ''));
  await pg.waitForFunction(() => typeof CPU_BOT!=='undefined' && typeof CHARACTERS!=='undefined', null, {timeout: 30000});
  await pg.addScriptTag({path: path.join(__dirname, 'arena.js')});
  return {b, ctx, pg, errs};
}
const ev = (pg, fn, arg) => pg.evaluate(fn, arg);
// start a live (real-time, rendered) fight: a vs b, online rules or classic, on a map. Both sides idle unless cpu:true.
async function fight(pg, a, b, online = true, map = 0, cpu = false){
  await pg.evaluate(([a, b, online, map, cpu]) => window.__liveFight(a, b, {online, map, cpu}), [a, b, online, map, cpu]);
  await pg.waitForTimeout(120);
}
// press / hold a game action for a player: name like 'A1_ab1'
async function hold(pg, name, on){ await pg.evaluate(([n, on]) => { window.__held[n] = on; }, [name, on]); }
async function press(pg, name, ms = 60){ await hold(pg, name, true); await pg.waitForTimeout(ms); await hold(pg, name, false); }
module.exports = {open, ev, fight, hold, press, GAME, chromium};
