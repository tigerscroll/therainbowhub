import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright-core";

const base = process.env.QUIZ_TEST_URL ?? "http://localhost:3198";
const manifest = JSON.parse(fs.readFileSync("data/quizzes/mechanic/quiz.json", "utf8"));
const ids = manifest.structure.stages[0].questionIds;
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
try {
  for (const width of (process.env.QUIZ_TEST_WIDTHS ?? "320,390,1440").split(",").map(Number)) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    let documents = 0;
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++; });
    await page.route("**/*", route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    await page.addInitScript(() => {
      window.adCalls = [];
      const listeners = new Map();
      const pubads = {
        addEventListener(name, cb) { const list = listeners.get(name) ?? []; list.push(cb); listeners.set(name, list); },
        removeEventListener(name, cb) { listeners.set(name, (listeners.get(name) ?? []).filter(fn => fn !== cb)); },
        updateCorrelator() {},
      };
      const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(cb => cb({ slot, ...extra }));
      const makeSlot = (path, format, id, sizes) => ({ path, format, id, sizes, addService() { return this; }, setConfig(config) { this.config = config; }, defineSizeMapping() {} });
      window.googletag = {
        cmd: { push(cb) { cb(); } },
        defineSlot() { window.adCalls.push({ format: "DISPLAY" }); throw Error("Display ads must never be requested"); },
        defineOutOfPageSlot(path, format) { const slot = makeSlot(path, format); window.adCalls.push(slot); return window.noAdFill ? null : slot; },
        pubads: () => pubads, enableServices() {}, setConfig() {},
        destroySlots(slots) { slots.forEach(slot => { slot.destroyed = true; }); },
        enums: { OutOfPageFormat: { REWARDED: "REWARDED", INTERSTITIAL: "INTERSTITIAL" } },
        display(target) {
          queueMicrotask(() => emit("rewardedSlotReady", target, {
            makeRewardedVisible() { queueMicrotask(() => { emit("rewardedSlotGranted", target); emit("rewardedSlotClosed", target); }); },
          }));
        },
      };
    });
    await page.goto(`${base}/mechanic?test_keep=1`);
    await page.locator(".quiz-engine__landing").waitFor();
    assert.equal(await page.evaluate(() => window.adCalls.length), 0);
    await page.locator(".quiz-engine__landing .quiz-engine__primary").click();
    const initialDocuments = documents;
    for (const [index, id] of ids.entries()) {
      const question = page.locator(`[data-question-id="${id}"]`);
      await question.waitFor();
      assert.equal(await question.locator("[data-display-ad], .quiz-question-ad").count(), 0);
      assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "REWARDED").length), 1, "no mid-quiz reward gates");
      assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "DISPLAY" && !slot.destroyed).length), 0, "no display slots created");
      assert.equal(await page.evaluate(() => window.adCalls.every(slot => slot.format === "REWARDED" && slot.path === "/22677279144/rewarded")), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await question.locator(".quiz-question-next, .quiz-engine__next-question").count(), 0);
      const before = await page.evaluate(() => window.adCalls.length);
      if (index === 1) await page.screenshot({ path: `/tmp/mechanic-rewarded-${width}.png`, fullPage: true, animations: "disabled" });
      await question.locator(".quiz-engine__answer").first().click();
      await question.waitFor({ state: "detached" });
      assert.equal(await page.evaluate(() => window.adCalls.length), before, "automatic progression requests no ads");
    }
    const checkpoint = page.locator(".quiz-engine__checkpoint");
    await checkpoint.waitFor();
    assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "REWARDED").length), 1, "final reward waits for user click");
    assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "DISPLAY" && !slot.destroyed).length), 0);
    await checkpoint.locator(".quiz-engine__primary").click();
    await page.locator(".quiz-engine__results").waitFor();
    assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "REWARDED").length), 2);
    assert.equal(await page.evaluate(() => window.adCalls.some(slot => slot.format === "INTERSTITIAL")), false);
    const correct = ids.filter(id => manifest.structure.questions[id].answerIds[0] === manifest.structure.questions[id].correctAnswerId).length;
    assert.equal(await page.locator(".quiz-engine__result-fraction strong").innerText(), `${correct} / 10`);
    assert.equal(documents, initialDocuments, "entire flow stays in the SPA");
    await page.locator(".quiz-engine__about-restart").click();
    await page.locator(".quiz-engine__landing").waitFor();
    assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "REWARDED").length), 2);
    if (width === 390) {
      await page.evaluate(() => { window.noAdFill = true; });
      await page.locator(".quiz-engine__landing .quiz-engine__primary").click();
      const first = page.locator(`[data-question-id="${ids[0]}"]`);
      await first.waitFor();
      assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "REWARDED").length), 5, "three bounded no-fill attempts");
      await first.locator(".quiz-engine__answer").first().click();
      await page.locator(`[data-question-id="${ids[1]}"]`).waitFor();
    }
    assert.deepEqual(errors, []);
    console.log(`Mechanic ${width}px: 10 automatic questions, zero display requests, 2 rewards, correct unit paths and score PASS`);
    await context.close();
  }
} finally { await browser.close(); }
