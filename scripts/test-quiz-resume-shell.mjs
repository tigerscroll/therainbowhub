import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const browser = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
try {
  for (const width of [390, 768, 1440]) {
    for (const slug of ['years-left', 'memory', 'vision']) {
      const context = await browser.newContext({viewport: {width, height: width < 500 ? 844 : 960}});
      const page = await context.newPage();
      await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
      await page.goto(`${base}/${slug}`);
      await page.locator('.quiz-engine__landing button.quiz-engine__primary').click();
      const question = page.locator('[data-question-id]');
      await question.waitFor();
      const id = await question.getAttribute('data-question-id');
      const study = page.locator('.quiz-engine__study .quiz-engine__primary');
      if (await study.count()) await study.click();
      const previous = await page.locator('.quiz-engine__question-shell').evaluate(element => {
        const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
        return {x: rect.x, y: rect.y + window.scrollY, width: rect.width, background: style.background, border: style.border, themePadding: getComputedStyle(element.closest('.quiz-theme')).paddingTop};
      });
      const blockScripts = route => route.abort();
      await page.route('**/_next/static/**/*.js', blockScripts);
      await page.locator('button.quiz-engine__answer').first().click();
      await page.waitForFunction(previousId => document.querySelector('[data-question-id]')?.getAttribute('data-question-id') !== previousId, id);
      await page.reload({waitUntil: 'domcontentloaded'});
      await page.waitForLoadState('domcontentloaded');
      await page.waitForFunction(() => document.documentElement.classList.contains('quiz-resuming'));
      const boot = await page.locator('.quiz-engine__landing').evaluate(element => {
        const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
        return {
          x: rect.x, y: rect.y + window.scrollY, width: rect.width, background: style.background, border: style.border,
          visibility: style.visibility, pointerEvents: style.pointerEvents,
          contentHidden: [...element.children].every(child => getComputedStyle(child).visibility === 'hidden'),
          themeVisibility: getComputedStyle(element.closest('.quiz-theme')).visibility,
          aboutHidden: getComputedStyle(document.querySelector('.quiz-engine__about')).visibility === 'hidden',
          themePadding: getComputedStyle(element.closest('.quiz-theme')).paddingTop,
        };
      });
      assert.equal(boot.visibility, 'visible');
      assert.equal(boot.themeVisibility, 'visible');
      assert.equal(boot.pointerEvents, 'none');
      assert.equal(boot.contentHidden, true);
      assert.equal(boot.aboutHidden, true);
      for (const key of ['x', 'y', 'width']) assert.ok(Math.abs(boot[key] - previous[key]) < 1, `${slug}/${width}: matching ${key} (${previous[key]} → ${boot[key]}; padding ${previous.themePadding} → ${boot.themePadding})`);
      assert.equal(boot.background, previous.background, `${slug}/${width}: matching card surface`);
      assert.equal(boot.border, previous.border, `${slug}/${width}: matching border`);
      if (slug === 'years-left') await page.screenshot({path: `/tmp/years-left-resume-shell-${width}.png`});
      await page.unroute('**/_next/static/**/*.js', blockScripts);
      await page.reload();
      await page.locator('[data-question-id]').waitFor();
      assert.notEqual(await page.locator('[data-question-id]').getAttribute('data-question-id'), id, 'saved answer advances correctly');
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('quiz-resuming')), false);
      assert.equal(await page.locator('button.quiz-engine__answer').count(), 4);
      console.log(`${slug}/${width}px PASS: matching visible resume shell, hidden stale content and restored next question.`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
