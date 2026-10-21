import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.env.ARTICLE_TEST_URL ?? 'http://localhost:3198';
const gallery = JSON.parse(fs.readFileSync('data/galleries/memory-test.json', 'utf8'));
const config = gallery.landing.followUpQuestions;
const progressKey = 'rainbowhub:article-entry-questions:v1:memory-test';
const entryKey = 'rainbowhub:article-entry-unlock:v1:memory-test';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

async function setup(width, height = 844, storageBlocked = false) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await context.addInitScript(blocked => {
    if (blocked) {
      Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
      Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
    }
    const listeners = new Map();
    const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(fn => fn({ slot, ...extra }));
    const state = {
      requests: [], active: null,
      grant() { const slot = this.active; emit('rewardedSlotGranted', slot); emit('rewardedSlotClosed', slot); this.active = null; },
      close() { const slot = this.active; emit('rewardedSlotClosed', slot); this.active = null; },
    };
    const pubads = {
      addEventListener(name, fn) { listeners.set(name, [...(listeners.get(name) ?? []), fn]); },
      removeEventListener(name, fn) { listeners.set(name, (listeners.get(name) ?? []).filter(item => item !== fn)); },
      updateCorrelator() {},
    };
    window.entryTest = state;
    window.googletag = {
      cmd: { push(fn) { fn(); } }, pubads: () => pubads,
      enableServices() {}, setConfig() {}, destroySlots() {},
      enums: { OutOfPageFormat: { REWARDED: 'REWARDED', INTERSTITIAL: 'INTERSTITIAL' } },
      defineOutOfPageSlot(path, format) { state.requests.push({ path, format }); return { path, format, addService() { return this; } }; },
      display(slot) { queueMicrotask(() => emit('rewardedSlotReady', slot, { makeRewardedVisible() { state.active = slot; } })); },
    };
    window.popupFrames = [];
    const sample = () => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog?.getClientRects().length) window.popupFrames.push({ popup: true, intro: !!document.querySelector('.gallery-article__introduction')?.getClientRects().length });
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }, storageBlocked);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  return { context, page, errors };
}

async function grant(page) {
  await page.waitForFunction(() => window.entryTest.active !== null);
  await page.evaluate(() => window.entryTest.grant());
}

