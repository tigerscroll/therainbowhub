import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

function mockRewardedAds() {
  const listeners = new Map();
  const ads = {
    addEventListener(name, cb) { listeners.set(name, [...(listeners.get(name) ?? []), cb]); },
    removeEventListener(name, cb) { listeners.set(name, (listeners.get(name) ?? []).filter(value => value !== cb)); },
    updateCorrelator() {},
  };
  const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(cb => cb({ slot, ...extra }));
  window.googletag = {
    cmd: { push(cb) { cb(); } }, pubads: () => ads, enableServices() {}, setConfig() {}, destroySlots() {},
    enums: { OutOfPageFormat: { REWARDED: 'REWARDED' } },
    defineOutOfPageSlot() { return { addService() { return this; } }; },
    display(slot) { queueMicrotask(() => emit('rewardedSlotReady', slot, { makeRewardedVisible() { queueMicrotask(() => { emit('rewardedSlotGranted', slot); emit('rewardedSlotClosed', slot); }); } })); },
  };
}

async function measureAnswers(page) {
  await page.locator('.quiz-engine__answer').first().waitFor();
  return page.locator('.quiz-engine__answer').evaluateAll(buttons => buttons.map(button => {
    const rect = button.getBoundingClientRect();
    const label = button.querySelector('strong').getBoundingClientRect();
    return {
      height: rect.height,
      minimum: getComputedStyle(button).minHeight,
      contentFits: label.top >= rect.top && label.bottom <= rect.bottom && button.scrollWidth <= button.clientWidth,
    };
  }));
}

try {
  for (const route of ['/years-left', '/memory', '/vision', '/de/years-left', '/ar/years-left', '/de/memory', '/ar/vision', '/cloudstorage/years-left']) {
    for (const width of [320, 390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 640 } });
      const page = await context.newPage();
      await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
      await page.addInitScript(mockRewardedAds);
      await page.goto(`${base}${route}`);
      const landing = page.locator(route.startsWith('/cloudstorage') ? '[data-embedded-quiz] .quiz-engine__landing' : '.quiz-engine__landing');
      await landing.waitFor();
      const start = landing.locator('.quiz-engine__primary');
      assert.equal(await start.evaluate(button => getComputedStyle(button).minHeight), '72px', `${route}/${width}: Start minimum`);
      assert.equal((await start.boundingBox()).height, 72, `${route}/${width}: short Start label stays at baseline`);
      await start.click();
      await page.locator('[data-question-id]').waitFor();
      const study = page.locator('.quiz-engine__study .quiz-engine__primary');
      if (await study.count()) await study.click();
      const shortScreen = await measureAnswers(page);
      for (const answer of shortScreen) {
        assert.equal(answer.minimum, '72px', `${route}/${width}: answer minimum`);
        assert.ok(answer.height >= 72 && answer.contentFits, `${route}/${width}: no clipped content`);
      }
      await page.setViewportSize({ width, height: 1000 });
      assert.deepEqual(await measureAnswers(page), shortScreen, `${route}/${width}: spare viewport height must not stretch answers`);
      if (width <= 820) {
        assert.ok((await page.locator('.quiz-engine__question-shell').boundingBox()).height >= 948, 'mobile shell still fills screen');
      }
      if (route === '/years-left' && width === 390) {
        await page.screenshot({ path: '/tmp/quiz-consistent-buttons-mobile.png' });
      }

      // Exercise wrapping without modifying the production quiz content.
      const answer = page.locator('.quiz-engine__answer').first();
      const originalLabel = await answer.locator('strong').textContent();
      await answer.locator('strong').evaluate(label => { label.textContent = 'A deliberately long translated answer that needs additional lines to remain completely readable. '.repeat(8); });
      const wrapped = (await measureAnswers(page))[0];
      assert.ok(wrapped.height > shortScreen[0].height && wrapped.contentFits, `${route}/${width}: long labels expand safely`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no horizontal overflow');
      if (route === '/years-left' && width === 390) {
        await answer.locator('strong').evaluate((label, text) => { label.textContent = text; }, originalLabel);
        for (let question = 0; question < 10; question++) {
          const id = await page.locator('[data-question-id]').getAttribute('data-question-id');
          await page.locator('.quiz-engine__answer').first().click();
          await page.waitForFunction(previous => document.querySelector('[data-question-id]')?.getAttribute('data-question-id') !== previous, id);
        }
        const continueButton = page.locator('.quiz-engine__checkpoint > .quiz-engine__primary');
        await continueButton.waitFor();
        assert.equal(await continueButton.evaluate(button => getComputedStyle(button).minHeight), '72px', 'checkpoint CTA shares the same baseline');
        await page.setViewportSize({ width, height: 640 });
        assert.equal((await continueButton.boundingBox()).height, 72, 'short screens do not shrink checkpoint CTA');
      }
      console.log(`${route} ${width}px: 72px controls, stable across screen heights, long text expands, full-screen shell preserved.`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
