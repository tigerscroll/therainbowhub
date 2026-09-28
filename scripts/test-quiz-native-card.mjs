import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';
import { resolveQuizLocaleManifest } from '../lib/quiz/localeManifest.mjs';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const slugs = process.env.QUIZZES?.split(',') ?? fs.readdirSync('data/quizzes').filter(slug => fs.existsSync(`data/quizzes/${slug}/quiz.json`));
const locales = process.env.LOCALES?.split(',') ?? fs.readdirSync('data/i18n').map(file => file.replace('.json', ''));
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

async function open(path, width = 390, mode = 'filled') {
  const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Never contact an ad server or create real impressions during automated tests.
  await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await page.addInitScript(mode => {
    window.nativeTest = { native: [], rewards: [], destroyed: [] };
    if (mode === 'blocked') return;
    const listeners = new Map();
    const emit = (name, slot, more = {}) => (listeners.get(name) ?? []).forEach(cb => cb({ slot, ...more }));
    const service = {
      addEventListener(name, cb) { listeners.set(name, [...(listeners.get(name) ?? []), cb]); },
      removeEventListener(name, cb) { listeners.set(name, (listeners.get(name) ?? []).filter(value => value !== cb)); },
      updateCorrelator() {},
    };
    window.googletag = {
      cmd: { push(cb) { cb(); } },
      defineSlot(path, sizes, id) {
        const slot = { path, sizes, id, addService() { return this; } };
        window.nativeTest.native.push({ path, sizes, id });
        return slot;
      },
      defineOutOfPageSlot(path, format) {
        window.nativeTest.rewards.push({ path, format });
        return { path, format, addService() { return this; } };
      },
      pubads: () => service,
      enableServices() { this.pubadsReady = true; },
      destroySlots(slots) {
        for (const slot of slots) {
          window.nativeTest.destroyed.push(slot.path);
          if (slot.id) document.getElementById(slot.id)?.replaceChildren();
        }
      },
      enums: { OutOfPageFormat: { REWARDED: 'REWARDED' } },
      display(slot) {
        if (slot.id) {
          if (mode === 'filled') {
            const creative = document.createElement('iframe');
            creative.title = 'Mock native creative — no real ad request';
            creative.style.cssText = 'display:block;width:100%;height:230px;border:0';
            creative.srcdoc = '<body style="margin:0;background:#f5f5f5;font:16px Arial;color:#333;display:grid;place-items:center;height:100%">Native card test creative</body>';
            document.getElementById(slot.id).appendChild(creative);
          }
          queueMicrotask(() => emit('slotRenderEnded', slot, { isEmpty: mode !== 'filled' }));
        } else {
          queueMicrotask(() => emit('rewardedSlotReady', slot, {
            makeRewardedVisible() { queueMicrotask(() => { emit('rewardedSlotGranted', slot); emit('rewardedSlotClosed', slot); }); },
          }));
        }
      },
    };
  }, mode);
  await page.goto(`${base}${path}`);
  return { context, page, errors };
}

async function enter(page) {
  await page.locator('[data-question-id], .quiz-engine__landing').first().waitFor();
  if (await page.locator('.quiz-engine__landing').count()) await page.locator('.quiz-engine__landing .quiz-engine__primary').click();
  await page.locator('[data-question-id]').waitFor();
}

async function answersReady(page) {
  const study = page.locator('.quiz-engine__study');
  if (await study.count()) await study.locator('button').click();
  await page.locator('.quiz-engine__answer').first().waitFor();
}

