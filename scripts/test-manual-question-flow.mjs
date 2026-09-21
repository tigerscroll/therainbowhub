import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = process.env.QUIZ_TEST_URL ?? "http://localhost:3198";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
try {
  const widths = process.env.QUIZ_TEST_WIDTHS?.split(",").map(Number) ?? [320, 390, 1440];
  const slugs = process.env.QUIZ_TEST_SLUGS?.split(",") ?? ["memory", "years-left"];
  const questionLimit = Number(process.env.QUIZ_TEST_QUESTIONS ?? 30);
  assert.ok(Number.isInteger(questionLimit) && questionLimit >= 1 && questionLimit <= 30);
  for (const width of widths) for (const slug of slugs) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    let documentRequests = 0;
    page.on("request", request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentRequests++; });
    page.on("pageerror", e => errors.push(e.message));
    await page.route("**/*", route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    await page.addInitScript(() => {
      const listeners = new Map();
      window.adCalls = [];
      const pubads = {
        addEventListener(name, cb) { const callbacks = listeners.get(name) ?? []; callbacks.push(cb); listeners.set(name, callbacks); },
        removeEventListener(name, cb) { listeners.set(name, (listeners.get(name) ?? []).filter(x => x !== cb)); },
        updateCorrelator() {},
      };
      const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(cb => cb({ slot, ...extra }));
      const makeSlot = (path, format, id, sizes) => ({ path, format, id, sizes, addService() { return this; }, defineSizeMapping() {}, setConfig(config) { this.config = config; } });
      window.googletag = {
        cmd: { push(cb) { cb(); } },
        defineSlot(path, sizes, id) { const s = makeSlot(path, "DISPLAY", id, sizes); window.adCalls.push(s); return s; },
        defineOutOfPageSlot(path, format) { const s = makeSlot(path, format); window.adCalls.push(s); return s; },
        pubads: () => pubads, enableServices() {}, setConfig() {}, destroySlots(slots) { slots.forEach(slot => { slot.destroyed = true; }); },
        enums: { OutOfPageFormat: { REWARDED: "REWARDED", INTERSTITIAL: "INTERSTITIAL" } },
        display(slot) {
          if (typeof slot === "string") {
            const s = window.adCalls.find(x => x.id === slot);
            const box = document.getElementById(slot);
            box.style.width = s.sizes[0][0] + "px"; box.style.height = s.sizes[0][1] + "px";
            box.style.background = "#d9d9d9";
          } else if (slot.format === "REWARDED") queueMicrotask(() => {
            emit("rewardedSlotReady", slot, { makeRewardedVisible() { queueMicrotask(() => { emit("rewardedSlotGranted", slot); emit("rewardedSlotClosed", slot); }); } });
          });
        },
      };
    });
    await page.goto(`${base}/${slug}?test_keep=1`);
    const subtitle = page.locator(".quiz-engine__landing .quiz-engine__quick-start");
    assert.equal(await subtitle.innerText(), slug === "memory" ? "Think your memory is sharp?\nPut it to the test." : "One surprising result.\nWhat age will you get?");
    assert.equal(await subtitle.evaluate(el => Math.abs(el.getBoundingClientRect().height - 2 * parseFloat(getComputedStyle(el).lineHeight)) <= 1), true, "subtitle occupies two short lines");
    const initialDocumentRequests = documentRequests;
    await page.locator(".quiz-engine__landing .quiz-engine__primary").click();
    for (let index = 0; index < questionLimit; index++) {
      const question = page.locator("[data-question-id]");
      await question.waitFor();
      const id = await question.getAttribute("data-question-id");
      assert.equal(await page.locator(".quiz-engine__progress-head > span").innerText(), `${Math.round(index / 30 * 100)}% COMPLETE`);
      assert.equal(await page.locator(".quiz-engine__checkpoint").count(), 0, "no mid-quiz checkpoints");
      const study = page.locator(".quiz-engine__study button");
      if (await study.count()) await study.click();
      const cta = page.locator(".quiz-question-next");
      assert.equal(await cta.innerText(), "Back to top");
      await cta.click();
      assert.equal(await question.getAttribute("data-question-id"), id);
      assert.equal(await page.locator("[data-display-ad]").count(), index === 0 ? 1 : 2);
      const geometry = await page.evaluate(() => {
        const ads = [...document.querySelectorAll("[data-display-ad]")];
        const answers = document.querySelector(".quiz-engine__answers").getBoundingClientRect();
        const cta = document.querySelector(".quiz-question-next").getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > window.innerWidth,
          above: ads[0].getBoundingClientRect().bottom <= answers.top,
          below: !ads[1] || ads[1].getBoundingClientRect().top >= answers.bottom,
          next: cta.top + 1 >= (ads[1]?.getBoundingClientRect().bottom ?? answers.bottom + 32),
          answerButtonGap: cta.top - answers.bottom,
          widths: ads.map(ad => [ad.clientWidth, ad.lastElementChild.clientWidth]),
          heightCaps: ads.map(ad => getComputedStyle(ad.lastElementChild).maxHeight),
          widthCaps: ads.map(ad => getComputedStyle(ad.lastElementChild).maxWidth),
          buttonMinHeight: getComputedStyle(document.querySelector(".quiz-question-next")).minHeight,
          answerMinHeight: getComputedStyle(document.querySelector(".quiz-engine__answer")).minHeight,
          buttonWidth: cta.width,
          answerWidth: document.querySelector(".quiz-engine__answer").getBoundingClientRect().width,
        };
      });
      assert.equal(geometry.overflow, false); assert.equal(geometry.above, true); assert.equal(geometry.below, true); assert.equal(geometry.next, true, JSON.stringify(geometry));
      assert.equal(geometry.buttonMinHeight, geometry.answerMinHeight, "CTA matches answer-box base height");
      assert.ok(Math.abs(geometry.buttonWidth - geometry.answerWidth) <= 1, "CTA matches full answer-box width");
      geometry.widths.forEach(([available, actual]) => {
        assert.ok(available >= actual);
        const expected = [336, 300].find(w => w <= available);
        assert.equal(actual, expected);
      });
      geometry.heightCaps.forEach(cap => assert.equal(cap, "none", "no height cap blocking Google expansion"));
      geometry.widthCaps.forEach(cap => assert.equal(cap, "100%", "full placement width available"));
      assert.equal(await page.evaluate(() => window.adCalls.filter(x => x.format === "DISPLAY").every(x =>
        x.config?.adExpansion?.enabled === true && x.sizes.every(([w, h]) =>
          (w === 336 && h === 280) || (w === 300 && h === 250)))), true, "only two base sizes, with expansion enabled");
      await page.locator(".quiz-engine__answer").first().click();
      await page.waitForTimeout(900);
      assert.equal(await question.getAttribute("data-question-id"), id, "no automatic advance");
      assert.equal(await page.evaluate(() => window.adCalls.filter(x => x.format === "INTERSTITIAL").length), 0, "no interstitial requests");
      assert.equal(await page.evaluate(() => window.adCalls.filter(x => x.format === "REWARDED").length), 1, "only the start reward; no mid-quiz reward gates");
      assert.equal(await page.evaluate(() => window.adCalls.filter(x => x.format === "DISPLAY").length), 1 + index * 2, "one ad on question 1, two on subsequent questions; no requests on answer or scroll");
      assert.equal(await page.evaluate(() => window.adCalls.filter(x => x.format === "DISPLAY" && !x.destroyed).length), index === 0 ? 1 : 2, "previous question ad slots are destroyed");
      assert.equal(await page.evaluate(() => window.adCalls.every(x => x.path === "/22677279144/display")), true, "all formats use the shared display unit");
      if (index === 0 && width === 390) await page.screenshot({ path: `/tmp/${slug}-manual-question.png`, fullPage: true });
      if (index < 29) {
        assert.equal(await cta.innerText(), "Next Question");
        await cta.click();
        assert.equal(new URL(page.url()).searchParams.get("test_keep"), "1");
        await page.waitForFunction(previous => document.querySelector("[data-question-id]")?.getAttribute("data-question-id") !== previous && document.querySelector("[data-question-id]"), id);
      } else {
        await cta.click();
        await page.locator(".quiz-engine__checkpoint").waitFor();
        await page.locator(".quiz-engine__checkpoint .quiz-engine__primary").click();
        await page.locator(".quiz-engine__results").waitFor();
      }
    }
    assert.deepEqual(errors, []);
    assert.equal(documentRequests, initialDocumentRequests, "no document requests across all thirty questions and result reveal");
    if (questionLimit === 30) assert.equal(await page.evaluate(() => window.adCalls.filter(x => x.format === "DISPLAY" && !x.destroyed).length), 0, "result page cleans up both display slots");
    console.log(`${slug} ${width}px: ${questionLimit} questions verified; responsive ads, padded first-question button, no interstitials or mid-checkpoints, SPA PASS`);
    if (slug === "years-left" && width === 390) {
      await page.evaluate(() => localStorage.clear());
      await page.goto(`${base}/${slug}`);
      await page.locator(".quiz-engine__landing .quiz-engine__primary").click();
      await page.locator(".quiz-engine__answer").first().click();
      const id = await page.locator("[data-question-id]").getAttribute("data-question-id");
      const documentsBefore = documentRequests;
      await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error("Test: storage unavailable"); }; });
      await page.locator(".quiz-question-next").click();
      await page.waitForFunction(previous => document.querySelector("[data-question-id]")?.getAttribute("data-question-id") !== previous, id);
      assert.equal(documentRequests, documentsBefore, "no document navigation when progress cannot be saved");
      assert.equal(await page.locator(".quiz-question-next").innerText(), "Back to top");
      assert.deepEqual(errors, []);
      console.log("Storage failure: continues in-page without losing answers PASS");
    }
    await context.close();
  }
} finally { await browser.close(); }
