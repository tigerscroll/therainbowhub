import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

// Local export only. External traffic is blocked; GPT is mocked, not live-served.
const base = process.env.ARTICLE_TEST_URL ?? 'http://localhost:3198';
const locales = (process.env.ARTICLE_LOCALES ?? 'th,hi,tr,id,bn,fil,vi,ur,ms,ja').split(',');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  for (const locale of locales) {
    const article = JSON.parse(fs.readFileSync(`data/galleries/perfectly-timed.${locale}.json`, 'utf8'));
    const shared = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, 'utf8'));
    for (const width of [320, 390]) {
      const context = await browser.newContext({ viewport: { width, height: width === 320 ? 568 : 844 }, reducedMotion: 'reduce' });
      await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
      await context.addInitScript(() => {
        const listeners = new Map();
        const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(fn => fn({ slot, ...extra }));
        const state = {
          requests: [], conversions: [], active: null,
          grant() { const slot = this.active; emit('rewardedSlotGranted', slot); emit('rewardedSlotClosed', slot); this.active = null; },
        };
        window.articleLocaleTest = state;
        window.gtag = (command, name, payload) => {if (command === 'event' && name === 'conversion') state.conversions.push(payload);};
        const pubads = {
          addEventListener(name, fn) { listeners.set(name, [...(listeners.get(name) ?? []), fn]); },
          removeEventListener(name, fn) { listeners.set(name, (listeners.get(name) ?? []).filter(item => item !== fn)); },
          updateCorrelator() {},
        };
        window.googletag = {
          cmd: { push(fn) { fn(); } }, pubads: () => pubads,
          enableServices() {}, setConfig() {}, destroySlots() {},
          enums: { OutOfPageFormat: { REWARDED: 'REWARDED', INTERSTITIAL: 'INTERSTITIAL' } },
          defineOutOfPageSlot(path, format) { state.requests.push({ path, format }); return { path, format, addService() { return this; } }; },
          display(slot) { queueMicrotask(() => emit('rewardedSlotReady', slot, { makeRewardedVisible() { state.active = slot; return true; } })); },
        };
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/${locale}/perfectly-timed?fbclid=local-locale-test`);
      await page.waitForFunction(() => !document.querySelector('.gallery-article__entry-preview'));
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.equal(await page.locator('html').getAttribute('dir'), locale === 'ur' ? 'rtl' : 'ltr');
      assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), article.metadata.description);
      assert.equal(await page.locator(`link[rel="alternate"][hreflang="${locale}"]`).count(), 1, 'localized SEO alternative exists');
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('heading', { name: article.landing.popupTitle, exact: true }).waitFor();
      if (['th', 'hi', 'bn', 'ur'].includes(locale)) {
        const typography = await dialog.locator('h1').evaluate(node => { const style = getComputedStyle(node); return { tracking: style.letterSpacing, leading: parseFloat(style.lineHeight) / parseFloat(style.fontSize) }; });
        assert.equal(typography.tracking, 'normal', `${locale}: no negative tracking on connected scripts`);
        assert(typography.leading >= 1.29, `${locale}: room for vowel marks and stacked characters`);
      }
      assert.equal(await page.evaluate(() => window.articleLocaleTest.requests.length), 0, 'no preload');
      assert.equal(await page.evaluate(() => window.articleLocaleTest.conversions.length), 0, 'popup alone never sends a conversion');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale}: no horizontal overflow`);
      const button = dialog.getByRole('button', { name: article.landing.cta, exact: true });
      assert(await button.evaluate(node => { const r = node.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight && r.top >= 0; }), `${locale}: CTA fits viewport`);
      if (width === 390) await page.screenshot({ path: `/tmp/perfectly-timed-${locale}-popup.png` });
      await button.click();
      await page.waitForFunction(() => window.articleLocaleTest.active !== null);
      assert((await dialog.innerText()).includes(shared.ad.loading), `${locale}: translated loading`);
      assert.equal(await page.evaluate(() => window.articleLocaleTest.requests.length), 1);
      assert.deepEqual(await page.evaluate(() => window.articleLocaleTest.conversions), [{send_to: 'AW-18146485081/nWCKCJu12rIdENnG9cxD'}], 'first display sends the exact Google conversion before its reward');
      await page.evaluate(() => window.articleLocaleTest.grant());
      await page.locator('.gallery-article__introduction').waitFor();
      assert.equal(await dialog.count(), 0);
      const continuation = page.getByRole('button', { name: article.gallery.continueLabel, exact: true });
      await continuation.click();
      await page.waitForFunction(() => window.articleLocaleTest.active !== null);
      assert.equal(await page.evaluate(() => window.articleLocaleTest.requests.length), 2);
      assert.equal(await page.evaluate(() => window.articleLocaleTest.conversions.length), 2, 'second separately displayed rewarded ad sends another conversion');
      await page.evaluate(() => window.articleLocaleTest.grant());
      await page.locator('.gallery-article__article').waitFor();
      assert.equal(await page.evaluate(() => window.articleLocaleTest.conversions.length), 2, 'rewards and closes do not duplicate conversions');
      assert.equal(await page.locator('.gallery-article__article-sections > section').count(), 57);
      for (const item of article.items) {
        const section = page.locator(`[id="${item.id}"]`);
        assert.equal(await section.locator('h2').innerText(), item.title);
        assert.deepEqual(await section.locator('p').allTextContents(), item.paragraphs);
      }
      assert((await page.evaluate(() => window.articleLocaleTest.requests)).every(slot => slot.path === '/22677279144/rewarded' && slot.format === 'REWARDED'));
      if (width === 390) await page.screenshot({ path: `/tmp/perfectly-timed-${locale}-article.png` });
      assert.deepEqual(errors, []);
      console.log(`${locale} ${width}px PASS: popup, localized loading, two rewarded steps, 57 sections, no overflow or runtime errors.`);
      await context.close();
    }
  }
} finally { await browser.close(); }
