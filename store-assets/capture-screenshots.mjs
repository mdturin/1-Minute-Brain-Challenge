/**
 * Store screenshot capture – 1 Minute Brain Challenge
 * Captures: Home, Gameplay, Game-Over screens at 390×844 (2× devicePixelRatio)
 *
 * Run:  node store-assets/capture-screenshots.mjs
 * Pre:  Expo web dev server running on http://localhost:8082
 */

import puppeteer from 'puppeteer-core';
import path      from 'path';
import { fileURLToPath } from 'url';
import { existsSync }    from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'screenshots');
const APP = 'http://localhost:8082';
const W = 390, H = 844;

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find(existsSync);

if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

// ── helpers ────────────────────────────────────────────────────────────────

const delay = ms => new Promise(r => setTimeout(r, ms));

async function waitText(page, text, ms = 8000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    if (await page.evaluate(t => document.body.innerText.includes(t), text)) return;
    await delay(250);
  }
  throw new Error(`Timed out waiting for text: "${text}"`);
}

async function pressButton(page, label) {
  await page.evaluate(label => {
    const btn = [...document.querySelectorAll('div')].find(d =>
      window.getComputedStyle(d).cursor === 'pointer' &&
      d.textContent.trim() === label &&
      d.children.length <= 2
    );
    if (!btn) throw new Error('Button not found: ' + label);
    const { left, top, width, height } = btn.getBoundingClientRect();
    const cx = left + width / 2, cy = top + height / 2;
    ['pointerdown','pointerup','click'].forEach(type =>
      btn.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true,
        clientX: cx, clientY: cy, pointerId: 1, isPrimary: true }))
    );
  }, label);
  await delay(700);
}

async function pressFirstGameOption(page) {
  const label = await page.evaluate(() => {
    // find the first option button inside the puzzle card
    const btn = [...document.querySelectorAll('div')].find(d => {
      const s = window.getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return s.cursor === 'pointer' && d.children.length === 1 &&
             r.width > 150 && r.height > 20;
    });
    return btn?.textContent.trim() ?? null;
  });
  if (label) await pressButton(page, label);
  return label;
}

// ── main ───────────────────────────────────────────────────────────────────

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [`--window-size=${W},${H+100}`, '--no-sandbox', '--disable-web-security'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });

  // ── Load ────────────────────────────────────────────────────────────────
  console.log('Loading app…');
  await page.goto(APP, { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(1500);

  // skip onboarding if shown
  const onHome = async () => (await page.evaluate(() => document.body.innerText)).includes('CHOOSE YOUR CHALLENGE');
  if (!await onHome()) {
    await pressButton(page, 'Skip').catch(() => {});
    await delay(600);
  }

  // ── Screenshot 1: Home ──────────────────────────────────────────────────
  await waitText(page, 'CHOOSE YOUR CHALLENGE');
  await page.screenshot({ path: `${OUT}/01-home.png` });
  console.log('✅  01-home.png');

  // ── Start Easy game ─────────────────────────────────────────────────────
  await pressButton(page, 'Play Easy');
  await waitText(page, 'Time Left');
  await delay(400); // let first puzzle render

  // ── Screenshot 2: Gameplay (first puzzle) ───────────────────────────────
  await page.screenshot({ path: `${OUT}/02-gameplay-q1.png` });
  console.log('✅  02-gameplay-q1.png');

  // Answer Q1 to show feedback toast + Q2
  await pressFirstGameOption(page);
  await delay(300);

  // ── Screenshot 3: Gameplay with feedback toast (score update) ───────────
  await page.screenshot({ path: `${OUT}/03-gameplay-feedback.png` });
  console.log('✅  03-gameplay-feedback.png');

  // Answer remaining questions quickly to build up score
  for (let i = 0; i < 4; i++) {
    await pressFirstGameOption(page);
  }

  // ── Wait for Easy timer (60 s) to expire ────────────────────────────────
  console.log('⏳  Waiting for 60 s timer to expire…');
  await waitText(page, 'Game Over!', 70000);
  await delay(500);

  // ── Screenshot 4: Game Over / Results ───────────────────────────────────
  await page.screenshot({ path: `${OUT}/04-game-over.png` });
  console.log('✅  04-game-over.png');

} finally {
  await browser.close();
}

console.log(`\nAll screenshots saved to ${OUT}`);
