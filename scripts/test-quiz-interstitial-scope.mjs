import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { resolveQuizLocaleManifest } from '../lib/quiz/localeManifest.mjs';

const firstStageCount = resolveQuizLocaleManifest(JSON.parse(fs.readFileSync('data/quizzes/years-left/quiz.json', 'utf8')), 'en').structure.stages[0].questionIds.length;

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

async function contextFor(blocked = '') {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await context.addInitScript(blocked => {
    window.adCalls = [];
    window.googletag = {
      cmd: { push(fn) { fn(); } },
      enums: { OutOfPageFormat: { INTERSTITIAL: 'INTERSTITIAL', REWARDED: 'REWARDED' } },
      defineOutOfPageSlot(path, format) {
        const slot = { path, format, addService() { return this; }, setConfig(config) { this.config = config; } };
        window.adCalls.push(slot);
        return slot;
      },
      pubads() { return {}; }, enableServices() {}, display() {}, destroySlots() {},
    };
    for (const name of ['sessionStorage', 'localStorage']) {
      if (blocked === name || blocked === 'both') Object.defineProperty(window, name, { get() { throw Error('storage denied'); } });
    }
  }, blocked);
  return context;
}

try {
  const context = await contextFor();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/fr', '/info/privacy', '/fr/info/about']) {
    await page.goto(`${base}${route}`);
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.adCalls.length), 0, `${route}: no interstitial slot`);
  }
  await page.goto(`${base}/fr/memory?fbclid=scope-test`);
  await page.waitForFunction(() => window.adCalls.length === 1);
  assert.equal(await page.evaluate(() => window.adCalls[0].format), 'INTERSTITIAL');
  assert.equal(await page.evaluate(() => window.adCalls[0].path), '/22677279144/display');
  assert.equal(await page.evaluate(() => Object.values(window.adCalls[0].config.interstitial.triggers).every(value => value === false)), true);
  assert.equal(await page.evaluate(() => window.adCalls[0].config.interstitial.requireStorageAccess), true);
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('a:not([data-quiz-interstitial="true"])')].every(link => link.getAttribute('data-google-interstitial') === 'false')), true);
  await page.locator('.quiz-engine__landing a.quiz-engine__primary').click();
  await page.locator('[data-question-id]').waitFor();
  assert.equal(new URL(page.url()).searchParams.get('fbclid'), 'scope-test');
  assert.equal(await page.locator('a.quiz-engine__answer').count(), 0, 'study screen has no answer-link opportunities yet');
  await page.locator('.quiz-engine__study .quiz-engine__primary').click();
  assert.ok(await page.locator('a.quiz-engine__answer[data-quiz-interstitial="true"]').count() > 0, 'actual answers are eligible links');
  assert.deepEqual(errors, []);
  await context.close();

  for (const blocked of ['sessionStorage', 'localStorage', 'both']) {
    const context = await contextFor(blocked);
    const page = await context.newPage();
    let documents = 0;
    page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++; });
    await page.goto(`${base}/years-left?fbclid=storage-test`);
    await page.waitForFunction(() => window.adCalls.length === 1);
    const startDocuments = documents;
    await page.locator('.quiz-engine__landing a.quiz-engine__primary').click();
    await page.locator('[data-question-id]').waitFor();
    assert.equal(documents, startDocuments + (blocked === 'both' ? 0 : 1), `${blocked}: safe Start behavior`);
    for (let question = 0; question < firstStageCount; question++) {
      const current = page.locator('[data-question-id]');
      const id = await current.getAttribute('data-question-id');
      await current.locator('.quiz-engine__answer').first().click();
      await page.waitForFunction(id => document.querySelector('[data-question-id]')?.getAttribute('data-question-id') !== id, id);
    }
    const checkpoint = page.locator('.quiz-engine__checkpoint');
    await checkpoint.waitFor();
    const beforeLink = documents;
    await checkpoint.locator('a.quiz-engine__primary').click();
    await page.locator('[data-question-id="yl-s2q1"]').waitFor();
    assert.equal(documents, beforeLink + (blocked === 'both' ? 0 : 1), `${blocked}: checkpoint saves before navigation`);
    if (blocked !== 'both') {
      const count = await page.evaluate(() => {
        let data;
        try { data = Object.keys(sessionStorage).find(key => key.startsWith('rainbowhub:quiz-progress:')); if (data) return Object.keys(JSON.parse(sessionStorage.getItem(data)).answers).length; } catch {}
        data = Object.keys(localStorage).find(key => key.startsWith('rainbowhub:quiz-progress:'));
        return Object.keys(JSON.parse(localStorage.getItem(data)).answers).length;
      });
      assert.equal(count, firstStageCount, `${blocked}: every previous answer survives`);
    }
    await context.close();
  }
  console.log('PASS: quiz-only scope, permitted links, preserved attribution, both storage fallbacks and safe fully-blocked storage.');
} finally {
  await browser.close();
}
