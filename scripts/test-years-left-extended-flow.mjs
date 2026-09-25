import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3198';
const slug = process.env.QUIZ_TEST_SLUG ?? 'years-left';
const locale = process.env.QUIZ_TEST_LOCALE ?? 'en';
const fast = process.env.QUIZ_TEST_FAST === '1';
const artifactPrefix = locale === 'en' ? slug : `${slug}-${locale}`;
const root = `data/quizzes/${slug}`;
const manifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
const copy = JSON.parse(fs.readFileSync(`${root}/${locale}.json`, 'utf8'));
const scored = manifest.engine.scoring === 'correct-answer';
const textChapters = Object.values(manifest.structure.questions).every(question => question.presentation === 'text' && !question.image && !question.study);
const testPages = new Map();
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

async function run(width) {
  const reduced = width === 320;
  const height = (slug === 'vision' || textChapters) && width === 320 ? 568 : width < 500 ? 844 : 960;
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  // The full locale matrix can advance through intentional answer delays. The
  // normal mode still tests real timing and animations on representative flows.
  if (fast) await page.clock.install();
  const capture = async options => { if (!fast) await page.screenshot(options); };
  testPages.set(width, page);
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(30_000);
  const errors = [];
  let documents = 0;
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++; });
  await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await page.addInitScript(() => {
    window.adCalls = [];
    const listeners = new Map();
    const pubads = {
      addEventListener(name, cb) { const callbacks = listeners.get(name) ?? []; callbacks.push(cb); listeners.set(name, callbacks); },
      removeEventListener(name, cb) { listeners.set(name, (listeners.get(name) ?? []).filter(value => value !== cb)); },
      updateCorrelator() {},
    };
    const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(cb => cb({ slot, ...extra }));
    window.googletag = {
      cmd: { push(cb) { cb(); } },
      defineSlot() { throw Error('Unexpected display ad'); },
      defineOutOfPageSlot(path, format) {
        const slot = { path, format, addService() { return this; } };
        window.adCalls.push(slot);
        return window.noAdFill ? null : slot;
      },
      pubads: () => pubads, enableServices() {}, setConfig() {}, destroySlots() {},
      enums: { OutOfPageFormat: { REWARDED: 'REWARDED', INTERSTITIAL: 'INTERSTITIAL' } },
      display(slot) {
        queueMicrotask(() => emit('rewardedSlotReady', slot, {
          makeRewardedVisible() { queueMicrotask(() => { emit('rewardedSlotGranted', slot); emit('rewardedSlotClosed', slot); }); },
        }));
      },
    };
  });
  await page.goto(`${base}/${locale === 'en' ? '' : `${locale}/`}${slug}?test_keep=1`);
  assert.equal(await page.locator('html').getAttribute('lang'), locale);
  if (locale === 'ar') assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  const landing = page.locator('.quiz-engine__landing');
  await landing.waitFor();
  assert.equal(await landing.locator('h1').innerText(), copy.title);
  assert.equal(await landing.locator('.quiz-engine__quick-start').textContent(), copy.landing.intro);
  assert.equal((await landing.locator('.quiz-engine__primary').innerText()).replace(/[→←]/g, '').trim(), copy.landing.cta);
  assert.equal(await page.evaluate(() => window.adCalls.length), 0);
  if ((slug === 'vision' || textChapters) && width === 320) {
    assert.equal(await landing.locator('.quiz-engine__primary').evaluate(node => node.getBoundingClientRect().bottom <= innerHeight), true, 'Start remains visible on a small phone');
    await capture({ path: `/tmp/${artifactPrefix}-engagement-landing-small-phone.png`, animations: 'disabled' });
  }
  await capture({ path: `/tmp/${artifactPrefix}-engagement-landing-${width}.png`, animations: 'disabled' });
  await landing.locator('.quiz-engine__primary').click();
  await page.locator('[data-question-id]').waitFor();
  let expectedRewards = 1;
  let rewardsBeforeReload = 0;
  let reloads = 0;
  let totalCorrect = 0;
  const initialDocuments = documents;
  const checkpoints = [];

  for (const [stageIndex, stage] of manifest.structure.stages.entries()) {
    const profileWeights = Object.fromEntries(manifest.structure.results.profiles.map(profile => [profile.id ?? profile.key, 0]));
    let chapterCorrect = 0;
    for (const [index, id] of stage.questionIds.entries()) {
      const question = page.locator(`[data-question-id="${id}"]`);
      await question.waitFor();
      // Drain the app's post-transition scroll frame before clicking an answer
      // below the fold. Forced clicks can otherwise hit a moving coordinate.
      if (fast) await page.clock.runFor(50);
      const logic = manifest.structure.questions[id];
      const answerIds = logic.answerIds;
      if (logic.study) {
        const study = question.locator('.quiz-engine__study');
        await study.waitFor();
        assert.equal(await question.locator('.quiz-engine__answer').count(), 0, 'study and answer phases remain separate');
        assert.deepEqual(await study.locator('.quiz-engine__study-items > strong').allTextContents(), copy.stages[stage.id].questions[id].study.items);
        assert.equal(await study.locator('.quiz-engine__study-items').evaluate(node => getComputedStyle(node).direction), 'ltr', 'study boards retain the left-to-right order used by the answer key');
        if (index === 0 && ([0, 6, 7].includes(stageIndex) || slug === 'vision')) await capture({ path: `/tmp/${artifactPrefix}-engagement-study-${stageIndex + 1}-${width}.png`, animations: 'disabled' });
        await study.getByRole('button', { name: copy.stages[stage.id].questions[id].study.continueLabel, exact: true }).click();
        await question.locator('.quiz-engine__answer').first().waitFor();
        assert.equal(await question.locator('.quiz-engine__study').count(), 0, 'the study cue is removed before answering');
        if ((stageIndex === 2 || (slug === 'vision' && stageIndex === 5)) && index === 0 && width === 390) {
          rewardsBeforeReload += expectedRewards;
          await page.reload();
          reloads++;
          await question.locator('.quiz-engine__answer').first().waitFor();
          assert.equal(await question.locator('.quiz-engine__study').count(), 0, 'reload retains the hidden cue and study completion');
          assert.equal(await page.evaluate(() => window.adCalls.length), 0);
          expectedRewards = 0;
        }
      }
      assert.deepEqual(await question.locator('.quiz-engine__answer strong').allTextContents(), answerIds.map(answerId => copy.stages[stage.id].questions[id].answers[answerId]));
      const header = page.locator('.quiz-engine__progress-head');
      assert.equal(await header.evaluate(node => node.getAnimations({subtree: true}).length), 0, 'the progress heading never fades between questions');
      if (index === 0) await header.evaluate(node => { window.quizTestProgressHeader = node.firstElementChild; });
      else assert.equal(await header.evaluate(node => window.quizTestProgressHeader === node.firstElementChild), true, 'the heading stays mounted as the question changes');
      assert.equal(await question.locator('.quiz-engine__answer').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationName === 'none')), true, 'answers appear immediately');
      assert.equal(await page.locator('.quiz-engine__question-shell [role="progressbar"], .quiz-engine__chapter-progress, .quiz-engine__progress').count(), 0, 'questions do not reveal the journey length');
      assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards, 'questions add no ad requests');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}px ${id} overflow`);
      if (textChapters) {
        assert.equal(await question.locator('img,.quiz-engine__visual,.quiz-engine__question-image').count(), 0, `${slug} stays text-only`);
        assert.equal(await question.locator('.quiz-engine__answer strong').evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1)), true, `${width}px ${id} answer clipping`);
        assert.equal(await question.locator('.quiz-engine__answers').evaluate(node => getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length), 1);
      }
      if (slug === 'vision') {
        assert.equal(await question.locator('.quiz-engine__answer > span').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).display === 'none')), true, 'diagram labels do not compete with extra answer letters');
        if (logic.image) {
          const picture = question.locator('.quiz-engine__question-image img');
          await picture.waitFor();
          await page.waitForFunction(src => {
            const img = document.querySelector('[data-question-id] .quiz-engine__question-image img');
            return img?.complete && img.naturalWidth > 0 && img.getAttribute('src').endsWith(src);
          }, logic.image.localizedSrc?.[locale] ?? logic.image.src);
          assert.equal(await picture.evaluate(node => {
            const bounds = node.getBoundingClientRect();
            return bounds.left >= 0 && bounds.right <= innerWidth && Math.abs(bounds.width / bounds.height - node.naturalWidth / node.naturalHeight) < .02;
          }), true, `${width}px ${id}: the entire puzzle board is visible without distortion`);
        }
        assert.equal(await question.locator('.quiz-engine__answer strong').evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1)), true, `${width}px ${id} answer clipping`);
        if (index === 0 || id === 'vision-s9q3') await capture({ path: `/tmp/${artifactPrefix}-engagement-puzzle-${id}-${width}.png`, animations: 'disabled' });
      }
      if (stageIndex === 0 && index === 0) await capture({ path: `/tmp/${artifactPrefix}-engagement-question-${width}.png`, animations: 'disabled' });
      if (locale === 'ar' && ['oxford-s10q1','cambridge-s9q4'].includes(id)) {
        await capture({path:`/tmp/${artifactPrefix}-${id}-symbols-${width}.png`,animations:'disabled'});
      }
      const correctIndex = answerIds.indexOf(logic.correctAnswerId);
      const choice = scored && (width === 320 || (width === 390 && stageIndex === 0))
        ? correctIndex
        : scored && width === 1440 ? (correctIndex + 1) % 4 : (stageIndex + index) % 4;
      if (scored) {
        if (choice === correctIndex) { chapterCorrect++; totalCorrect++; }
      } else {
        for (const [profile, weight] of Object.entries(logic.choiceMeanings[answerIds[choice]])) profileWeights[profile] += weight;
      }
      await question.locator('.quiz-engine__answer').nth(choice).click();
      if (fast) await page.clock.fastForward(700);
      await question.waitFor({ state: 'detached' });
    }
    const checkpoint = page.locator('.quiz-engine__checkpoint');
    await checkpoint.waitFor();
    assert.equal(await checkpoint.getAttribute('data-round'), String(stageIndex + 1));
    assert.equal(await checkpoint.getByRole('progressbar').count(), 0, 'checkpoints focus on the next topic without progress indicators');
    assert.doesNotMatch(await checkpoint.innerText(), /halfway|\b(?:one|two|\d+) chapters? (?:left|to go)\b/i);
    assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards, 'gate waits for a click');
    assert.doesNotMatch(await checkpoint.innerText(), /\{profile\}/);
    if (stageIndex < 9) {
      const leadingId = scored
        ? [...manifest.structure.results.profiles].sort((a, b) => b.min - a.min).find(profile => chapterCorrect / stage.questionIds.length >= profile.min).key
        : Object.entries(profileWeights).sort((a, b) => b[1] - a[1])[0][0];
      const leadingKey = scored ? leadingId : manifest.structure.results.profiles.find(profile => profile.id === leadingId).key;
      assert.equal(await checkpoint.locator('.quiz-engine__checkpoint-profile').innerText(), copy.results.profiles[leadingKey].title, 'preview is based only on this chapter');
      assert.equal(await checkpoint.locator('.quiz-engine__primary').isEnabled(), true, 'no animation lock on intermediate gates');
    }
    const animationNames = await checkpoint.locator('.quiz-engine__checkpoint-icon').evaluate(node => getComputedStyle(node).animationName);
    assert.equal(animationNames, reduced ? 'none' : 'quiz-chapter-mark');
    assert.equal(await checkpoint.evaluate(node => node.getAnimations({ subtree: true }).every(animation => animation.effect.getTiming().iterations === 1)), true, 'checkpoint animations never loop');
    const button = checkpoint.locator('.quiz-engine__primary');
    await button.waitFor({ state: 'visible' });
    assert.match(await button.innerText(), new RegExp(copy.career.stages[stage.id].preAdButton));
    assert.equal(await button.locator('.quiz-engine__primary-arrow svg').count(), 1, 'Continue and See My Result both have an arrow');
    const geometry = await button.evaluate(node => ({ top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, viewport: innerHeight }));
    assert.ok(geometry.top >= 0 && geometry.bottom <= geometry.viewport, `checkpoint ${stageIndex + 1} CTA visible without scrolling: ${JSON.stringify(geometry)}`);
    if (slug === 'vision' || textChapters) {
      assert.equal(await checkpoint.locator('.quiz-engine__ad-note').evaluate(node => node.getBoundingClientRect().bottom <= innerHeight), true, `chapter ${stageIndex + 1} ad note remains visible with its button`);
    }
    if ((slug === 'vision' || textChapters) && stageIndex === 9) {
      assert.deepEqual(await checkpoint.locator('.quiz-engine__checklist li').allTextContents(), copy.career.stages[stage.id].preAdChecks.map(item => `✓${item}`));
    }
    checkpoints.push({ chapter: stageIndex + 1, button: copy.career.stages[stage.id].preAdButton, animation: animationNames });
    if ([0, 4, 8, 9].includes(stageIndex)) await capture({ path: `/tmp/${artifactPrefix}-engagement-checkpoint-${stageIndex + 1}-${width}.png`, animations: 'disabled' });
    if (stageIndex === 0 && width === 390) {
      rewardsBeforeReload += expectedRewards;
      await page.reload();
      reloads++;
      await checkpoint.waitFor();
      assert.equal(await checkpoint.getAttribute('data-round'), '1');
      assert.equal(await page.evaluate(() => window.adCalls.length), 0, 'restore does not request another ad');
      expectedRewards = 0;
    }
    await button.click();
    expectedRewards++;
    console.log(`${width}px: chapter ${stageIndex + 1} passed`);
  }
  const result = page.locator('.quiz-engine__results');
  await result.waitFor();
  assert.equal(expectedRewards + rewardsBeforeReload, 11, 'ten chapter rewards plus the existing Start reward');
  assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards);
  assert.equal(await page.evaluate(() => window.adCalls.every(ad => ad.format === 'REWARDED' && ad.path === '/22677279144/rewarded')), true);
  assert.equal(documents, initialDocuments + reloads, 'no document reloads between questions or chapters');
  assert.equal(await result.locator('.quiz-engine__result-share').count(), 0);
  let age;
  if (scored) {
    assert.equal(await result.locator('.quiz-engine__result-fraction strong').innerText(), `${totalCorrect} / 70`);
    assert.equal(await result.locator('.quiz-engine__result-percentage strong').innerText(), `${Math.round(totalCorrect / 70 * 100)}%`);
    assert.equal(await result.locator('h2').first().innerText(), totalCorrect >= 56 ? copy.results.score.passed : copy.results.score.finished);
  } else if (slug === 'years-left') {
    age = Number(await result.locator('.quiz-engine__result-age strong').innerText());
    assert.ok(age >= 73 && age <= 95);
  }
  await capture({ path: `/tmp/${artifactPrefix}-engagement-result-${width}.png`, animations: 'disabled' });
  await result.locator('.quiz-engine__answer-review-unlock .quiz-engine__primary').click();
  if (slug === 'personality') {
    await result.locator('.quiz-engine__profile-chemistry').waitFor();
    assert.equal(await result.locator('.quiz-engine__dimension').count(), 4);
    assert.equal(await result.locator('.quiz-engine__profile-traits > span').count(), 3);
  } else {
    await result.locator('.quiz-engine__answer-review').waitFor();
    assert.equal(await result.locator('.quiz-engine__answer-review article').count(), scored ? 70 - totalCorrect : 70);
  }
  expectedRewards++;
  assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards, 'optional breakdown keeps its existing reward');
  if (width === 390) {
    await page.locator('.quiz-engine__about-restart').click();
    await landing.waitFor();
    await page.evaluate(() => { window.noAdFill = true; });
    await landing.locator('.quiz-engine__primary').click();
    await page.locator('[data-question-id]').waitFor();
    assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards + 3, 'bounded unavailable-ad retry still starts the quiz');
    for (const id of manifest.structure.stages[0].questionIds) {
      const question = page.locator(`[data-question-id="${id}"]`);
      await question.waitFor();
      if (fast) await page.clock.runFor(50);
      if (manifest.structure.questions[id].study) await question.getByRole('button', { name: copy.stages[manifest.structure.stages[0].id].questions[id].study.continueLabel, exact: true }).click();
      await question.locator('.quiz-engine__answer').first().click();
      if (fast) await page.clock.fastForward(700);
      await question.waitFor({ state: 'detached' });
    }
    await page.locator('.quiz-engine__checkpoint .quiz-engine__primary').click();
    await page.locator(`[data-question-id="${manifest.structure.stages[1].questionIds[0]}"]`).waitFor();
    assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards + 6, 'unavailable checkpoint ads do not strand the user');
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(`/tmp/${artifactPrefix}-engagement-browser-${width}.json`, JSON.stringify({ width, reducedMotion: reduced, chapters: checkpoints, age, totalCorrect: scored ? totalCorrect : undefined, result: 'PASS' }, null, 2));
  await context.close();
  console.log(`${width}px PASS: 70 questions, 10 chapter gates, truthful previews, mobile CTA visibility, single-play animations and no sharing`);
}

try {
  const results = await Promise.allSettled((process.env.QUIZ_TEST_WIDTHS ?? '320,390,1440').split(',').map(Number).map(width => run(width).catch(async error => {
    console.error(`${slug} ${width}px: ${error.stack ?? error}`);
    const page = testPages.get(width);
    if (page && !page.isClosed()) await page.screenshot({ path: `/tmp/${artifactPrefix}-engagement-failure-${width}.png`, animations: 'disabled', timeout: 5_000 }).catch(() => {});
    throw error;
  })));
  const failures = results.filter(result => result.status === 'rejected');
  if (failures.length) throw new AggregateError(failures.map(result => result.reason), 'Chapter browser checks failed');
} finally {
  console.log(`${slug}: closing test browser`);
  await browser.close();
  console.log(`${slug}: test browser closed`);
}
