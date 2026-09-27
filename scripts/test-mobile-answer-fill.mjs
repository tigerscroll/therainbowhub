import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  for (const route of ['/years-left', '/memory', '/vision', '/fr/mechanic', '/ar/nursing']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}${route}`);
    await page.locator('.quiz-engine__landing a.quiz-engine__primary').click();
    await page.locator('[data-question-id]').waitFor();
    const studyButton = page.locator('.quiz-engine__study .quiz-engine__primary');
    if (await studyButton.count()) await studyButton.click();
    const answers = page.locator('.quiz-engine__answers');
    await answers.waitFor();
    const measure = () => page.evaluate(() => {
      const question = document.querySelector('.quiz-engine__question');
      const shell = document.querySelector('.quiz-engine__question-shell');
      const answers = question.querySelector('.quiz-engine__answers');
      const buttons = [...answers.querySelectorAll('button')];
      const box = answers.getBoundingClientRect();
      const questionBox = question.getBoundingClientRect();
      const styles = getComputedStyle(question);
      return {
        height: box.height,
        shellHeight: shell.getBoundingClientRect().height,
        bottomGap: questionBox.bottom - parseFloat(styles.paddingBottom) - box.bottom,
        animation: getComputedStyle(question.querySelector('h1')).animationName,
        overflow: document.documentElement.scrollWidth > innerWidth,
        buttonsFit: buttons.every(button => button.scrollHeight <= button.clientHeight + 1 && button.scrollWidth <= button.clientWidth + 1),
      };
    });
    const tall = await measure();
    assert.equal(tall.animation, 'none', `${route}: question has no fade`);
    assert.equal(tall.overflow, false, `${route}: no horizontal overflow`);
    assert.equal(tall.buttonsFit, true, `${route}: answer text fits`);
    assert.ok(Math.abs(tall.bottomGap) < 2, `${route}: answers fill available container space (${tall.bottomGap})`);
    await page.setViewportSize({ width: 390, height: 640 });
    const short = await measure();
    assert.equal(short.buttonsFit, true, `${route}: short-screen text fits`);
    assert.ok(tall.height > short.height + 30, `${route}: answer area grows with screen height`);
    await page.setViewportSize({ width: 320, height: 568 });
    const narrow = await measure();
    assert.equal(narrow.buttonsFit, true, `${route}: narrow-screen text fits`);
    assert.equal(narrow.overflow, false, `${route}: narrow screen has no overflow`);
    if (route === '/years-left') await page.screenshot({ path: '/tmp/quiz-mobile-answer-fill.png' });
    assert.deepEqual(errors, []);
    console.log(`${route}: responsive fill, immediate question, and text fit passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
