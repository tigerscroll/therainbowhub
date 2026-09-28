import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const locales = fs.readdirSync('data/i18n').filter(file => file.endsWith('.json')).map(file => file.slice(0, -5));
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

function mockAds() {
  const listeners = new Map();
  const state = window.quizOnlyTest = { mode: 'loading', requests: [], events: [], slot: null };
  const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(callback => callback({ slot, ...extra }));
  state.emit = name => emit(name, state.slot);
  window.fbq = (...args) => state.events.push(args);
  const pubads = {
    addEventListener(name, callback) { listeners.set(name, [...(listeners.get(name) ?? []), callback]); },
    updateCorrelator() {},
  };
  window.googletag = {
    cmd: { push(callback) { callback(); } },
    pubads: () => pubads, enableServices() {}, setConfig() {}, destroySlots() {},
    enums: { OutOfPageFormat: { REWARDED: 'REWARDED' } },
    defineSlot() { throw Error('The quiz-only site must not request display ads'); },
    defineOutOfPageSlot(path, format) {
      const slot = { addService() { return this; } };
      state.requests.push({ path, format });
      state.slot = slot;
      return state.mode === 'unavailable' ? null : slot;
    },
    display(slot) {
      state.ready = () => emit('rewardedSlotReady', slot, {
        makeRewardedVisible() {
          if (state.mode === 'automatic') queueMicrotask(() => {
            emit('rewardedSlotGranted', slot);
            emit('rewardedSlotClosed', slot);
          });
        },
      });
      if (state.mode !== 'loading') queueMicrotask(state.ready);
    },
  };
}

async function contextFor(width = 390, javaScriptEnabled = true) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, javaScriptEnabled });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  if (javaScriptEnabled) await context.addInitScript(mockAds);
  return context;
}

