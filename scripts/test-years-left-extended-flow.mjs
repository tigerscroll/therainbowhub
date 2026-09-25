import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3198';
const slug = process.env.QUIZ_TEST_SLUG ?? 'years-left';
const root = `data/quizzes/${slug}/english-extended`;
const manifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
const copy = JSON.parse(fs.readFileSync(`${root}/en.json`, 'utf8'));
const scored = manifest.engine.scoring === 'correct-answer';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });

async function run(width) {
  const reduced = width === 320;
  const height = slug === 'vision' && width === 320 ? 568 : width < 500 ? 844 : 960;
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
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
  await page.goto(`${base}/${slug}?test_keep=1`);
  const landing = page.locator('.quiz-engine__landing');
  await landing.waitFor();
  assert.equal(await landing.locator('h1').innerText(), copy.title);
  assert.equal(await landing.locator('.quiz-engine__quick-start').textContent(), copy.landing.intro);
  assert.match(await landing.locator('.quiz-engine__primary').innerText(), /^Start\s*→?$/);
  assert.equal(await page.evaluate(() => window.adCalls.length), 0);
  if (slug === 'vision' && width === 320) {
    assert.equal(await landing.locator('.quiz-engine__primary').evaluate(node => node.getBoundingClientRect().bottom <= innerHeight), true, 'Start remains visible on a small phone');
    await page.screenshot({ path: '/tmp/vision-engagement-landing-small-phone.png', animations: 'disabled' });
  }
  await page.screenshot({ path: `/tmp/${slug}-engagement-landing-${width}.png`, animations: 'disabled' });
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
      const logic = manifest.structure.questions[id];
      const answerIds = logic.answerIds;
      if (logic.study) {
        const study = question.locator('.quiz-engine__study');
        await study.waitFor();
        assert.equal(await question.locator('.quiz-engine__answer').count(), 0, 'study and answer phases remain separate');
        assert.deepEqual(await study.locator('.quiz-engine__study-items > strong').allTextContents(), copy.stages[stage.id].questions[id].study.items);
        if (index === 0 && ([0, 6, 7].includes(stageIndex) || slug === 'vision')) await page.screenshot({ path: `/tmp/${slug}-engagement-study-${stageIndex + 1}-${width}.png`, animations: 'disabled' });
        await study.getByRole('button', { name: 'I’m Ready', exact: true }).click();
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
      assert.equal(await question.locator('.quiz-engine__answer').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationName === 'none')), true, 'answers appear immediately');
      assert.equal(await page.locator('.quiz-engine__question-shell [role="progressbar"], .quiz-engine__chapter-progress, .quiz-engine__progress').count(), 0, 'questions do not reveal the journey length');
      assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards, 'questions add no ad requests');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}px ${id} overflow`);
      if (slug === 'treatments') {
        assert.equal(await question.locator('img,.quiz-engine__visual,.quiz-engine__question-image').count(), 0, 'treatments stays text-only');
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
          }, logic.image.src);
          assert.equal(await picture.evaluate(node => {
            const bounds = node.getBoundingClientRect();
            return bounds.left >= 0 && bounds.right <= innerWidth && Math.abs(bounds.width / bounds.height - node.naturalWidth / node.naturalHeight) < .02;
          }), true, `${width}px ${id}: the entire puzzle board is visible without distortion`);
        }
        assert.equal(await question.locator('.quiz-engine__answer strong').evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1)), true, `${width}px ${id} answer clipping`);
        if (index === 0 || id === 'vision-s9q3') await page.screenshot({ path: `/tmp/vision-engagement-puzzle-${id}-${width}.png`, animations: 'disabled' });
      }
      if (stageIndex === 0 && index === 0) await page.screenshot({ path: `/tmp/${slug}-engagement-question-${width}.png`, animations: 'disabled' });
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
      const leadingKey = scored
        ? [...manifest.structure.results.profiles].sort((a, b) => b.min - a.min).find(profile => chapterCorrect / stage.questionIds.length >= profile.min).key
        : Object.entries(profileWeights).sort((a, b) => b[1] - a[1])[0][0];
      assert.equal(await checkpoint.locator('.quiz-engine__checkpoint-profile').innerText(), copy.results.profiles[leadingKey].title, 'preview is based only on this chapter');
      assert.equal(await checkpoint.locator('.quiz-engine__primary').isEnabled(), true, 'no animation lock on intermediate gates');
    }
    const animationNames = await checkpoint.locator('.quiz-engine__checkpoint-icon').evaluate(node => getComputedStyle(node).animationName);
    assert.equal(animationNames, reduced ? 'none' : slug === 'years-left' ? 'years-clock-turn' : `${slug}-chapter-mark`);
    assert.equal(await checkpoint.evaluate(node => node.getAnimations({ subtree: true }).every(animation => animation.effect.getTiming().iterations === 1)), true, 'checkpoint animations never loop');
    const button = checkpoint.locator('.quiz-engine__primary');
    await button.waitFor({ state: 'visible' });
    assert.match(await button.innerText(), new RegExp(copy.career.stages[stage.id].preAdButton));
    assert.equal(await button.locator('.quiz-engine__primary-arrow svg').count(), 1, 'Continue and See My Result both have an arrow');
    const geometry = await button.evaluate(node => ({ top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, viewport: innerHeight }));
    assert.ok(geometry.top >= 0 && geometry.bottom <= geometry.viewport, `checkpoint ${stageIndex + 1} CTA visible without scrolling: ${JSON.stringify(geometry)}`);
    if (slug === 'vision' && stageIndex === 9) {
      assert.deepEqual(await checkpoint.locator('.quiz-engine__checklist li').allTextContents(), copy.career.stages[stage.id].preAdChecks.map(item => `✓${item}`));
      assert.equal(await checkpoint.locator('.quiz-engine__ad-note').evaluate(node => node.getBoundingClientRect().bottom <= innerHeight), true, 'final ad note remains visible with the result button');
    }
    checkpoints.push({ chapter: stageIndex + 1, button: copy.career.stages[stage.id].preAdButton, animation: animationNames });
    if ([0, 4, 8, 9].includes(stageIndex)) await page.screenshot({ path: `/tmp/${slug}-engagement-checkpoint-${stageIndex + 1}-${width}.png`, animations: 'disabled' });
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
  } else {
    age = Number(await result.locator('.quiz-engine__result-age strong').innerText());
    assert.ok(age >= 73 && age <= 95);
  }
  await page.screenshot({ path: `/tmp/${slug}-engagement-result-${width}.png`, animations: 'disabled' });
  await result.locator('.quiz-engine__answer-review-unlock .quiz-engine__primary').click();
  await result.locator('.quiz-engine__answer-review').waitFor();
  assert.equal(await result.locator('.quiz-engine__answer-review article').count(), scored ? 70 - totalCorrect : 70);
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
      if (manifest.structure.questions[id].study) await question.getByRole('button', { name: 'I’m Ready', exact: true }).click();
      await question.locator('.quiz-engine__answer').first().click();
      await question.waitFor({ state: 'detached' });
    }
    await page.locator('.quiz-engine__checkpoint .quiz-engine__primary').click();
    await page.locator(`[data-question-id="${manifest.structure.stages[1].questionIds[0]}"]`).waitFor();
    assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards + 6, 'unavailable checkpoint ads do not strand the user');
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(`/tmp/${slug}-engagement-browser-${width}.json`, JSON.stringify({ width, reducedMotion: reduced, chapters: checkpoints, age, totalCorrect: scored ? totalCorrect : undefined, result: 'PASS' }, null, 2));
  await context.close();
  console.log(`${width}px PASS: 70 questions, 10 chapter gates, truthful previews, mobile CTA visibility, single-play animations and no sharing`);
}

try {
  const results = await Promise.allSettled((process.env.QUIZ_TEST_WIDTHS ?? '320,390,1440').split(',').map(Number).map(run));
  const failures = results.filter(result => result.status === 'rejected');
  if (failures.length) throw new AggregateError(failures.map(result => result.reason), 'English extended browser checks failed');
} finally { await browser.close(); }
