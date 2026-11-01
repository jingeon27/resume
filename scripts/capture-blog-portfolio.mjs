import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'assets/portfolio-blog');
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = createRequire(join(root, '../side-project/package.json'))('playwright'));
}

mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];
const capture = async (page, filename) => {
  await page.evaluate(() => document.fonts.ready);
  const path = join(output, filename);
  await page.screenshot({ path, fullPage: false });
  captures.push({
    file: filename,
    url: page.url(),
    title: await page.title(),
    viewport: page.viewportSize(),
    capturedAt: new Date().toISOString(),
    sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
  });
};

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const response = await page.goto('https://blog.bambyul.com/ko/blog', { waitUntil: 'networkidle' });
  if (response?.status() !== 200) throw new Error(`Blog list status: ${response?.status()}`);
  const articleUrl = await page.locator('main a[href*="/ko/blog/"]').evaluateAll((links) => {
    const article = links.find((link) => {
      const path = new URL(link.href).pathname;
      return path.startsWith('/ko/blog/') && !/\/(category|tag|page)\//.test(path);
    });
    return article?.href;
  });
  if (!articleUrl) throw new Error('No article link found on the live blog list');
  await capture(page, '01-blog-list-desktop.png');

  await page.setViewportSize({ width: 430, height: 932 });
  const articleResponse = await page.goto(articleUrl, { waitUntil: 'networkidle' });
  if (articleResponse?.status() !== 200) throw new Error(`Article status: ${articleResponse?.status()}`);
  await capture(page, '02-blog-article-mobile.png');
  await context.close();
  writeFileSync(join(output, 'manifest.json'), `${JSON.stringify({
    source: 'Public production website; anonymous browser with no saved sign-in',
    pixelEdits: false,
    captures,
  }, null, 2)}\n`);
  console.log(JSON.stringify(captures.map(({ file, url, title }) => ({ file, url, title })), null, 2));
} finally {
  await browser.close();
}
