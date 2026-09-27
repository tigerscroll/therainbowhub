import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const article = JSON.parse(fs.readFileSync('data/articles/cloudstorage/en.json', 'utf8'));
const quizSlugs = fs.readdirSync('data/quizzes').filter(slug => fs.existsSync(`data/quizzes/${slug}/quiz.json`));
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

async function localRequestsOnly(page, blockApplication = false) {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin !== new URL(base).origin || (blockApplication && url.pathname.startsWith('/_next/') && url.pathname.endsWith('.js'))
      ? route.abort() : route.continue();
  });
}

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
  assert.equal(await page.locator('[data-article-quiz-preview]').count(), 0);
  assert.doesNotMatch(await page.locator('.simple-footer').innerText(), /quiz|reveal|test/i);
  assert.equal(await page.locator('.simple-footer a[href="/info/contact"]').count(), 1);
  assert.equal(await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)');
  const data = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent)));
  const structuredArticle = data.find(item => item['@type'] === 'Article');
  assert.equal(structuredArticle.headline, article.metadata.title);
  assert.ok(structuredArticle.articleBody.includes('Google Workspace backup is different from Google Vault'));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}

function mockRewardedAds() {
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
}

try {
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await staticContext.newPage();
  await localRequestsOnly(staticPage);
  for (const slug of quizSlugs) {
    const response = await staticPage.goto(`${base}/cloudstorage/${slug}`);
    assert.equal(response.status(), 200);
    const html = await response.text();
    assert.equal((html.match(/<h1\b/g) ?? []).length, 2, `${slug}: static HTML contains exactly the quiz and article headings`);
    assert.doesNotMatch(html, /data-article-quiz-preview|article-quiz-first-paint/);
    assert.equal(await staticPage.locator('[data-embedded-quiz]').count(), 1);
    assert.equal(await staticPage.locator('[data-embedded-quiz]').getAttribute('data-embedded-quiz'), slug);
    assert.equal(await staticPage.locator('[data-embedded-quiz] .quiz-engine__landing').isVisible(), true);
    assert.equal(await staticPage.locator('[data-quiz-theme]').count(), 1);
    assert.ok((await staticPage.locator('#article-content').boundingBox()).y > (await staticPage.locator('#article-quiz').boundingBox()).y);
    await checkArticle(staticPage);
  }
  for (const query of ['', '?q=years-left', '?q=memory', '?q=years-left&q=vision']) {
    await staticPage.goto(`${base}/cloudstorage${query}`);
    await checkArticle(staticPage);
    assert.equal(await staticPage.locator('[data-embedded-quiz]').count(), 0);
    assert.equal(await staticPage.locator('h1').count(), 1);
    assert.equal(new URL(staticPage.url()).pathname, '/cloudstorage', 'no legacy redirect');
  }
  await staticContext.close();
  console.log(`No JavaScript: all ${quizSlugs.length} static quiz paths show only their selected landing above the complete article; legacy queries stay article-only.`);

  const earlyContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const earlyPage = await earlyContext.newPage();
  await localRequestsOnly(earlyPage, true);
  await earlyPage.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
    window.quizFirstPaint = null;
    new PerformanceObserver(list => {
      if (!list.getEntries().some(entry => entry.name === 'first-contentful-paint')) return;
      window.quizFirstPaint = {
        count: document.querySelectorAll('[data-embedded-quiz]').length,
        visible: Boolean(document.querySelector('[data-embedded-quiz="years-left"]')?.getBoundingClientRect().height),
        headerHidden: getComputedStyle(document.querySelector('.hub-header')).display === 'none',
      };
    }).observe({ type: 'paint', buffered: true });
  });
  await earlyPage.goto(`${base}/cloudstorage/years-left?fbclid=test`, { waitUntil: 'domcontentloaded' });
  await earlyPage.waitForFunction(() => window.quizFirstPaint !== null);
  assert.deepEqual(await earlyPage.evaluate(() => window.quizFirstPaint), { count: 1, visible: true, headerHidden: true });
  await checkArticle(earlyPage);
  await earlyContext.close();
  console.log('Application JavaScript blocked: selected quiz visible at first contentful paint; fbclid still hides the header even when storage is unavailable.');

  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    const payloads = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /hydration|Minified React error/i.test(message.text())) errors.push(message.text()); });
    page.on('request', request => { if (/\/(quiz-data|quiz-preview)\//.test(request.url())) payloads.push(request.url()); });
    await localRequestsOnly(page);
    await page.addInitScript(mockRewardedAds);
    await page.addInitScript(() => {
      window.quizRenderGaps = [];
      function frame() {
        if (location.pathname === '/cloudstorage/years-left' && document.getElementById('article-content')) {
          if (!document.querySelector('[data-embedded-quiz="years-left"]')?.getBoundingClientRect().height) window.quizRenderGaps.push(performance.now());
        }
        if (performance.now() < 6000) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
    let releaseApplication;
    const heldApplication = new Promise(resolve => { releaseApplication = resolve; });
    await page.route('**/_next/**/*.js', async route => { await heldApplication; await route.continue(); });
    await page.goto(`${base}/cloudstorage/years-left?test_keep=1`, { waitUntil: 'commit' });
    const landing = page.locator('[data-embedded-quiz="years-left"] .quiz-engine__landing');
    await landing.waitFor();
    const initialBox = await landing.boundingBox();
    const initialArticleY = (await page.locator('#article-content').boundingBox()).y;
    await page.waitForTimeout(600);
    assert.equal(await landing.isVisible(), true, 'real landing remains visible while application scripts are delayed');
    releaseApplication();
    await page.waitForLoadState('load');
    await page.waitForTimeout(300);
    assert.ok(Math.abs(initialBox.height - (await landing.boundingBox()).height) < 1, 'hydration preserves landing height');
    assert.ok(Math.abs(initialArticleY - (await page.locator('#article-content').boundingBox()).y) < 1, 'article does not jump on hydration');
    assert.deepEqual(await page.evaluate(() => window.quizRenderGaps), []);
    await page.unroute('**/_next/**/*.js');
    await checkArticle(page);
    const originalText = await page.locator('#article-content').innerText();
    const originalTitle = await page.title();
    assert.equal(await page.evaluate(() => window.adCalls.length), 0);
    await page.screenshot({ path: `/tmp/cloudstorage-static-quiz-${width}.png` });
    await landing.locator('.quiz-engine__primary').click();
    await page.locator('[data-question-id]').waitFor();
    await page.locator('.quiz-engine__answer').first().click();
    await page.waitForTimeout(650);
    assert.equal(await page.title(), originalTitle);
    assert.equal(await page.locator('#article-content').innerText(), originalText);
    assert.equal(await page.evaluate(() => window.adCalls.length), 1, 'Start runs one rewarded gate');
    assert.equal(await page.evaluate(() => window.adCalls.every(slot => slot.path === '/22677279144/rewarded' && slot.format === 'REWARDED')), true);
    const questionId = await page.locator('[data-question-id]').getAttribute('data-question-id');
    await page.reload();
    await page.locator(`[data-question-id="${questionId}"]`).waitFor();
    await checkArticle(page);
    await page.goto(`${base}/cloudstorage/years-left?q=memory&fbclid=test`);
    assert.equal(await page.locator('[data-embedded-quiz]').getAttribute('data-embedded-quiz'), 'years-left', 'path, not q, determines the quiz');
    assert.equal(await page.locator('.hub-header').isVisible(), false);
    await page.goto(`${base}/cloudstorage?q=years-left`);
    assert.equal(await page.locator('[data-embedded-quiz]').count(), 0);
    assert.equal(new URL(page.url()).pathname, '/cloudstorage');
    assert.equal(await page.locator('.hub-header').isVisible(), false, 'fbclid session behaviour preserved');
    const missing = await page.goto(`${base}/cloudstorage/not-a-quiz`);
    assert.equal(missing.status(), 404);
    assert.equal(await page.locator('[data-embedded-quiz]').count(), 0);
    await page.goto(`${base}/years-left`);
    await page.locator('.quiz-engine__about').waitFor();
    assert.equal(await page.locator('.quiz-engine__about h2').innerText(), 'About This Quiz');
    assert.deepEqual(payloads, [], 'static embeds require no later quiz payload or preview request');
    assert.deepEqual(errors, []);
    console.log(`${width}px: no insertion flicker or hydration shift; rewarded Start, answer, resume, metadata, header hiding, ignored queries and 404s verified.`);
    await context.close();
  }
} finally {
  await browser.close();
}
