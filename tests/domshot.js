// node domshot.js OUT.png fighter [query] : the fighter's domain / ultimate about 2.5 s in
const { open } = require('./harness.js');
(async () => { const [out, a, q = ''] = process.argv.slice(2); const { b, pg } = await open({query: q});
  await pg.evaluate(([a]) => { window.__liveFight(a, a==='gojo' ? 'sukuna' : 'gojo', {map:1}); p2.x = p1.x + 200; p1.iframes = 0; p2.iframes = 0; p1.domainCharge = DOMAIN_CHARGE_REQ; p1.ce = p1.ceMax; }, [a]);
  await pg.waitForTimeout(300); await pg.evaluate(() => { window.__held.A1_ult = true; }); await pg.waitForTimeout(200); await pg.evaluate(() => { window.__held.A1_ult = false; });
  await pg.waitForTimeout(+(process.env.WAIT || 2600)); console.log(await pg.evaluate(() => [activeDomain && activeDomain.type, p1.state]));
  await pg.screenshot({path: out}); await b.close(); })();