async function checkPlacement(page, locale) {
  const card = page.locator('[data-quiz-native-card][data-state="filled"]');
  await card.waitFor();
  const expectedLabel = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, 'utf8')).ad.advertisement;
  assert.equal(await card.locator('.quiz-native-card__label').innerText(), expectedLabel);
  assert.equal(await page.locator('[data-quiz-native-card]').count(), 1);
  const layout = await card.evaluate(node => {
    const question = node.closest('[data-question-id]');
    const style = getComputedStyle(question);
    const answers = question.querySelector('.quiz-engine__answers').getBoundingClientRect();
    const card = node.getBoundingClientRect();
    const slot = node.querySelector('.quiz-native-card__slot').getBoundingClientRect();
    return {
      belowAnswers: card.top >= answers.bottom + 20,
      contentWidth: question.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      width: slot.width, height: slot.height,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert.equal(layout.belowAnswers, true, JSON.stringify(layout));
  assert.ok(Math.abs(layout.contentWidth - layout.width) < 1, JSON.stringify(layout));
  assert.equal(layout.height, 230, 'Fluid creative height is not clipped or fixed by the site');
  assert.equal(layout.overflow, false);
  const calls = await page.evaluate(() => window.nativeTest);
  assert.ok(calls.native.every(call => call.path === '/22677279144/quiz_native_card' && JSON.stringify(call.sizes) === '["fluid"]'));
  assert.ok(calls.rewards.every(call => call.path === '/22677279144/rewarded' && call.format === 'REWARDED'));
}

async function checkRoute(slug, locale, width = 390, checkpoint = false) {
  const manifest = resolveQuizLocaleManifest(JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, 'utf8')), locale);
  const path = `/${locale === 'en' ? '' : `${locale}/`}${slug}`;
  const { context, page, errors } = await open(path, width);
  try {
    await enter(page);
    await answersReady(page);
    await checkPlacement(page, locale);
    const id = await page.locator('.quiz-native-card__slot').getAttribute('id');
    const count = checkpoint ? manifest.structure.stages[0].questionIds.length : 1;
    for (let index = 0; index < count; index++) {
      await answersReady(page);
      const questionId = await page.locator('[data-question-id]').getAttribute('data-question-id');
      assert.equal(await page.locator('.quiz-native-card__slot').getAttribute('id'), id, 'one stable slot across SPA answers and study cues');
      assert.equal(await page.evaluate(() => window.nativeTest.native.length), 1, 'no per-question refresh');
      await page.locator('.quiz-engine__answer').first().click();
      await page.locator(`[data-question-id="${questionId}"]`).waitFor({ state: 'detached' });
    }
    if (checkpoint) {
      await page.locator('.quiz-engine__checkpoint').waitFor();
      assert.equal(await page.locator('[data-quiz-native-card]').count(), 0);
      if (manifest.engine.hardRefreshCheckpoints) {
        assert.equal(await page.evaluate(() => window.nativeTest.native.length), 0, 'restoring a checkpoint after reload never requests a hidden native card');
      } else {
        assert.ok((await page.evaluate(() => window.nativeTest.destroyed)).includes('/22677279144/quiz_native_card'));
      }
      await page.locator('.quiz-engine__checkpoint .quiz-engine__primary').click();
      await answersReady(page);
      await checkPlacement(page, locale);
      assert.equal(await page.evaluate(() => window.nativeTest.native.length), manifest.engine.hardRefreshCheckpoints ? 1 : 2);
    } else {
      await answersReady(page);
      await checkPlacement(page, locale);
      assert.equal(await page.evaluate(() => window.nativeTest.native.length), 1);
    }
    if (checkpoint) await page.screenshot({ path: `/tmp/native-card-${slug}-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    console.log(`PASS ${slug}/${locale} ${width}px${checkpoint ? ' including checkpoint/remount' : ''}`);
  } finally { await context.close(); }
}

try {
  const queue = slugs.flatMap(slug => locales.map(locale => ({ slug, locale })));
  async function worker() { while (queue.length) { const { slug, locale } = queue.shift(); await checkRoute(slug, locale); } }
  await Promise.all(Array.from({ length: 4 }, worker));
  for (const width of [320, 1440]) await checkRoute('years-left', 'en', width, true);
  await checkRoute('memory', 'en', 390, true);
  for (const path of ['/', '/info/about']) {
    const { context, page } = await open(path);
    assert.equal(await page.locator('[data-quiz-native-card]').count(), 0);
    assert.equal(await page.evaluate(() => window.nativeTest.native.length), 0);
    await context.close();
  }
  for (const mode of ['empty', 'blocked']) {
    const { context, page, errors } = await open('/years-left', 390, mode);
    const card = page.locator('[data-quiz-native-card]');
    await card.waitFor({ state: 'attached' });
    if (mode === 'empty') await page.waitForFunction(() => document.querySelector('[data-quiz-native-card]')?.dataset.state === 'empty');
    assert.equal(await card.evaluate(node => node.getBoundingClientRect().height), 0, 'no empty ad frame');
    const oldId = await page.locator('[data-question-id]').getAttribute('data-question-id');
    await page.locator('.quiz-engine__answer').first().click();
    await page.locator(`[data-question-id="${oldId}"]`).waitFor({ state: 'detached' });
    assert.deepEqual(errors, []);
    console.log(`PASS ${mode} ads: no blank frame, quiz still advances`);
    await context.close();
  }
} finally { await browser.close(); }