try {
  const context = await contextFor();
  const page = await context.newPage();
  assert.equal((await page.goto(base)).status(), 200);
  await page.locator('.hub-quiz-grid').waitFor();
  assert.ok(await page.locator('.hub-quiz-grid a[href="/years-left"]').count());
  assert.equal(await page.locator('.site-footer').count(), 1);
  assert.equal(await page.locator('.simple-footer, .article-display, [data-embedded-quiz]').count(), 0);
  assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 0);
  for (const route of ['/makemoney', '/monetize', '/cloudstorage', '/cloudstorage?q=years-left', '/cloudstorage/years-left', '/cloudstorage/memory', '/fr/cloudstorage/years-left', '/article-data/cloudstorage/1', '/article-data/prostate/1', '/prostate', '/monetize/1']) {
    assert.equal((await page.request.get(`${base}${route}`)).status(), 404, route);
  }
  for (const slug of ['memory', 'vision']) {
    await page.goto(`${base}/${slug}`);
    await page.locator('.quiz-engine__landing').waitFor();
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 0, `${slug} waits for Start`);
  }
  await context.close();

  const noJs = await contextFor(390, false);
  const staticPage = await noJs.newPage();
  await staticPage.goto(`${base}/years-left`);
  assert.equal(await staticPage.locator('[data-question-id="yl-s1q1"]').count(), 1, 'question one is in the initial HTML');
  assert.ok((await staticPage.locator('.quiz-engine__progress-head > strong[data-entry]').textContent()).endsWith('Death Clock Test'), 'the themed identity badge is present before JavaScript');
  assert.equal(await staticPage.locator('.quiz-engine__landing').count(), 0);
  await noJs.close();

  const cases = [[320, 'en'], [390, 'en'], [1440, 'en'], ...locales.filter(locale => locale !== 'en').map(locale => [390, locale])];
  for (const [width, locale] of cases) {
    const context = await contextFor(width);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const route = `${locale === 'en' ? '' : `/${locale}`}/years-left`;
    await page.goto(`${base}${route}`);
    const question = page.locator('[data-question-id="yl-s1q1"]');
    const choice = question.locator('.quiz-engine__answer').nth(1);
    await choice.waitFor();
    await page.waitForFunction(() => !document.querySelector('.quiz-engine__answer').disabled);
    const note = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, 'utf8')).ad.continueNote;
    const localizedTitle = JSON.parse(fs.readFileSync(`data/quizzes/years-left/${locale}.json`, 'utf8')).stages['stage-1'].questions['yl-s1q1'].headerLabel;
    const entryBadge = page.locator('.quiz-engine__progress-head > strong[data-entry]');
    assert.ok((await entryBadge.textContent()).endsWith(localizedTitle));
    const entryMark = entryBadge.locator('.quiz-engine__entry-mark[aria-hidden="true"]');
    assert.equal(await entryMark.count(), 1, 'the first screen has a decorative hourglass');
    const icon = await entryMark.evaluate(async node => {
      const style = getComputedStyle(node);
      const image = new Image();
      image.src = style.backgroundImage.match(/^url\("(.+)"\)$/)?.[1] ?? '';
      await image.decode();
      return { src: image.src, width: image.naturalWidth, height: image.naturalHeight, fit: style.backgroundSize };
    });
    assert.equal(icon.src, `${base}/quizzes/years-left/assets/items/hourglass-icon.webp`, 'reuse the original landing-page artwork');
    assert.ok(icon.width > 0 && icon.height > 0, 'the original artwork loads successfully');
    assert.equal(icon.fit, 'contain', 'the artwork keeps its original proportions');
    const titleAppearance = await entryBadge.evaluate(node => ({
      fontSize: parseFloat(getComputedStyle(node).fontSize),
      questionSize: parseFloat(getComputedStyle(document.querySelector('.quiz-engine__question h1')).fontSize),
      bottom: node.getBoundingClientRect().bottom,
      questionTop: document.querySelector('.quiz-engine__question h1').getBoundingClientRect().top,
      textTransform: getComputedStyle(node).textTransform,
      border: getComputedStyle(node).borderTopWidth,
    }));
    assert.equal(titleAppearance.fontSize, 14);
    assert.ok(titleAppearance.fontSize <= titleAppearance.questionSize / 2, 'question remains the dominant headline');
    assert.ok(titleAppearance.bottom < titleAppearance.questionTop, 'title sits separately above the question');
    assert.equal(titleAppearance.textTransform, 'none');
    assert.equal(titleAppearance.border, '2px', 'the first screen uses the themed badge');
    assert.equal(await question.locator('.quiz-engine__answer').count(), 3, 'three choices on the first question');
    assert.equal(await page.locator('#quiz-first-answer-note').textContent(), note);
    const noteAppearance = await page.locator('#quiz-first-answer-note').evaluate(node => ({
      top: node.getBoundingClientRect().top,
      answerBottom: node.parentElement.querySelector('.quiz-engine__answers').getBoundingClientRect().bottom,
      fontSize: getComputedStyle(node).fontSize,
      fontWeight: getComputedStyle(node).fontWeight,
      color: getComputedStyle(node).color,
      answerColor: getComputedStyle(node.parentElement.querySelector('.quiz-engine__answer')).color,
    }));
    assert.ok(noteAppearance.top >= noteAppearance.answerBottom + 10, 'ad note sits below the answers with space');
    assert.equal(noteAppearance.fontSize, '12px');
    assert.equal(noteAppearance.fontWeight, '400');
    assert.notEqual(noteAppearance.color, noteAppearance.answerColor, 'note uses muted text');
    assert.equal(await choice.getAttribute('aria-describedby'), 'quiz-first-answer-note');
    assert.equal(await page.locator('.quiz-engine__landing').count(), 0);
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 0, 'no ad on arrival');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (locale === 'en') await page.screenshot({ path: `/tmp/years-left-first-answer-${width}.png` });
    await choice.click();
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 1);
    assert.equal(await question.locator('.quiz-engine__answer').evaluateAll(buttons => buttons.every(button => button.disabled)), true);
    assert.equal(await choice.getAttribute('data-pending'), 'true');
    assert.equal(await choice.getAttribute('data-selected'), 'true');
    assert.equal(await choice.getAttribute('aria-pressed'), 'true');
    assert.equal(await choice.getAttribute('aria-busy'), 'true');
    assert.equal(await question.locator('[data-pending]').count(), 1, 'only the tapped answer is highlighted');
    assert.equal(await choice.evaluate(node => getComputedStyle(node).opacity), '1');
    assert.notEqual(await choice.evaluate(node => getComputedStyle(node).backgroundColor), await question.locator('.quiz-engine__answer').first().evaluate(node => getComputedStyle(node).backgroundColor));
    await page.waitForTimeout(550);
    if (locale === 'en') await page.screenshot({ path: `/tmp/years-left-answer-loading-${width}.png` });
    await page.evaluate(() => window.quizOnlyTest.ready());
    assert.equal(await question.count(), 1, 'answer does not advance while an ad is open');
    await page.evaluate(() => window.quizOnlyTest.emit('rewardedSlotClosed'));
    await page.waitForFunction(() => !document.querySelector('.quiz-engine__answer').disabled);
    await page.waitForTimeout(550);
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 1, 'closing does not automatically reopen');
    assert.equal(await question.count(), 1);
    assert.equal(await question.locator('[data-selected], [data-pending]').count(), 0, 'early closure clears the temporary selection');
    assert.equal(await page.locator('#quiz-first-answer-note').textContent(), note);

    await page.evaluate(() => { window.quizOnlyTest.mode = 'manual'; });
    const retryChoice = question.locator('.quiz-engine__answer').nth(2);
    const answerId = await retryChoice.getAttribute('data-answer-id');
    await retryChoice.click();
    assert.equal(await retryChoice.getAttribute('data-pending'), 'true', 'a different answer can be selected on retry');
    assert.equal(await choice.getAttribute('data-pending'), null, 'the old choice does not stay selected');
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 2);
    await page.evaluate(() => window.quizOnlyTest.emit('rewardedSlotGranted'));
    assert.equal(await question.count(), 1, 'grant alone keeps the quiz behind the ad until closure');
    const questionAfterClose = await page.evaluate(() => {
      window.quizOnlyTest.emit('rewardedSlotClosed');
      return new Promise(resolve => requestAnimationFrame(() => {
        resolve(document.querySelector('[data-question-id]')?.getAttribute('data-question-id'));
      }));
    });
    assert.equal(questionAfterClose, 'yl-s1q2', 'the next question is ready for the first paint after a completed ad closes');
    await page.waitForTimeout(550);
    assert.equal(await page.locator('[data-question-id="yl-s1q2"]').count(), 1, 'no leftover answer timer skips question two');
    assert.equal(await entryBadge.count(), 0, 'the identity badge is only on question one');
    assert.equal(await page.locator('.quiz-engine__progress-head > strong').count(), 1, 'later questions keep the chapter badge');
    assert.equal(await page.locator('.quiz-engine__answer').count(), 3, 'later questions also have three choices');
    assert.equal(await page.locator('[data-pending]').count(), 0);
    assert.equal(await page.locator('#quiz-first-answer-note').count(), 0);
    const key = `rainbowhub:quiz-progress:v4:years-left:${locale}`;
    const saved = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), key);
    assert.equal(saved.answers['yl-s1q1'], answerId, 'the chosen answer is saved after completion');
    assert.equal(saved.questionIndex, 1, 'answer and next question are saved together');
    assert.equal(Object.keys(saved.answers).length, 1, 'the first answer is recorded only once');
    assert.equal(await page.evaluate(() => window.quizOnlyTest.events.filter(event => event[1] === 'QuizStart').length), 1);
    await page.locator('.quiz-engine__answer').first().click();
    await page.locator('[data-question-id="yl-s1q3"]').waitFor();
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 2, 'later answers do not request ads');
    await page.evaluate(key => {
      const progress = JSON.parse(sessionStorage.getItem(key));
      const signature = JSON.parse(progress.signature);
      signature.engine.startOnLoad = false;
      progress.signature = JSON.stringify(signature);
      sessionStorage.setItem(key, JSON.stringify(progress));
      localStorage.setItem(key, JSON.stringify(progress));
    }, key);
    await page.reload();
    await page.locator('[data-question-id="yl-s1q3"]').waitFor();
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 0, 'existing progress resumes without another first-answer ad');
    await page.locator('.quiz-engine__about-restart').click();
    await page.locator('[data-question-id="yl-s1q1"]').waitFor();
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 0, 'restart returns directly to question one');
    await page.evaluate(() => { window.quizOnlyTest.mode = 'unavailable'; });
    await page.locator('.quiz-engine__answer').first().click();
    await page.locator('[data-question-id="yl-s1q2"]').waitFor();
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.length), 3, 'no fill falls through after the existing bounded retries');
    assert.equal(await page.evaluate(() => window.quizOnlyTest.requests.every(ad => ad.path === '/22677279144/rewarded' && ad.format === 'REWARDED')), true);
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${locale}/${width}px PASS: first paint, immediate completed-ad transition, early close/retry, correct saved choice, no-fill, resume and restart`);
  }
  console.log('Quiz-only routes PASS: removed pages and embeds return 404; original homepage, footer and other quiz landings remain.');
} finally {
  await browser.close();
}
