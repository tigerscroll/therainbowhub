import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3198';
const slug = process.env.QUIZ_TEST_SLUG ?? 'vision';
assert.ok(/^[a-z-]+$/.test(slug));
const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, 'utf8'));
assert.equal(manifest.engine.entry, 'first-answer');
const firstStage = manifest.structure.stages[0];
const [firstId, secondId] = firstStage.questionIds;
const browser = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
const blockThirdParties = context => context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());

try {
  for (const locale of manifest.activeLocales) {
    const copy = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
    const first = copy.stages[firstStage.id].questions[firstId];
    const url = `${base}/${locale === 'en' ? '' : `${locale}/`}${slug}`;
    const viewport = {width: 390, height: 844};
    const staticContext = await browser.newContext({viewport, javaScriptEnabled: false});
    await blockThirdParties(staticContext);
    const staticPage = await staticContext.newPage();
    await staticPage.goto(url);
    assert.equal(await staticPage.locator('.quiz-engine__landing').count(), 0);
    assert.equal(await staticPage.locator(`[data-question-id="${firstId}"] h1`).textContent(), first.question, `${locale}: first question is in server HTML`);
    assert.ok((await staticPage.locator('.quiz-engine__progress-head > strong[data-entry]').textContent()).endsWith(first.headerLabel), 'opening pill is present before hydration');
    assert.equal(await staticPage.locator('.quiz-engine__answer').count(), 3);
    await staticContext.close();

    const context = await browser.newContext({viewport});
    await blockThirdParties(context);
    await context.addInitScript(() => {
      const listeners = new Map();
      const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(callback => callback({slot, ...extra}));
      const pubads = {addEventListener(name, callback) { listeners.set(name, [...(listeners.get(name) ?? []), callback]); }, updateCorrelator() {}};
      window.adCalls = [];
      window.googletag = {
        cmd: {push(callback) { callback(); }},
        enums: {OutOfPageFormat: {REWARDED: 'REWARDED'}},
        pubads: () => pubads, enableServices() {}, setConfig() {}, destroySlots() {},
        defineSlot() { throw Error('Unexpected display placement'); },
        defineOutOfPageSlot(path, format) {
          const slot = {path, format, addService() { return this; }};
          window.adCalls.push(slot);
          return slot;
        },
        display(slot) {
          window.testReward = {
            ready: () => emit('rewardedSlotReady', slot, {makeRewardedVisible() {}}),
            grant: () => emit('rewardedSlotGranted', slot),
            close: () => emit('rewardedSlotClosed', slot),
          };
        },
      };
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    const answers = page.locator('.quiz-engine__answer');
    await page.waitForFunction(() => document.querySelector('.quiz-engine__answer')?.disabled === false);
    assert.equal(await page.locator('html').getAttribute('lang'), locale);
    assert.equal(await page.locator('html').getAttribute('dir'), locale === 'ar' ? 'rtl' : 'ltr');
    const pill = page.locator('.quiz-engine__progress-head > strong[data-entry]');
    assert.ok((await pill.textContent()).endsWith(first.headerLabel));
    assert.equal(await pill.locator('.quiz-engine__entry-mark').count(), 1);
    assert.equal(await page.evaluate(() => window.adCalls.length), 0, 'no reward on page load');
    assert.deepEqual(await answers.locator('strong').allTextContents(), Object.values(first.answers));
    assert.equal(await page.locator('#quiz-first-answer-note').textContent(), JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, 'utf8')).ad.continueNote);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (['en', 'ar'].includes(locale)) await page.screenshot({path: `/tmp/${slug}-entry-${locale}.png`, fullPage: true});
    await answers.first().click();
    await page.waitForFunction(() => Boolean(window.testReward));
    assert.equal(await answers.first().getAttribute('data-pending'), 'true');
    assert.equal(await answers.first().getAttribute('aria-pressed'), 'true');
    assert.equal(await answers.evaluateAll(nodes => nodes.every(node => node.disabled)), true);
    assert.equal(await page.locator('[data-question-id]').getAttribute('data-question-id'), firstId);
    await page.evaluate(() => { window.testReward.ready(); window.testReward.grant(); });
    assert.equal(await page.locator('[data-question-id]').getAttribute('data-question-id'), firstId, 'reward must close before leaving the first question');
    await page.evaluate(() => window.testReward.close());
    await page.locator(`[data-question-id="${secondId}"]`).waitFor();
    assert.deepEqual(await page.evaluate(() => window.adCalls.map(({path, format}) => ({path, format}))), [{path: '/22677279144/rewarded', format: 'REWARDED'}]);
    assert.equal(await page.locator('#quiz-first-answer-note').count(), 0);
    assert.equal(await pill.count(), 0, 'the special title pill appears only on the first question');
    if (manifest.structure.questions[secondId].study) {
      const second = copy.stages[firstStage.id].questions[secondId];
      const study = page.locator(`[data-question-id="${secondId}"] .quiz-engine__study`);
      await study.waitFor();
      assert.deepEqual(await study.locator('.quiz-engine__study-items > strong').allTextContents(), second.study.items);
      assert.equal(await page.locator('.quiz-engine__answer').count(), 0, 'the study cue is still separate from the answers');
      await study.getByRole('button', {name: second.study.continueLabel, exact: true}).click();
      await page.locator('.quiz-engine__answer').first().waitFor();
      assert.equal(await study.count(), 0);
      assert.equal(await page.evaluate(() => window.adCalls.length), 1, 'the next study-screen action never repeats the entry reward');
      assert.deepEqual(await page.locator('.quiz-engine__answer strong').allTextContents(), Object.values(second.answers));
    }
    if (locale === 'en') {
      await page.evaluate(() => { sessionStorage.clear(); localStorage.clear(); });
      await page.setViewportSize({width: 1440, height: 960});
      await page.reload();
      await page.waitForFunction(() => document.querySelector('.quiz-engine__answer')?.disabled === false);
      await page.screenshot({path: `/tmp/${slug}-entry-desktop.png`, fullPage: true});
      await answers.nth(1).click();
      await page.evaluate(() => { window.testReward.ready(); window.testReward.close(); });
      await page.waitForFunction(() => document.querySelector('.quiz-engine__answer')?.disabled === false);
      assert.equal(await page.locator('[data-question-id]').getAttribute('data-question-id'), firstId, 'closing an incomplete reward preserves the first question');
      assert.equal(await answers.nth(1).getAttribute('data-selected'), null);
      await answers.nth(1).click();
      await page.evaluate(() => { window.testReward.ready(); window.testReward.grant(); window.testReward.close(); });
      await page.locator(`[data-question-id="${secondId}"]`).waitFor();
      assert.equal(await page.evaluate(() => window.adCalls.length), 2, 'an incomplete reward can be retried');
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${slug}/${locale}: server-rendered question and pill, three answers, first-answer reward and localized note PASS`);
  }
} finally {
  await browser.close();
}
