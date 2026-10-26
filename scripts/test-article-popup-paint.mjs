import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

// Run after `npm run build` with the static export preview running.
const base = process.env.ARTICLE_TEST_URL ?? 'http://localhost:3198';
const galleries = fs.readdirSync('data/galleries')
  .filter(file => file.endsWith('.json'))
  .map(file => JSON.parse(fs.readFileSync(`data/galleries/${file}`, 'utf8')))
  .filter(gallery => gallery.landing.presentation === 'overlay');
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

try {
  for (const gallery of galleries) {
    const scenarios = gallery.landing.followUpQuestions ? ['fbclid', 'direct', 'unlocked', 'questions-pending', ...(gallery.landing.followUpQuestions.adultOnly ? ['age-restricted', 'age-restricted-direct'] : [])] : ['fbclid', 'direct', 'unlocked'];
    for (const scenario of scenarios) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let releaseScripts;
      const scriptsReady = new Promise(resolve => { releaseScripts = resolve; });
      let heldScripts = 0;
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        // No real ad requests or impressions. Hold React chunks to expose server-first paint.
        if (url.origin !== new URL(base).origin) return route.abort();
        if (route.request().resourceType() === 'script' && url.pathname.startsWith('/_next/')) {
          heldScripts++;
          await scriptsReady;
        }
        await route.continue();
      });
      const contentSelector = gallery.gallery.flow === 'article'
        ? '.gallery-article__introduction'
        : '.gallery-article__story:not(.gallery-article__story--preview)';
      await context.addInitScript(({ slug, unlocked, pending, restricted, followUp, contentSelector }) => {
        if (unlocked || pending) sessionStorage.setItem(`rainbowhub:gallery-unlock:v1:${slug}`, '1');
        if (unlocked && followUp) sessionStorage.setItem(`rainbowhub:article-entry-unlock:v1:${slug}`, '1');
        if (restricted) {
          sessionStorage.setItem(`rainbowhub:gallery-unlock:v1:${slug}`, '1');
          sessionStorage.setItem(`rainbowhub:article-entry-unlock:v1:${slug}`, '1');
          sessionStorage.setItem(`rainbowhub:article-unlock:v1:${slug}`, '1');
          sessionStorage.setItem(`rainbowhub:article-entry-questions:v1:${slug}`, JSON.stringify({questionIds: ['age-range', 'gender', 'adult-confirmation'], answers: {'age-range': 'under-18'}}));
        }
        window.articleEntryFrames = [];
        const visible = selector => [...document.querySelectorAll(selector)].some(node => node.getClientRects().length > 0);
        const record = () => {
          if (document.querySelector('.gallery-article__entry-preview, .gallery-article__overlay-scene') || document.querySelector(contentSelector)) {
            window.articleEntryFrames.push({
              popup: visible('[role="dialog"]'),
              intro: visible(contentSelector),
            });
          }
          requestAnimationFrame(record);
        };
        requestAnimationFrame(record);
      }, { slug: gallery.slug, unlocked: scenario === 'unlocked', pending: scenario === 'questions-pending', restricted: scenario.startsWith('age-restricted'), followUp: !!gallery.landing.followUpQuestions, contentSelector });
      const path = `${gallery.locale === 'en' ? '' : `/${gallery.locale}`}/${gallery.slug}`;
      const query = scenario === 'direct' || scenario === 'age-restricted-direct' ? '?utm_source=facebook' : '?fbclid=paint-test';
      const popupExpected = scenario === 'fbclid' || scenario === 'questions-pending' || scenario.startsWith('age-restricted');
      await page.goto(`${base}${path}${query}`, { waitUntil: 'commit' });
      await page.locator(`.gallery-article__entry-preview[data-gallery-entry="${popupExpected ? 'popup' : 'intro'}"]`).waitFor();
      const visibleSelector = popupExpected ? '[role="dialog"]' : contentSelector;
      await page.locator(visibleSelector).waitFor();
      assert.equal(await page.getByRole('dialog').isVisible(), popupExpected, `${path} ${scenario} before hydration`);
      assert.equal(await page.locator(contentSelector).isVisible(), !popupExpected);
      assert(heldScripts > 0, 'React chunks must actually be delayed');
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      releaseScripts();
      await page.waitForFunction(() => !document.querySelector('.gallery-article__entry-preview'));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await page.getByRole('dialog').isVisible(), popupExpected, `${path} ${scenario} after hydration`);
      const frames = await page.evaluate(() => window.articleEntryFrames);
      assert(frames.length > 0);
      assert(frames.every(frame => popupExpected ? frame.popup && !frame.intro : frame.intro && !frame.popup), `${path} ${scenario}: no wrong-view frames`);
      assert.deepEqual(errors, [], `${path} ${scenario}: no hydration errors`);
      console.log(`${path} ${scenario}: correct pre-hydration paint and every recorded frame; no hydration errors.`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
