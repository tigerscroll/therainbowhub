import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const base = process.env.ARTICLE_TEST_URL ?? 'http://localhost:3198';
const gallery = JSON.parse(fs.readFileSync('data/galleries/mobilityscooter.json', 'utf8'));
const config = gallery.landing.followUpQuestions;
const slug = gallery.slug;
const progressKey = `rainbowhub:article-entry-questions:v1:${slug}`;
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
      requests: [], active: null,
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
      display(slot) {queueMicrotask(() => emit('rewardedSlotReady', slot, {makeRewardedVisible() {state.active = slot;}}));},
    };
  }, blocked);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/${slug}?fbclid=local-flow-test`);
  await page.waitForFunction(() => !document.querySelector('.gallery-article__entry-preview'));
  const dialog = page.getByRole('dialog');
  assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'no ad preload');
  await page.evaluate(() => {window.initialDialog = document.querySelector('[role="dialog"]');});
  await dialog.getByRole('button', {name: gallery.landing.cta, exact: true}).click();
  await page.waitForFunction(() => window.entryTest.active !== null);
  assert.equal(await page.evaluate(() => window.entryTest.requests.length), 1, 'first popup requests its own rewarded ad on click');
  assert.deepEqual(await page.evaluate(() => window.entryTest.requests[0]), {path: '/22677279144/rewarded', format: 'REWARDED'});
  await grant(page);
  await page.locator('[data-popup-question-id="age-range"]').waitFor();
  assert.equal(await page.evaluate(() => window.initialDialog === document.querySelector('[role="dialog"]')), true, 'same popup stays mounted');
  return {context, page, dialog, errors};
}

async function grant(page) {
  await page.waitForFunction(() => window.entryTest.active !== null);
  await page.evaluate(() => window.entryTest.grant());
}

async function pick(page, id, text) {
  const panel = page.locator(`[data-popup-question-id="${id}"]`);
  await panel.waitFor();
  assert.equal(await panel.locator('button').count(), 3);
  assert.equal(await page.locator('.gallery-article__introduction').count(), 0, 'article stays behind popup');
  await panel.getByRole('button', {name: text, exact: true}).click();
}

try {
  for (const width of [320, 390, 1440]) {
    const {context, page, dialog, errors} = await setup(width);
    const last = page.locator('[data-popup-question-id] button').last();
    assert.ok(await last.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), 'all choices fit on screen');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (width === 390) await page.screenshot({path: '/tmp/mobility-entry-age.png'});
    await pick(page, 'age-range', '65 or older');
    await pick(page, 'gender', 'Prefer not to say');
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 1, 'answer clicks never request ads');
    await page.reload();
    await page.locator('[data-popup-question-id="adult-confirmation"]').waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'resume never repeats first reward');
    assert.deepEqual((await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), progressKey)).answers, {'age-range': '65-plus', gender: 'skip'});
    if (width === 390) await page.screenshot({path: '/tmp/mobility-entry-confirm.png'});
    await pick(page, 'adult-confirmation', 'Yes, I am 18 or older');
    await page.locator('[data-popup-question-id="content-interest"]').waitFor();
    if (width === 390) await page.screenshot({path: '/tmp/mobility-entry-content.png'});
    await pick(page, 'content-interest', 'A bit of everything');
    await dialog.getByRole('heading', {name: config.readyTitle, exact: true}).waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'extra reward waits for separate consent');
    assert.match(await dialog.innerText(), /Watch one short ad/);
    if (width === 390) await page.screenshot({path: '/tmp/mobility-entry-ready.png'});
    await dialog.getByRole('button', {name: config.cta, exact: true}).click();
    await page.waitForFunction(() => window.entryTest.active !== null);
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 1, 'View Content requests a new rewarded ad on click');
    assert.deepEqual(await page.evaluate(() => window.entryTest.requests.at(-1)), {path: '/22677279144/rewarded', format: 'REWARDED'});
    await page.evaluate(() => window.entryTest.close());
    await page.waitForFunction(() => !document.querySelector('[role="dialog"] button')?.disabled);
    assert.equal(await page.locator('.gallery-article__introduction').count(), 0, 'closing without a reward leaves the popup ready');
    await dialog.getByRole('button', {name: config.cta, exact: true}).click();
    await grant(page);
    await page.locator('.gallery-article__introduction').waitFor();
    await page.reload();
    await page.locator('.gallery-article__introduction').waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'completed popup restores without another ad');
    await page.getByRole('button', {name: /Continue Reading/}).click();
    await grant(page);
    await page.locator('.gallery-article__article').waitFor();
    assert.equal(await page.locator('.gallery-article__article-sections > section[id^="mobilityscooter-"]').count(), 16);
    assert.ok((await page.evaluate(() => window.entryTest.requests)).every(slot => slot.path === '/22677279144/rewarded' && slot.format === 'REWARDED'));
    assert.deepEqual(errors, []);
    console.log(`${width}px PASS: same popup, four questions, content preference, saved progress, adult confirmation, extra reward consent/retry and unchanged article reward.`);
    await context.close();
  }
  for (const mode of ['underage-range', 'underage-confirmation', 'decline-confirmation', 'blocked-storage']) {
    const {context, page, dialog, errors} = await setup(390, mode === 'blocked-storage');
    if (mode === 'underage-range' || mode === 'blocked-storage') await pick(page, 'age-range', 'Under 18');
    else {
      await pick(page, 'age-range', '18–64');
      await pick(page, 'gender', 'Man');
      await pick(page, 'adult-confirmation', mode === 'underage-confirmation' ? 'No, I am under 18' : 'Prefer not to confirm');
    }
    await dialog.getByRole('heading', {name: config.adultOnly.exitTitle}).waitFor();
    assert.equal(await dialog.getByRole('button', {name: 'View Content', exact: true}).count(), 0, 'ad-free exit has a different CTA label');
    assert.equal(await dialog.locator('.quiz-engine__ad-note').count(), 0);
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 1, 'no extra ad after age restriction');
    await dialog.getByRole('button', {name: config.adultOnly.exitCta, exact: true}).click();
    await page.locator('.gallery-article__introduction').waitFor();
    if (mode !== 'blocked-storage') {
      await page.goto(`${base}/${slug}`);
      await page.locator('.gallery-article__introduction').waitFor();
    }
    const before = await page.evaluate(() => window.entryTest.requests.length);
    await page.getByRole('button', {name: /Continue Reading/}).click();
    await page.locator('.gallery-article__article').waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), before, 'article continues ad-free even after removing fbclid');
    assert.deepEqual(errors, []);
    console.log(`${mode} PASS: no more rewarded ads, guide remains accessible.`);
    await context.close();
  }
  for (const completed of [false, true]) {
    const {context, page, errors} = await setup(390);
    await page.evaluate(({progressKey, completed, slug}) => {
      sessionStorage.setItem(progressKey, JSON.stringify({
        questionIds: ['age-range', 'gender', 'adult-confirmation'],
        answers: {'age-range': '18-64', gender: 'skip', 'adult-confirmation': 'under-18'},
      }));
      if (completed) sessionStorage.setItem(`rainbowhub:article-entry-unlock:v1:${slug}`, '1');
    }, {progressKey, completed, slug});
    await page.reload();
    if (!completed) {
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('heading', {name: config.adultOnly.exitTitle}).waitFor();
      await dialog.getByRole('button', {name: config.adultOnly.exitCta, exact: true}).click();
    }
    await page.locator('.gallery-article__introduction').waitFor();
    await page.getByRole('button', {name: /Continue Reading/}).click();
    await page.locator('.gallery-article__article').waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'legacy minor progress remains ad-free');
    assert.deepEqual(errors, []);
    console.log(`Legacy ${completed ? 'completed' : 'pending'} session PASS: prior age decision survives added content question.`);
    await context.close();
  }
} finally {await browser.close();}
