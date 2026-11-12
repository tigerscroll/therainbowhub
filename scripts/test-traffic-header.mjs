import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3198';
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
const scenarios = [
  ['/', '', false], ['/', '?fbclid=test', true], ['/', '?gclid=test', true],
  ['/', '?gbraid=test', true], ['/', '?wbraid=test', true],
  ['/', '?GCLID=test', true], ['/', '?GBRAID=test', true], ['/', '?WBRAID=test', true],
  ['/', '?utm_source=google', false], ['/', '?redirect=%3Fgclid%3Dtest', false],
  ['/info/about', '?gclid=test', true], ['/ja/perfectly-timed', '?wbraid=test', true],
];
try {
  for (const blocked of [false, true]) for (const [path, query, hidden] of scenarios) {
    const context = await browser.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let release;
    const ready = new Promise(resolve => {release = resolve;});
    await context.route('**/*', async route => {
      if (new URL(route.request().url()).origin !== new URL(base).origin) return route.abort();
      if (route.request().resourceType() === 'script' && new URL(route.request().url()).pathname.startsWith('/_next/')) await ready;
      await route.continue();
    });
    await context.addInitScript(blocked => {
      if (blocked) {
        Storage.prototype.getItem = () => {throw Error('Storage blocked');};
        Storage.prototype.setItem = () => {throw Error('Storage blocked');};
      }
      window.headerPaintFrames = [];
      const record = () => {
        const header = document.querySelector('.hub-header');
        if (header) window.headerPaintFrames.push(getComputedStyle(header).display === 'none');
        requestAnimationFrame(record);
      };
      requestAnimationFrame(record);
    }, blocked);
    await page.goto(`${base}${path}${query}`, {waitUntil: 'commit'});
    await page.locator('.hub-header').waitFor({state: 'attached'});
    assert.equal(await page.locator('html').evaluate(node => node.classList.contains('fbclid-traffic')), hidden, 'head bootstrap chooses visibility before hydration');
    await page.waitForFunction(hidden => {
      const height = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height'));
      return hidden ? height === 0 : height > 0;
    }, hidden);
    assert.equal(await page.locator('.hub-header').isVisible(), !hidden);
    release();
    // This inline Script is mounted after hydration by the shared root.
    await page.locator('#meta-pixel').waitFor({state: 'attached'});
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.locator('.hub-header').isVisible(), !hidden, 'hydration preserves visibility');
    const frames = await page.evaluate(() => window.headerPaintFrames);
    assert(frames.length > 0);
    assert(frames.every(value => value === hidden), 'no header flash before or after hydration');
    if (!blocked && path === '/' && query === '?gclid=test') {
      await page.locator('footer a[href="/info/about"]').first().click();
      await page.waitForURL('**/info/about');
      assert.equal(await page.locator('.hub-header').isVisible(), false, 'SPA navigation without attribution retains this session');
      await page.reload();
      await page.locator('.hub-header').waitFor({state: 'attached'});
      assert.equal(await page.locator('.hub-header').isVisible(), false, 'full reload without attribution retains this session');
    }
    assert.deepEqual(errors, []);
    console.log(`${path}${query || ' (direct)'} storage=${blocked ? 'blocked' : 'enabled'} PASS: correct header before/after hydration, no flash.`);
    await context.close();
  }
} finally {await browser.close();}
