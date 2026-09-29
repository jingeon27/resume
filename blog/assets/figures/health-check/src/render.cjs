// 사용법: node render.cjs [파일명.html ...]  (인자가 없으면 src 의 모든 .html)
// 결과: ../<이름>.png (2배율 원본), ../<이름>.jpg 는 sips 로 따로 만든다.
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(
  require.resolve('playwright', { paths: ['/Users/gimjingeon/Desktop/feedback-loof/projects/safedoc-usermall'] }),
);

(async () => {
  const srcDir = __dirname;
  const outDir = path.resolve(srcDir, '..');
  const targets = process.argv.slice(2).length
    ? process.argv.slice(2)
    : fs.readdirSync(srcDir).filter((f) => f.endsWith('.html')).sort();

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 760, height: 600 }, deviceScaleFactor: 2 });

  for (const file of targets) {
    await page.goto('file://' + path.join(srcDir, file));
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(outDir, file.replace(/\.html$/, '.png'));
    await page.screenshot({ path: out, fullPage: true });
    console.log('rendered', path.basename(out));
  }
  await browser.close();
})();
