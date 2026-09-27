import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

function mockGpt() {
  const listeners = new Map();
  window.adRequests = [];
  window.destroyedAds = [];
  window.rewardMode = 'manual';
  window.rewardShows = 0;
  const emit = (name, slot, extra = {}) => [...(listeners.get(name) ?? [])].forEach(callback => callback({ slot, ...extra }));
  window.emitArticleAd = (name, extra) => emit(name, window.rewardSlot, extra);
  const pubads = {
    addEventListener(name, callback) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(callback); },
    removeEventListener(name, callback) { listeners.get(name)?.delete(callback); },
    updateCorrelator() {},
  };
  window.googletag = {
    cmd: { push(callback) { callback(); } },
    pubads: () => pubads,
    enableServices() {},
    enums: { OutOfPageFormat: { REWARDED: 'REWARDED' } },
    defineSlot(path, sizes, id) {
      const slot = { path, sizes, id, kind: 'display', addService() { return this; } };
      window.adRequests.push(slot);
      return slot;
    },
    defineOutOfPageSlot(path) {
      const slot = { path, kind: 'rewarded', addService() { return this; } };
      window.adRequests.push(slot);
      window.rewardSlot = slot;
      return slot;
    },
    destroySlots(slots) { window.destroyedAds.push(...slots.map(slot => slot.kind)); },
    display(slotOrId) {
      const slot = typeof slotOrId === 'string' ? window.adRequests.find(item => item.id === slotOrId) : slotOrId;
      if (slot.kind === 'display') {
        queueMicrotask(() => emit('slotRenderEnded', slot, { isEmpty: false }));
      } else if (window.rewardMode === 'empty') {
        queueMicrotask(() => emit('slotRenderEnded', slot, { isEmpty: true }));
      } else if (window.rewardMode !== 'pending') {
        queueMicrotask(() => emit('rewardedSlotReady', slot, { makeRewardedVisible() { window.rewardShows++; } }));
      }
    },
  };
}

