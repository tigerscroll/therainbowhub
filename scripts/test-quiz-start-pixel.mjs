import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3198';
const browser = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
try {
  for (const [slug, mode] of [['years-left', 'manual'], ['vision', 'manual'], ['years-left', 'failed-display'], ['years-left', 'no-fill']]) {
    const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, 'utf8'));
    const firstAnswer = manifest.engine.entry === 'first-answer';
    const firstId = manifest.structure.stages[0].questionIds[0];
    const context = await browser.newContext({viewport: {width: 390, height: 844}});
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    await context.addInitScript(mode => {
      const listeners = new Map();
      const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(fn => fn({slot, ...extra}));
      const state = {events: [], requests: 0, active: null, slot: null, ready: null};
      window.pixelTest = state;
      window.fbq = (command, name) => {if (command === 'trackCustom') state.events.push(name);};
      const pubads = {addEventListener(name, fn) {listeners.set(name, [...(listeners.get(name) ?? []), fn]);}, updateCorrelator() {}};
      window.googletag = {
        cmd: {push(fn) {fn();}}, pubads: () => pubads, enableServices() {}, setConfig() {}, destroySlots() {},
        enums: {OutOfPageFormat: {REWARDED: 'REWARDED'}},
        defineOutOfPageSlot(path, format) {state.requests++; return {path, format, addService() {return this;}};},
        display(slot) {
          state.slot = slot;
          state.ready = () => emit('rewardedSlotReady', slot, {makeRewardedVisible() {
            if (mode === 'failed-display') return false;
            state.active = slot;
            return true;
          }});
          if (mode === 'no-fill') queueMicrotask(() => emit('slotRenderEnded', slot, {isEmpty: true}));
          if (mode === 'failed-display') queueMicrotask(state.ready);
        },
      };
      state.emit = name => emit(name, state.slot);
    }, mode);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/${slug}`);
    const startSelector = firstAnswer ? '.quiz-engine__answer' : '.quiz-engine__landing .quiz-engine__primary';
    await page.waitForFunction(selector => document.querySelector(selector)?.disabled === false, startSelector);
    assert.equal(await page.evaluate(() => window.pixelTest.events.length), 0, 'page load never sends QuizStart');
    await page.locator(startSelector).first().click();
    await page.waitForFunction(() => window.pixelTest.requests > 0);
    assert.equal(await page.evaluate(() => window.pixelTest.events.length), 0, 'CTA/answer and ad request never send QuizStart');
    if (mode === 'manual') {
      await page.evaluate(() => window.pixelTest.ready());
      await page.waitForFunction(() => window.pixelTest.active !== null);
      assert.equal(await page.evaluate(() => window.pixelTest.events.filter(name => name === 'QuizStart').length), 1, 'display sends QuizStart before reward');
      if (firstAnswer) assert.equal(await page.locator('[data-question-id]').getAttribute('data-question-id'), firstId, 'ad start does not advance the quiz');
      else assert.equal(await page.locator('[data-question-id]').count(), 0, 'ad start does not unlock question one');
      await page.evaluate(() => window.pixelTest.emit('rewardedSlotClosed'));
      await page.waitForFunction(selector => document.querySelector(selector)?.disabled === false, startSelector);
      if (firstAnswer) {
        assert.equal(await page.locator('[data-question-id]').getAttribute('data-question-id'), firstId, 'early close does not award content');
        await page.reload();
        await page.waitForFunction(selector => document.querySelector(selector)?.disabled === false, startSelector);
      }
      const priorRequests = await page.evaluate(() => window.pixelTest.requests);
      await page.locator(startSelector).first().click();
      await page.waitForFunction(count => window.pixelTest.requests > count, priorRequests);
      await page.evaluate(() => {window.pixelTest.active = null;});
      await page.evaluate(() => window.pixelTest.ready());
      await page.waitForFunction(() => window.pixelTest.active !== null);
      const expectedStarts = firstAnswer ? 0 : 1;
      assert.equal(await page.evaluate(() => window.pixelTest.events.filter(name => name === 'QuizStart').length), expectedStarts, 'quiz retries never send a second QuizStart');
      await page.evaluate(() => window.pixelTest.emit('rewardedSlotGranted'));
      if (firstAnswer) assert.equal(await page.locator('[data-question-id]').getAttribute('data-question-id'), firstId, 'reward still waits for close before advancing');
      else assert.equal(await page.locator('[data-question-id]').count(), 0, 'reward still waits for close before showing question one');
      await page.evaluate(() => window.pixelTest.emit('rewardedSlotClosed'));
      await page.waitForFunction(({id, firstAnswer}) => {
        const current = document.querySelector('[data-question-id]')?.getAttribute('data-question-id');
        return Boolean(current) && (firstAnswer ? current !== id : current === id);
      }, {id: firstId, firstAnswer});
      assert.equal(await page.evaluate(() => window.pixelTest.events.filter(name => name === 'QuizStart').length), expectedStarts, 'grant and close never repeat the pixel');
      const saved = await page.evaluate(slug => JSON.parse(sessionStorage.getItem(`rainbowhub:quiz-progress:v4:${slug}:en`)), slug);
      assert.equal(saved.rewardClosedSent, true, 'existing persisted deduplication marker records the ad start');
    } else {
      await page.waitForFunction(() => window.pixelTest.requests >= 3);
      assert.equal(await page.evaluate(() => window.pixelTest.events.filter(name => name === 'QuizStart').length), 0, `${mode} never sends QuizStart`);
    }
    assert.deepEqual(errors, []);
    console.log(`${slug} ${mode}: QuizStart timing and reward gating PASS.`);
    await context.close();
  }
} finally {await browser.close();}
