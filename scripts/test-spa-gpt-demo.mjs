import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    const googleAds = /(^|\.)(doubleclick\.net|googlesyndication\.com|googletagservices\.com|googleadservices\.com|googleapis\.com|gstatic\.com|google\.com)$/.test(url.hostname);
    return url.origin === new URL(base).origin || googleAds ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  const messages = [];
  page.on('console', message => { if (message.text().includes('GPT')) messages.push(message.text()); });
  await page.addInitScript(() => {
    window.gptDemoEvents = [];
    window.googletag = { cmd: [] };
    window.googletag.cmd.push(() => {
      const define = window.googletag.defineOutOfPageSlot.bind(window.googletag);
      // The demo creates its own slot; suppress production inventory in this test.
      window.googletag.defineOutOfPageSlot = (path, format) => path.endsWith('/display') ? null : define(path, format);
      for (const type of ['slotRequested', 'slotResponseReceived', 'slotRenderEnded', 'slotOnload']) {
        window.googletag.pubads().addEventListener(type, event => window.gptDemoEvents.push({ type, empty: event.isEmpty }));
      }
    });
  });
  let documents = 0;
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++; });
  await page.goto(`${base}/years-left#gamInterstitialDemo`);
  await page.waitForFunction(() => window.googletag?.apiReady && window.googletag.pubads().getSlots().length > 0, null, { timeout: 30_000 });
  await page.waitForFunction(() => window.gptDemoEvents.some(event => event.type === 'slotOnload'), null, { timeout: 20_000 }).catch(async error => {
    console.log(JSON.stringify({ messages, events: await page.evaluate(() => window.gptDemoEvents) }));
    throw error;
  });
  const initialDocuments = documents;
  const slotCount = await page.evaluate(() => window.googletag.pubads().getSlots().length);
  await page.locator('.quiz-engine__landing a.quiz-engine__primary').click();
  await page.waitForFunction(() => [...document.querySelectorAll('iframe')].some(frame => {
    const bounds = frame.getBoundingClientRect();
    return bounds.width > 250 && bounds.height > 250 && getComputedStyle(frame).visibility !== 'hidden';
  }), null, { timeout: 15_000 }).catch(async error => {
    console.log(JSON.stringify({ messages, events: await page.evaluate(() => window.gptDemoEvents), frames: await page.locator('iframe').evaluateAll(frames => frames.map(frame => ({ id: frame.id, width: frame.getBoundingClientRect().width, height: frame.getBoundingClientRect().height }))) }));
    await page.screenshot({ path: '/tmp/quiz-spa-gpt-demo-failure.png' });
    throw error;
  });
  assert.equal(documents, initialDocuments, 'Start remains SPA while Google renders its demo');
  assert.equal(await page.evaluate(() => window.googletag.pubads().getSlots().length), slotCount, 'SPA keeps the original GPT slot');
  assert.deepEqual(errors, []);
  await page.screenshot({ path: '/tmp/quiz-spa-gpt-demo.png' });
  let closed = false;
  for (const frame of page.frames()) {
    const close = frame.locator('#dismiss-button[aria-label="Close ad"]');
    if (await close.count() && await close.isVisible()) {
      await close.click();
      closed = true;
      break;
    }
  }
  assert.ok(closed, 'Google demo supplies its own close control');
  await page.locator('[data-question-id]').waitFor();
  assert.equal(documents, initialDocuments, 'dismissing the ad resumes Start without a hard reload');
  const firstQuestion = await page.locator('[data-question-id]').getAttribute('data-question-id');
  await page.locator('a.quiz-engine__answer').first().click();
  await page.waitForFunction(id => document.querySelector('[data-question-id]')?.getAttribute('data-question-id') !== id, firstQuestion);
  assert.equal(documents, initialDocuments, 'answer links remain SPA with real GPT loaded');
  assert.equal(await page.evaluate(() => window.googletag.pubads().getSlots().length), slotCount);
  assert.deepEqual(errors, []);
  console.log(`PASS: real Google demo rendered, closed and resumed the SPA quiz; answer advanced without a document reload or duplicate GPT slot.`);
} finally {
  await browser.close();
}