async function newPage(width, extraInit) {
  const context = await browser.newContext({ viewport: { width, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await page.addInitScript(mockGpt);
  if (extraInit) await page.addInitScript(extraInit);
  await page.goto(`${base}/monetize?fbclid=test`);
  await page.waitForFunction(() => !document.querySelector('.article-unlock button')?.disabled);
  return { context, page, errors };
}

try {
  for (const width of [320, 360, 390, 1440]) {
    const { context, page, errors } = await newPage(width);
    assert.equal(await page.locator('h1').innerText(), 'Learn How to Monetize Your Facebook Content');
    assert.equal(await page.locator('#article-content img').count(), 0);
    assert.equal(await page.locator('.article-display__label, .article-unlock__copy').count(), 0);
    assert.doesNotMatch(await page.locator('#article-content').innerText(), /Unlock the full guide in one step|Advertisements/);
    const adBox = await page.locator('.article-display__slot').first().boundingBox();
    const titleBox = await page.locator('h1').boundingBox();
    const introBox = await page.locator('.plain-article__intro').boundingBox();
    assert.equal(adBox.width, Math.min(width, 720), 'ad slot uses the full available width, outside text padding');
    assert.ok(adBox.y >= titleBox.y + titleBox.height, 'ad appears below the article headline');
    assert.ok(adBox.y + adBox.height <= introBox.y, 'ad appears before the introduction');
    assert.equal(await page.locator('header > h1 + .article-display + .plain-article__intro').count(), 1, 'ad is directly between title and introduction');
    assert.equal(await page.locator('.article-display__slot').first().evaluate(node => getComputedStyle(node).maxHeight), 'none');
    assert.equal(await page.locator('#article-unlocked-content').isVisible(), false);
    assert.equal(await page.locator('.hub-header').isVisible(), false);
    assert.equal(await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)');
    assert.equal(await page.locator('.plain-article').evaluate(node => getComputedStyle(node).color), 'rgb(17, 17, 17)');
    assert.match(await page.locator('.article-unlock__teaser').evaluate(node => getComputedStyle(node).maskImage), /linear-gradient/);
    assert.match(await page.locator('#article-ad-note').innerText(), /Short ad first.*unlock the full guide/);
    assert.equal(await page.evaluate(() => window.adRequests.filter(slot => slot.kind === 'rewarded').length), 0);
    assert.equal(await page.evaluate(() => window.adRequests.filter(slot => slot.kind === 'display').length), 1);
    assert.deepEqual(await page.evaluate(() => window.adRequests.find(slot => slot.kind === 'display').sizes), width < 336 ? [[300, 250]] : [[300, 250], [336, 280]]);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const schema = await page.locator('script[type="application/ld+json"]').evaluate(node => JSON.parse(node.textContent));
    assert.equal(schema.isAccessibleForFree, false);
    assert.equal(schema.hasPart.cssSelector, '.article-unlocked-content');
    assert.ok(schema.articleBody.includes('A realistic first-week plan'));
    assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).pathname, '/monetize');
    await page.screenshot({ path: `/tmp/monetize-top-${width}.png` });
    await page.locator('.article-unlock').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/tmp/monetize-unlock-${width}.png` });

    await page.getByRole('button', { name: 'Continue article', exact: true }).click();
    await page.waitForFunction(() => window.rewardShows === 1);
    assert.equal(await page.getByRole('button', { name: 'Cancel', exact: true }).count(), 0, 'no custom Cancel button');
    assert.equal(await page.locator('#article-unlocked-content').isVisible(), false, 'ready alone never unlocks');
    await page.evaluate(() => window.emitArticleAd('rewardedSlotClosed'));
    await page.getByRole('button', { name: 'Continue article', exact: true }).waitFor();
    assert.equal(await page.locator('#article-unlocked-content').isVisible(), false);
    assert.equal(await page.evaluate(() => window.adRequests.filter(slot => slot.kind === 'rewarded').length), 1, 'no automatic reopen');
    assert.equal(await page.evaluate(() => localStorage.getItem('rainbowhub:article-unlock:v1:en:monetize')), null);

    await page.getByRole('button', { name: 'Continue article', exact: true }).click();
    await page.waitForFunction(() => window.rewardShows === 2);
    await page.evaluate(() => window.emitArticleAd('rewardedSlotGranted'));
    await page.locator('#article-unlocked-content').waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => window.destroyedAds.filter(kind => kind === 'rewarded').length), 1, 'granted ad stays open until close');
    await page.evaluate(() => window.emitArticleAd('rewardedSlotClosed'));
    assert.equal(await page.evaluate(() => window.destroyedAds.filter(kind => kind === 'rewarded').length), 2);
    assert.equal(await page.evaluate(() => window.adRequests.filter(slot => slot.kind === 'display').length), 1, 'unlock does not request another display ad');
    assert.equal(await page.locator('.article-display').count(), 1);
    assert.equal(await page.evaluate(() => window.adRequests.every(slot => slot.path === `/22677279144/${slot.kind === 'display' ? 'display' : 'rewarded'}`)), true);
    assert.equal(await page.getByRole('heading', { name: 'A realistic first-week plan' }).isVisible(), true);
    await page.reload();
    await page.locator('#article-unlocked-content').waitFor({ state: 'visible' });
    assert.equal(await page.getByRole('button', { name: 'Continue article', exact: true }).count(), 0);
    assert.equal(await page.evaluate(() => window.adRequests.filter(slot => slot.kind === 'rewarded').length), 0);
    assert.equal(await page.evaluate(() => window.adRequests.filter(slot => slot.kind === 'display').length), 1, 'restored unlock still has one display ad');
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${width}px: initial preview, gradient, disclosure, correct ad paths, close/retry, grant, persistence and layout pass.`);
  }

  const noFill = await newPage(390);
  await noFill.page.evaluate(() => { window.rewardMode = 'empty'; });
  await noFill.page.getByRole('button', { name: 'Continue article', exact: true }).click();
  await noFill.page.locator('#article-unlocked-content').waitFor({ state: 'visible' });
  assert.match(await noFill.page.getByRole('status').innerText(), /No ad is available/);
  await noFill.context.close();

  const pending = await newPage(390);
  await pending.page.evaluate(() => { window.rewardMode = 'pending'; });
  await pending.page.getByRole('button', { name: 'Continue article', exact: true }).click();
  assert.equal(await pending.page.getByRole('button', { name: 'Cancel', exact: true }).count(), 0);
  assert.equal(await pending.page.getByRole('button', { name: 'Opening ad…', exact: true }).isDisabled(), true);
  assert.equal(await pending.page.locator('#article-unlocked-content').isVisible(), false);
  await pending.page.locator('#article-unlocked-content').waitFor({ state: 'visible' });
  assert.match(await pending.page.getByRole('status').innerText(), /No ad is available/);
  assert.equal(await pending.page.evaluate(() => window.rewardShows), 0, 'loading timeout never opened an ad');
  assert.equal(await pending.page.locator('.article-display').count(), 1);
  assert.deepEqual(pending.errors, []);
  await pending.context.close();

  const blockedStorage = await newPage(390, () => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
  });
  await blockedStorage.page.getByRole('button', { name: 'Continue article', exact: true }).click();
  await blockedStorage.page.waitForFunction(() => window.rewardShows === 1);
  await blockedStorage.page.evaluate(() => { window.emitArticleAd('rewardedSlotGranted'); window.emitArticleAd('rewardedSlotClosed'); });
  await blockedStorage.page.locator('#article-unlocked-content').waitFor({ state: 'visible' });
  assert.deepEqual(blockedStorage.errors, []);
  await blockedStorage.context.close();

  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const response = await page.goto(`${base}/monetize`);
  assert.equal(response.status(), 200);
  const html = await response.text();
  assert.ok(html.includes('A realistic first-week plan'));
  assert.equal(await page.locator('#article-unlocked-content').isVisible(), false);
  assert.equal(await page.getByRole('heading', { name: 'Start with a plan, not an earnings promise' }).isVisible(), true);
  assert.equal(await page.locator('noscript p').filter({ hasText: 'Enable JavaScript' }).isVisible(), true);
  await page.goto(`${base}/cloudstorage`);
  assert.equal(await page.locator('.article-unlock, .article-display').count(), 0);
  assert.equal(await page.getByRole('heading', { name: 'Google Workspace backup is different from Google Vault' }).isVisible(), true);
  await context.close();
  const headerCheck = await newPage(390);
  await headerCheck.page.evaluate(() => { sessionStorage.clear(); });
  await headerCheck.page.goto(`${base}/monetize`);
  await headerCheck.page.locator('.hub-header').waitFor({ state: 'visible' });
  const headerBox = await headerCheck.page.locator('.hub-header').boundingBox();
  const articleTitleBox = await headerCheck.page.locator('h1').boundingBox();
  const belowTitleAd = await headerCheck.page.locator('.article-display').first().boundingBox();
  assert.ok(articleTitleBox.y >= headerBox.y + headerBox.height, 'article title follows the site header');
  assert.ok(belowTitleAd.y >= articleTitleBox.y + articleTitleBox.height, 'ad stays below the title with the site header visible');
  await headerCheck.context.close();
  console.log('No fill, loading timeout without Cancel, blocked storage, static text, no-JS preview and unchanged cloudstorage pass. All external ad traffic blocked.');
} finally { await browser.close(); }
