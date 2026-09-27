import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/years-left?fbclid=answer-test&utm_source=meta`);
  await page.locator('.quiz-engine__landing a.quiz-engine__primary').click();
  await page.locator('a.quiz-engine__answer').first().waitFor();
  await page.evaluate(() => {
    // Simulate an interstitial delaying native navigation after React saved the answer.
    document.addEventListener('click', event => {
      const link = event.target.closest?.('a.quiz-engine__answer');
      if (!link || event.defaultPrevented) return;
      event.preventDefault();
      window.delayedAnswerHref = link.href;
    });
  });
  await page.locator('a.quiz-engine__answer').nth(1).click();
  const saved = await page.evaluate(() => JSON.parse(sessionStorage.getItem('rainbowhub:quiz-progress:v4:years-left:en')));
  assert.equal(saved.questionIndex, 1);
  assert.equal(saved.answers['yl-s1q1'], 'a2');
  assert.equal(saved.screen, 'question');
  await page.locator('a.quiz-engine__answer').nth(2).click();
  await page.waitForTimeout(1000);
  assert.deepEqual(await page.evaluate(() => JSON.parse(sessionStorage.getItem('rainbowhub:quiz-progress:v4:years-left:en'))), saved, 'duplicate clicks and background renders cannot overwrite the accepted answer');
  await page.evaluate(() => location.assign(window.delayedAnswerHref));
  await page.locator('[data-question-id="yl-s1q2"]').waitFor();
  assert.equal(new URL(page.url()).searchParams.get('fbclid'), 'answer-test');
  assert.equal(new URL(page.url()).searchParams.get('utm_source'), 'meta');
  assert.equal(new URL(page.url()).searchParams.get('quizStep'), 'question-2');
  await page.reload();
  await page.locator('[data-question-id="yl-s1q2"]').waitFor();
  await page.goBack();
  await page.locator('[data-question-id="yl-s1q2"]').waitFor();
  await page.locator('a.quiz-engine__answer').first().press('Enter');
  await page.locator('[data-question-id="yl-s1q3"]').waitFor();
  assert.deepEqual(errors, []);
  await context.close();
  console.log('PASS: delayed ad, double-click guard, atomic answer save, reload/back recovery, keyboard navigation and attribution preservation');
} finally {
  await browser.close();
}
