import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.env.ARTICLE_TEST_URL ?? 'http://localhost:3198';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

try {
  for (const locale of ['de', 'fr']) {
    const gallery = JSON.parse(fs.readFileSync(`data/galleries/wild-resorts.${locale}.json`, 'utf8'));
    const translations = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, 'utf8'));
    for (const width of [320, 390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
      // Never send real ad requests or generate impressions during automated checks.
      await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
      await context.addInitScript(() => {
        const listeners = new Map();
        const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(fn => fn({ slot, ...extra }));
        const state = {
          requests: [], active: null,
          grant() {
            const slot = this.active;
            emit('rewardedSlotGranted', slot);
            emit('rewardedSlotClosed', slot);
            this.active = null;
          },
        };
        const pubads = {
          addEventListener(name, fn) { listeners.set(name, [...(listeners.get(name) ?? []), fn]); },
          removeEventListener() {}, updateCorrelator() {},
        };
        window.galleryTest = state;
        window.googletag = {
          cmd: { push(fn) { fn(); } }, pubads: () => pubads,
          enableServices() {}, setConfig() {}, destroySlots() {},
          enums: { OutOfPageFormat: { REWARDED: 'REWARDED', INTERSTITIAL: 'INTERSTITIAL' } },
          defineOutOfPageSlot(path, format) {
            state.requests.push({ path, format });
            return { path, format, addService() { return this; } };
          },
          display(slot) {
            queueMicrotask(() => emit('rewardedSlotReady', slot, { makeRewardedVisible() { state.active = slot; } }));
          },
        };
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let documents = 0;
      page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++; });
      const path = `/${locale}/wild-resorts`;
      const response = await page.goto(`${base}${path}?fbclid=local-test&utm_source=local-test`);
      assert.equal(response.status(), 200);
      await page.waitForFunction(() => !document.querySelector('.gallery-article__entry-preview'));
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      assert.equal(await dialog.getByRole('heading', { level: 1 }).innerText(), gallery.landing.popupTitle);
      const button = dialog.getByRole('button', { name: gallery.landing.cta, exact: true });
      assert.equal(await button.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(220, 38, 38)');
      const bounds = await button.boundingBox();
      assert(bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y + bounds.height <= 844);
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://therainbowhub.com${path}`);
      for (const alternate of ['en', 'de', 'fr'])
        assert.equal(await page.locator(`link[rel="alternate"][hreflang="${alternate}"]`).count(), 1);
      assert.equal(await page.evaluate(() => window.galleryTest.requests.length), 0, 'no preload');
      await button.click();
      await page.waitForFunction(() => window.galleryTest.active !== null);
      assert((await button.innerText()).includes(translations.ad.loading));
      await page.evaluate(() => window.galleryTest.grant());
      const intro = page.locator('.gallery-article__introduction');
      await intro.waitFor();
      assert.equal(await intro.locator('h1').innerText(), gallery.landing.title);
      assert.deepEqual(await intro.locator('p').allTextContents(), gallery.gallery.introduction);
      await intro.getByRole('button', { name: gallery.gallery.continueLabel, exact: false }).click();
      await page.waitForFunction(() => window.galleryTest.active !== null);
      await page.evaluate(() => window.galleryTest.grant());
      const article = page.locator('.gallery-article__article');
      await article.waitFor();
      const sections = article.locator('.gallery-article__section');
      assert.equal(await sections.count(), 53);
      for (const [index, item] of gallery.items.entries()) {
        const section = sections.nth(index);
        assert.equal(await section.getAttribute('id'), item.id);
        assert.equal(await section.locator('h2').innerText(), item.title);
        assert.deepEqual(await section.locator('p').allTextContents(), item.paragraphs);
      }
      assert.deepEqual(await page.evaluate(() => window.galleryTest.requests), Array(2).fill({ path: '/22677279144/rewarded', format: 'REWARDED' }));
      assert.equal(documents, 1, 'both gates stay in the SPA');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.reload();
      await article.waitFor();
      assert.equal(await page.evaluate(() => window.galleryTest.requests.length), 0, 'unlock persists');
      await page.evaluate(() => sessionStorage.clear());
      await page.goto(`${base}${path}`);
      await intro.waitFor();
      assert.equal(await page.getByRole('dialog').count(), 0, 'no fbclid bypasses the popup');
      assert.deepEqual(errors, []);
      console.log(`${locale} ${width}px PASS: localized popup, loading and intro; 53 sections; two rewarded gates; no interstitials; canonical and alternates.`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
