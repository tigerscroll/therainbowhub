import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const base = process.env.ARTICLE_TEST_URL ?? 'http://localhost:3198';
const locale = process.env.ARTICLE_LOCALE ?? 'en';
const gallery = JSON.parse(fs.readFileSync(`data/galleries/mobilityscooter${locale === 'en' ? '' : `.${locale}`}.json`, 'utf8'));
const config = gallery.landing.followUpQuestions;
const slug = gallery.slug;
const routePath = `${locale === 'en' ? '' : `/${locale}`}/${slug}`;
const loadingLabel = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, 'utf8')).ad.loading;
const label = (id, answerId) => config.questions.find(question => question.id === id).choices.find(choice => choice.id === answerId).label;
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
        else emit('rewardedSlotReady', slot, {makeRewardedVisible() {state.active = slot; return true; }});
      });},
    };
  }, blocked);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}${routePath}?fbclid=local-flow-test`);
  await page.waitForFunction(() => !document.querySelector('.gallery-article__entry-preview'));
  const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(links => links.map(link => new URL(link.href).pathname));
  for (const path of ['/mobilityscooter', '/de/mobilityscooter', '/fr/mobilityscooter']) assert(alternates.includes(path), `missing language alternative ${path}`);
  const dialog = page.getByRole('dialog');
  assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'no ad preload');
  await page.evaluate(() => {window.initialDialog = document.querySelector('[role="dialog"]');});
  await dialog.getByRole('button', {name: gallery.landing.cta, exact: true}).click();
  await page.waitForFunction(() => window.entryTest.active !== null);
  assert.equal(await page.locator('html').getAttribute('lang'), locale);
  assert((await dialog.locator('button').innerText()).includes(loadingLabel), 'localized loading copy');
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
    if (width === 390) await page.screenshot({path: `/tmp/mobility-${locale}-entry-age.png`});
    await pick(page, 'age-range', label('age-range', '65-plus'));
    await pick(page, 'gender', label('gender', 'skip'));
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 1, 'answer clicks never request ads');
    if (width === 390) {
      await page.reload();
      await page.locator('[data-popup-question-id="content-interest"]').waitFor();
    }
    const priorRequests = width === 390 ? 0 : 1;
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), priorRequests, 'resume never repeats first reward; other viewports test both ads without a page reload');
    assert.deepEqual((await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), progressKey)).answers, {'age-range': '65-plus', gender: 'skip'});
    await page.locator('[data-popup-question-id="content-interest"]').waitFor();
    if (width === 390) await page.screenshot({path: `/tmp/mobility-${locale}-entry-content.png`});
    await pick(page, 'content-interest', label('content-interest', 'fun'));
    await dialog.getByRole('heading', {name: config.readyTitle, exact: true}).waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), priorRequests, 'extra reward waits for separate consent');
    assert((await dialog.innerText()).includes(config.adNote));
    if (width === 390) await page.screenshot({path: `/tmp/mobility-${locale}-entry-ready.png`});
    await page.evaluate(() => {window.entryTest.noFill = true;});
    await dialog.getByRole('button', {name: config.cta, exact: true}).click();
    await dialog.getByRole('status').waitFor();
    assert.equal(await dialog.getByRole('status').innerText(), config.unavailableCopy);
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), priorRequests + 3, 'no-fill uses three bounded requests');
    assert.equal(await page.locator('.gallery-article__introduction').count(), 0, 'no-fill no longer silently unlocks View Content');
    assert.equal(await page.evaluate(slug => sessionStorage.getItem(`rainbowhub:article-entry-unlock:v1:${slug}`), slug), null);
    if (width === 390) await page.screenshot({path: `/tmp/mobility-${locale}-entry-no-fill.png`});
    await page.evaluate(() => {window.entryTest.noFill = false;});
    await dialog.getByRole('button', {name: config.cta, exact: true}).click();
    await page.waitForFunction(() => window.entryTest.active !== null);
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), priorRequests + 4, 'View Content retries with a new rewarded ad on click');
    assert.deepEqual(await page.evaluate(() => window.entryTest.requests.at(-1)), {path: '/22677279144/rewarded', format: 'REWARDED'});
    assert.equal(await page.locator('.gallery-article__introduction').count(), 0, 'requesting or displaying an ad alone never unlocks the page');
    assert.equal(await page.evaluate(slug => sessionStorage.getItem(`rainbowhub:article-entry-unlock:v1:${slug}`), slug), null, 'the first popup reward cannot unlock the View Content step');
    await page.evaluate(() => window.entryTest.close());
    await page.waitForFunction(() => !document.querySelector('[role="dialog"] button')?.disabled);
    assert.equal(await page.locator('.gallery-article__introduction').count(), 0, 'closing without a reward leaves the popup ready');
    await dialog.getByRole('button', {name: config.cta, exact: true}).click();
    await grant(page);
    await page.locator('.gallery-article__introduction').waitFor();
    await page.reload();
    await page.locator('.gallery-article__introduction').waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0, 'completed popup restores without another ad');
    await page.getByRole('button', {name: gallery.gallery.continueLabel}).click();
    await grant(page);
    await page.locator('.gallery-article__article').waitFor();
    assert.equal(await page.locator('.gallery-article__article-sections > section[id^="mobilityscooter-"]').count(), 16);
    for (const item of gallery.items) {
      const section = page.locator(`[id="${item.id}"]`);
      assert.equal(await section.locator('h2').innerText(), item.title);
      assert.deepEqual(await section.locator('p').allTextContents(), item.paragraphs);
    }
    if (width === 390) await page.screenshot({path: `/tmp/mobility-${locale}-article.png`});
    assert.ok((await page.evaluate(() => window.entryTest.requests)).every(slot => slot.path === '/22677279144/rewarded' && slot.format === 'REWARDED'));
    assert.deepEqual(errors, []);
    console.log(`${width}px PASS: same popup, age > gender > content interest, saved progress, extra reward consent/retry and unchanged article reward.`);
    await context.close();
  }
  // Every combination uses precisely the same screens and two entry rewards.
  for (let combination = 0; combination < 28; combination++) {
    const blocked = combination === 27;
    const {context, page, dialog, errors} = await setup(390, blocked);
    for (let index = 0; index < config.questions.length; index++) {
      const question = config.questions[index];
      const choice = question.choices[blocked ? 0 : Math.floor(combination / 3 ** Math.min(index, 2)) % 3];
      await pick(page, question.id, choice.label);
    }
    await dialog.getByRole('heading', {name: config.readyTitle, exact: true}).waitFor();
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 1, 'every set of answers waits for the same second CTA');
    assert.equal(await page.locator('.gallery-article__introduction').count(), 0);
    assert.equal(await page.evaluate(() => window.initialDialog === document.querySelector('[role="dialog"]')), true);
    await dialog.getByRole('button', {name: config.cta, exact: true}).click();
    await page.waitForFunction(() => window.entryTest.active !== null);
    assert.equal(await page.evaluate(() => window.entryTest.requests.length), 2, 'View Content requests a separate rewarded ad for every answer combination');
    assert.equal(await page.locator('.gallery-article__introduction').count(), 0, 'no answer bypasses the pending reward');
    await grant(page);
    await page.locator('.gallery-article__introduction').waitFor();
    assert.deepEqual(errors, []);
    console.log(`${blocked ? 'Storage unavailable' : `Answer combination ${combination + 1}/27`} PASS: identical three questions, View Content and second rewarded ad.`);
    await context.close();
  }
  for (const completed of [false, true]) {
    const {context, page, errors} = await setup(390);
    await page.evaluate(({progressKey, completed, slug}) => {
      sessionStorage.setItem(progressKey, JSON.stringify({
        questionIds: ['age-range', 'gender', 'adult-confirmation'],
        answers: {'age-range': '18-64', gender: 'skip', 'adult-confirmation': 'under-18'},
      }));
      if (completed) {
        sessionStorage.setItem(`rainbowhub:article-entry-unlock:v1:${slug}`, '1');
        sessionStorage.setItem(`rainbowhub:article-unlock:v1:${slug}`, '1');
      }
    }, {progressKey, completed, slug});
    await page.reload();
    if (!completed) {
      // The retired confirmation question invalidates the old selection, but
      // the completed first reward is still retained.
      for (const question of config.questions) await pick(page, question.id, question.choices[0].label);
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('heading', {name: config.readyTitle, exact: true}).waitFor();
      assert.equal(await page.evaluate(() => window.entryTest.requests.length), 0);
      await dialog.getByRole('button', {name: config.cta, exact: true}).click();
      await grant(page);
    }
    await page.locator('.gallery-article__introduction, .gallery-article__article').waitFor();
    assert.deepEqual(errors, []);
    console.log(`Legacy ${completed ? 'completed' : 'pending'} session PASS: answers restore without age-dependent routing.`);
    await context.close();
  }
} finally {await browser.close();}
