// node wikishot.js OUT.png page  : open the wiki on a page and screenshot it
const { open } = require('./harness.js');
(async () => { const [out, page = 'overview'] = process.argv.slice(2); const { b, pg } = await open();
  await pg.click('#btnWiki'); await pg.waitForTimeout(200); await pg.click(`.wk-nav a[data-p="${page}"]`); await pg.waitForTimeout(300); await pg.screenshot({path: out}); await b.close(); })();
