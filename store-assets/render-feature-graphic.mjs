/**
 * Renders feature-graphic.html → screenshots/feature-graphic.png  (1024×500)
 */
import puppeteer from 'puppeteer-core';
import path      from 'path';
import { fileURLToPath } from 'url';
import { existsSync as fsExists } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find(fsExists);

if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

const htmlFile = path.join(__dirname, 'feature-graphic.html');
const outFile  = path.join(__dirname, 'screenshots', 'feature-graphic.png');

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--window-size=1024,500', '--no-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await page.goto(`file:///${htmlFile.replace(/\\/g,'/')}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200)); // wait for web fonts
  await page.screenshot({ path: outFile, clip: { x: 0, y: 0, width: 1024, height: 500 } });
  console.log(`✅  feature-graphic.png  (1024×500)  →  ${outFile}`);
} finally {
  await browser.close();
}
