import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const article = JSON.parse(fs.readFileSync('data/articles/cloudstorage/en.json', 'utf8'));
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

async function checkArticle(page) {
  assert.equal(await page.locator('#article-content h1').innerText(), article.metadata.title);
  assert.equal(await page.locator('#article-content section').count(), article.sections[0].points.length);
  assert.ok((await page.title()).startsWith(article.metadata.title));
  assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).pathname, '/cloudstorage');
  assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), article.metadata.description);
  assert.equal(await page.locator('meta[property="og:type"]').getAttribute('content'), 'article');
  assert.equal(await page.locator('.simple-footer').count(), 1);
  assert.equal(await page.locator('.site-footer').count(), 0);
  assert.equal(await page.locator('[data-embedded-quiz] .quiz-engine__about').count(), 0);
  assert.doesNotMatch(await page.locator('.simple-footer').innerText(), /quiz|reveal|test/i);
  assert.equal(await page.locator('.simple-footer a[href="/info/contact"]').count(), 1);
  assert.equal(await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)');
  const data = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent)));
  const structuredArticle = data.find(item => item['@type'] === 'Article');
  assert.equal(structuredArticle.headline, article.metadata.title);
  assert.ok(structuredArticle.articleBody.includes('Google Workspace backup is different from Google Vault'));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}

try {
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(`${base}/cloudstorage?q=years-left`);
  await checkArticle(staticPage);
  for (const point of article.sections[0].points) {
    assert.ok((await staticPage.locator('#article-content').innerText()).includes(point.paragraphs[0]));
  }
  await staticContext.close();
  console.log('No JavaScript: all 21 article sections, metadata, structured data and neutral footer readable.');

  const earlyContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const earlyPage = await earlyContext.newPage();
  await earlyPage.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin !== new URL(base).origin || (url.pathname.startsWith('/_next/') && url.pathname.endsWith('.js'))
      ? route.abort() : route.continue();
  });
  await earlyPage.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); }; });
  await earlyPage.goto(`${base}/cloudstorage?q=years-left&fbclid=test`, { waitUntil: 'domcontentloaded' });
  assert.equal(await earlyPage.locator('[data-article-quiz-preview="years-left"] .quiz-engine__landing').isVisible(), true);
  assert.equal(await earlyPage.locator('.hub-header').isVisible(), false, 'fbclid hides header before hydration even when storage throws');
  await earlyContext.close();
  console.log('Before application JavaScript: quiz landing already visible; fbclid header hidden even without storage.');

  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    const payloads = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /hydration|Minified React error/i.test(message.text())) errors.push(message.text()); });
    page.on('request', request => { if (request.url().includes('/quiz-data/')) payloads.push(request.url()); });
    await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    await page.addInitScript(() => {
      window.adCalls = [];
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
        defineOutOfPageSlot(path, format) { const slot = { path, format, addService() { return this; } }; window.adCalls.push(slot); return slot; },
        display(slot) { queueMicrotask(() => emit('rewardedSlotReady', slot, { makeRewardedVisible() { queueMicrotask(() => { emit('rewardedSlotGranted', slot); emit('rewardedSlotClosed', slot); }); } })); },
      };
    });
    for (const query of ['', '?q=missing', '?q=years-left&q=memory', '?q=..%2Fyears-left']) {
      await page.goto(`${base}/cloudstorage${query}`);
      await checkArticle(page);
      assert.equal(await page.locator('[data-embedded-quiz]').count(), 0);
    }
    assert.equal(payloads.length, 0, 'no query or invalid query loads no quiz payload');
    let releasePayload;
    const heldPayload = new Promise(resolve => { releasePayload = resolve; });
    await page.route('**/quiz-data/en/years-left.json', async route => { await heldPayload; await route.continue(); });
    await page.goto(`${base}/cloudstorage?q=years-left&test_keep=1`, { waitUntil: 'domcontentloaded' });
    const preview = page.locator('[data-article-quiz-preview="years-left"]');
    await preview.waitFor({ state: 'visible' });
    const previewBox = await preview.boundingBox();
    const initialArticleY = (await page.locator('#article-content').boundingBox()).y;
    await page.waitForTimeout(600);
    assert.equal(await preview.isVisible(), true, 'initial landing stays visible while quiz data is delayed');
    releasePayload();
    await page.locator('[data-embedded-quiz="years-left"] .quiz-engine__landing').waitFor();
    const liveBox = await page.locator('[data-embedded-quiz="years-left"]').boundingBox();
    assert.ok(Math.abs(previewBox.height - liveBox.height) < 1, 'handoff preserves quiz height');
    assert.ok(Math.abs(initialArticleY - (await page.locator('#article-content').boundingBox()).y) < 1, 'article does not jump when the quiz becomes interactive');
    assert.equal(await preview.isVisible(), false);
    await page.unroute('**/quiz-data/en/years-left.json');
    await checkArticle(page);
    const originalText = await page.locator('#article-content').innerText();
    const originalTitle = await page.title();
    assert.equal(await page.evaluate(() => window.adCalls.length), 0);
    const sourceResponse = await page.request.get(`${base}/quiz-data/en/years-left.json`);
    assert.equal(sourceResponse.status(), 200);
    assert.match(sourceResponse.headers()['content-type'], /application\/json/);
    await page.screenshot({ path: `/tmp/cloudstorage-quiz-${width}.png` });
    await page.locator('[data-embedded-quiz] .quiz-engine__landing .quiz-engine__primary').click();
    await page.locator('[data-question-id]').waitFor();
    await page.locator('.quiz-engine__answer').first().click();
    await page.waitForTimeout(650);
    assert.equal(await page.title(), originalTitle);
    assert.equal(await page.locator('#article-content').innerText(), originalText);
    await checkArticle(page);
    assert.equal(await page.evaluate(() => window.adCalls.every(slot => slot.path === '/22677279144/rewarded' && slot.format === 'REWARDED')), true);
    const questionId = await page.locator('[data-question-id]').getAttribute('data-question-id');
    await page.reload();
    await page.locator(`[data-question-id="${questionId}"]`).waitFor();
    await checkArticle(page);
    await page.evaluate(() => { sessionStorage.clear(); localStorage.clear(); });
    let releaseStartPayload;
    const heldStartPayload = new Promise(resolve => { releaseStartPayload = resolve; });
    await page.route('**/quiz-data/en/years-left.json', async route => { await heldStartPayload; await route.continue(); });
    await page.goto(`${base}/cloudstorage?q=years-left`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-article-quiz-preview="years-left"] .quiz-engine__primary').click();
    releaseStartPayload();
    await page.locator('[data-question-id]').waitFor();
    assert.equal(await page.evaluate(() => window.adCalls.length), 1, 'an early Start click runs the normal rewarded gate exactly once');
    await page.unroute('**/quiz-data/en/years-left.json');
    assert.deepEqual(errors, []);
    console.log(`${width}px: rewarded quiz loads above unchanged article; answer and reload preserve cloud title, content, metadata and footer.`);
    await context.close();
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route('**/quiz-data/**', route => route.abort());
  await page.goto(`${base}/cloudstorage?q=years-left`);
  await checkArticle(page);
  assert.equal(await page.locator('[data-embedded-quiz]').count(), 0);
  await page.goto(`${base}/years-left`);
  await page.locator('.quiz-engine__about').waitFor();
  assert.equal(await page.locator('.quiz-engine__about h2').innerText(), 'About This Quiz');
  await context.close();
  console.log('Failed optional quiz: article remains accessible. Standalone quiz retains About This Quiz.');
} finally {
  await browser.close();
}