try {
  for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
    const { context, page, errors } = await setup(width, height);
    await page.goto(`${base}/memory-test?fbclid=local-test`);
    await page.waitForFunction(() => !document.querySelector('.gallery-article__entry-preview'));
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Start', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0);
    await page.evaluate(() => { window.initialEntryDialog = document.querySelector('[role="dialog"]'); });
    await dialog.getByRole('button', { name: 'Start', exact: true }).click();
    await grant(page);
    const question = page.locator('[data-popup-question-id]');
    await question.waitFor();
    assert.equal(await page.evaluate(() => window.initialEntryDialog === document.querySelector('[role="dialog"]')), true, 'same popup remains mounted after first reward');
    assert.equal(await page.locator('.gallery-article__introduction').count(), 0);
    const selection = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), progressKey);
    assert.equal(selection.questionIds.length, 5);
    assert.equal(new Set(selection.questionIds).size, 5);
    for (let index = 0; index < 2; index++) {
      assert.equal(await question.getAttribute('data-popup-question-id'), selection.questionIds[index]);
      assert.equal(selection.questionIds[index], ['gender', 'self-rated-smarts'][index]);
      assert.equal(await question.locator('button').first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(220, 38, 38)', 'answers match first popup CTA');
      assert.doesNotMatch(await dialog.innerText(), /article|introduction/i);
      const option = question.getByRole('button', { name: 'Prefer not to say', exact: true });
      const box = await option.boundingBox();
      assert(box.x >= 0 && box.x + box.width <= width && box.y + box.height <= height, 'question options visible');
      const lastBox = await question.locator('button').last().boundingBox();
      assert(lastBox.y + lastBox.height <= height, 'last option visible without scrolling');
      await option.click();
    }
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 1, 'answers do not request ads');
    assert.deepEqual((await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), progressKey)).answers, { gender: 'skip', 'self-rated-smarts': 'skip' });
    if (width === 390) await page.screenshot({ path: '/tmp/memory-entry-questions.png' });
    await page.reload();
    await question.waitFor();
    assert.equal(await question.getAttribute('data-popup-question-id'), selection.questionIds[2]);
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'refresh resumes without repeating first reward');
    assert.deepEqual((await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), progressKey)).questionIds, selection.questionIds);
    for (let index = 2; index < 5; index++) {
      assert.equal(await question.getAttribute('data-popup-question-id'), selection.questionIds[index]);
      await question.locator('button').first().click();
    }
    await dialog.getByRole('heading', { name: config.readyTitle }).waitFor();
    assert.equal(config.readyTitle, 'Your Quiz Is Ready');
    assert.doesNotMatch(await dialog.innerText(), /article|introduction/i);
    assert.equal(await page.locator('.gallery-article__introduction').count(), 0);
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'extra reward waits for consent');
    assert.equal((await dialog.locator('.quiz-engine__ad-note').innerText()).replace(/^✓\s*/, ''), config.adNote);
    await page.reload();
    await dialog.getByRole('heading', { name: config.readyTitle }).waitFor();
    await dialog.getByRole('button', { name: config.cta, exact: true }).click();
    await page.waitForFunction(() => window.entryTest.active !== null);
    await page.evaluate(() => window.entryTest.close());
    await page.waitForFunction(() => !document.querySelector('[role="dialog"] button')?.disabled);
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), entryKey), null, 'closing without reward does not unlock');
    assert.equal(await page.locator('.gallery-article__introduction').count(), 0);
    await dialog.getByRole('button', { name: config.cta, exact: true }).click();
    await grant(page);
    const intro = page.locator('.gallery-article__introduction');
    await intro.waitFor();
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await intro.locator('h1').innerText(), gallery.landing.title);
    const frames = await page.evaluate(() => window.popupFrames);
    assert(frames.length > 0 && frames.every(frame => !frame.intro), 'no article flash while popup is open');
    await intro.getByRole('button', { name: /Continue Reading/ }).click();
    await grant(page);
    await page.locator('.gallery-article__article').waitFor();
    assert.equal(await page.locator('.gallery-article__article #memory-test-20').count(), 1);
    assert.equal(await page.locator('.gallery-article__article-sections > section[id^="memory-test-"]').count(), 20);
    assert((await page.evaluate(() => window.entryTest.requests)).every(slot => slot.path === '/22677279144/rewarded' && slot.format === 'REWARDED'));
    await page.reload();
    await page.locator('.gallery-article__article').waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0);
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(`${base}/memory-test`);
    await intro.waitFor();
    assert.equal(await page.getByRole('dialog').count(), 0, 'direct visits keep bypassing entry popup');
    assert.deepEqual(errors, []);
    console.log(`${width}px PASS: Start, same popup, five random picks, session resume, extra rewarded consent/retry, intro and existing article reward.`);
    await context.close();
  }
  const { context, page, errors } = await setup(390, 844, true);
  await page.goto(`${base}/memory-test?fbclid=storage-test`);
  await page.getByRole('dialog').getByRole('button', { name: 'Start', exact: true }).click();
  await grant(page);
  for (let index = 0; index < 5; index++) {
    const question = page.locator('[data-popup-question-id]');
    await question.waitFor();
    await question.locator('button').first().click();
  }
  await page.getByRole('dialog').getByRole('button', { name: config.cta, exact: true }).click();
  await grant(page);
  await page.locator('.gallery-article__introduction').waitFor();
  assert.deepEqual(errors, []);
  console.log('Storage unavailable PASS: first reward, five questions and extra reward remain usable.');
  await context.close();
} finally {
  await browser.close();
}
