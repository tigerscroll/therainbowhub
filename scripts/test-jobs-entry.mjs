import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const base = process.env.ARTICLE_TEST_URL ?? 'http://localhost:3198';
const jobs = JSON.parse(fs.readFileSync('data/galleries/jobs.json', 'utf8'));
const config = jobs.landing.followUpQuestions;
const browser = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});

async function setup(width, blocked = false) {
  const context = await browser.newContext({viewport: {width, height: width === 320 ? 568 : 900}, reducedMotion: 'reduce'});
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await context.addInitScript(blocked => {
    if (blocked) {
      Storage.prototype.getItem = () => {throw Error('Storage unavailable');};
      Storage.prototype.setItem = () => {throw Error('Storage unavailable');};
    }
    const listeners = new Map();
    const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(fn => fn({slot, ...extra}));
    const state = {
      requests: [], active: null, noFill: false,
      grant() {const slot = this.active; emit('rewardedSlotGranted', slot); emit('rewardedSlotClosed', slot); this.active = null;},
      close() {const slot = this.active; emit('rewardedSlotClosed', slot); this.active = null;},
    };
    window.entryTest = state;
    const pubads = {
      addEventListener(name, fn) {listeners.set(name, [...(listeners.get(name) ?? []), fn]);},
      removeEventListener(name, fn) {listeners.set(name, (listeners.get(name) ?? []).filter(item => item !== fn));},
      updateCorrelator() {},
    };
    window.googletag = {
      cmd: {push(fn) {fn();}}, pubads: () => pubads,
      enableServices() {}, setConfig() {}, destroySlots() {},
      enums: {OutOfPageFormat: {REWARDED: 'REWARDED', INTERSTITIAL: 'INTERSTITIAL'}},
      defineOutOfPageSlot(path, format) {state.requests.push({path, format}); return {path, format, addService() {return this;}};},
      display(slot) {queueMicrotask(() => {
        if (state.noFill) emit('slotRenderEnded', slot, {isEmpty: true});
        else emit('rewardedSlotReady', slot, {makeRewardedVisible() {state.active = slot;}});
      });},
    };
  }, blocked);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/jobs?fbclid=jobs-test`);
  await page.waitForFunction(() => !document.querySelector('.gallery-article__entry-preview'));
  return {context, page, errors};
}

async function grant(page) {
  await page.waitForFunction(() => window.entryTest.active !== null);
  await page.evaluate(() => window.entryTest.grant());
}

try {
  // Exhaustive answer paths, both first buttons, mobile/desktop and blocked storage.
  for (let combination = 0; combination < 30; combination++) {
    const width = combination === 28 ? 320 : combination === 29 ? 1440 : 390;
    const {context, page, errors} = await setup(width, combination === 27);
    const dialog = page.getByRole('dialog');
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'no preload');
    assert.equal(await dialog.getByRole('button').count(), 2);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (combination === 0) await page.screenshot({path: '/tmp/jobs-entry.png'});
    await page.evaluate(() => {window.initialDialog = document.querySelector('[role="dialog"]');});
    await dialog.getByRole('button', {name: combination % 2 ? 'Later' : 'Now', exact: true}).click();
    await grant(page);
    for (let index = 0; index < 3; index++) {
      const question = config.questions[index];
      const panel = page.locator(`[data-popup-question-id="${question.id}"]`);
      await panel.waitFor();
      assert.equal(await panel.getByRole('button').count(), 3);
      assert.ok(await panel.getByRole('button').last().evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), 'choices fit viewport');
      const choice = question.choices[Math.floor(combination / 3 ** index) % 3];
      await panel.getByRole('button', {name: choice.label, exact: true}).click();
    }
    assert.equal(await page.evaluate(() => window.initialDialog === document.querySelector('[role="dialog"]')), true, 'one popup');
    await dialog.getByRole('heading', {name: config.readyTitle}).waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 1, 'questions have no ads');
    if (combination === 0) await page.screenshot({path: '/tmp/jobs-ready.png'});
    if (combination === 28) {
      await page.reload();
      await dialog.getByRole('heading', {name: config.readyTitle}).waitFor();
      await page.evaluate(() => {window.entryTest.noFill = true;});
      await dialog.getByRole('button', {name: 'Continue', exact: true}).click();
      await dialog.getByRole('status').waitFor();
      assert.equal(await dialog.getByRole('status').innerText(), config.unavailableCopy);
      assert.equal(await page.locator('.gallery-article__article').count(), 0, 'no-fill stays gated');
      await page.evaluate(() => {window.entryTest.noFill = false;});
      await dialog.getByRole('button', {name: 'Continue', exact: true}).click();
      await page.waitForFunction(() => window.entryTest.active !== null);
      await page.evaluate(() => window.entryTest.close());
      await dialog.getByRole('button', {name: 'Continue', exact: true}).waitFor({state: 'visible'});
      await page.waitForFunction(() => !document.querySelector('[role="dialog"] button')?.disabled);
      assert.equal(await dialog.count(), 1, 'closing without reward stays gated');
    }
    await dialog.getByRole('button', {name: 'Continue', exact: true}).click();
    await page.waitForFunction(() => window.entryTest.active !== null);
    assert.equal(await dialog.count(), 1, 'request alone cannot unlock');
    await grant(page);
    await page.locator('.gallery-article__article').waitFor();
    assert.equal(await dialog.count(), 0);
    assert.equal(await page.getByRole('heading', {name: jobs.landing.title, exact: true}).count(), 1);
    assert.equal(await page.locator('.gallery-article__article-sections > section[id^="jobs-"]').count(), 12);
    assert.equal(await page.getByRole('button', {name: /Continue Reading/}).count(), 0, 'no third gate');
    const requests = await page.evaluate(() => window.entryTest.requests);
    if (combination !== 28) assert.equal(requests.length, 2, 'exactly two rewards in successful flow');
    assert.ok(requests.every(slot => slot.path === '/22677279144/rewarded' && slot.format === 'REWARDED'));
    if (combination === 0) {
      await page.screenshot({path: '/tmp/jobs-article.png'});
      await page.reload();
      await page.locator('.gallery-article__article').waitFor();
      assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'full article restores without another ad');
    }
    assert.deepEqual(errors, []);
    console.log(`Jobs path ${combination + 1}/30 PASS (${width}px).`);
    await context.close();
  }
} finally {
  await browser.close();
}
