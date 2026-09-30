import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3198';
const slugs = ['years-left', 'vision', 'nursing', 'midwifery', 'memory', 'iq', 'marry'];
const browser = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
const context = await browser.newContext({deviceScaleFactor: 2});
await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());

try {
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({width, height: 900});
    for (const locale of ['en', 'ar']) for (const slug of slugs) {
      const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, 'utf8'));
      const copy = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
      const first = manifest.structure.stages[0];
      const label = copy.stages[first.id].questions[first.questionIds[0]].headerLabel;
      await page.goto(`${base}/${locale === 'en' ? '' : `${locale}/`}${slug}`);
      await page.evaluate(() => document.fonts.ready);
      const pill = page.locator('.quiz-engine__progress-head > strong[data-entry]');
      assert.ok((await pill.textContent()).endsWith(label));
      const measured = await pill.evaluate(node => {
        const icon = node.querySelector('.quiz-engine__entry-mark');
        const style = getComputedStyle(node), iconStyle = getComputedStyle(icon);
        const box = node.getBoundingClientRect(), mark = icon.getBoundingClientRect();
        return {
          fontSize: style.fontSize, weight: style.fontWeight, padding: style.padding,
          transform: style.textTransform, gap: style.gap, border: style.borderWidth,
          height: box.height, iconWidth: mark.width, iconHeight: mark.height,
          iconDisplay: iconStyle.display, iconAlign: iconStyle.alignItems, iconJustify: iconStyle.justifyContent,
          offset: mark.top + mark.height / 2 - (box.top + box.height / 2),
          fits: box.left >= 0 && box.right <= innerWidth,
          rtl: getComputedStyle(node).direction === 'rtl',
          iconLeading: getComputedStyle(node).direction === 'rtl' ? mark.right > box.left + box.width / 2 : mark.left < box.left + box.width / 2,
        };
      });
      assert.deepEqual({fontSize: measured.fontSize, weight: measured.weight, padding: measured.padding, gap: measured.gap, border: measured.border},
        {fontSize: '14px', weight: '900', padding: '8px 14px', gap: '8px', border: '2px'});
      assert.equal(measured.height, 42);
      assert.equal(measured.transform, 'none');
      assert.equal(measured.iconWidth, 18);
      assert.equal(measured.iconHeight, 22);
      assert.equal(measured.iconDisplay, 'flex', 'an inline-flex child is blockified inside the pill’s flex layout');
      assert.equal(measured.iconAlign, 'center');
      assert.equal(measured.iconJustify, 'center');
      assert.ok(Math.abs(measured.offset) < 0.5, `${slug}/${locale}: icon is vertically centered`);
      assert.ok(measured.fits && measured.iconLeading);
      assert.equal(measured.rtl, locale === 'ar');
      if (width === 390) await pill.screenshot({path: `/tmp/${slug}-pill-${locale}.png`});
      console.log(`${slug}/${locale} ${width}px: title casing and centered 18×22 icon in 42px pill PASS`);
    }
  }
  assert.deepEqual(errors, []);
} finally {
  await context.close();
  await browser.close();
}
