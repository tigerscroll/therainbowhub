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
        defineSlot(path, sizes, id) { const slot = makeSlot(path, "DISPLAY", id, sizes); window.adCalls.push(slot); return slot; },
        defineOutOfPageSlot(path, format) { const slot = makeSlot(path, format); window.adCalls.push(slot); return window.noAdFill ? null : slot; },
        pubads: () => pubads, enableServices() {}, setConfig() {},
        destroySlots(slots) { slots.forEach(slot => { slot.destroyed = true; }); },
        enums: { OutOfPageFormat: { REWARDED: "REWARDED", INTERSTITIAL: "INTERSTITIAL" } },
        display(target) {
          if (typeof target === "string") {
            const slot = window.adCalls.find(slot => slot.id === target && !slot.destroyed);
            const box = document.getElementById(target);
            if (!window.noAdFill) {
              const creative = document.createElement("div");
              creative.style.cssText = `width:${slot.sizes[0][0]}px;height:${slot.sizes[0][1]}px;background:#d9d9d9;flex-shrink:0`;
              box.appendChild(creative);
            }
            queueMicrotask(() => emit("slotRenderEnded", slot, { isEmpty: Boolean(window.noAdFill) }));
          } else queueMicrotask(() => emit("rewardedSlotReady", target, {
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
      await page.waitForFunction(count => window.adCalls.filter(slot => slot.format === "DISPLAY").length === count, (index + 1) * 2);
      assert.equal(await question.locator("[data-display-ad]").count(), 2);
      assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "REWARDED").length), 1, "no mid-quiz reward gates");
      assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "DISPLAY" && !slot.destroyed).length), 2, "previous question slots destroyed");
      assert.equal(await page.evaluate(() => window.adCalls.every(slot => slot.path === `/22677279144/${slot.format === "DISPLAY" ? "display" : "rewarded"}`)), true);
      assert.equal(await page.evaluate(() => window.adCalls.filter(slot => slot.format === "DISPLAY").every(slot => slot.config.adExpansion.enabled && slot.sizes.every(([w,h]) => (w === 300 && h === 250) || (w === 336 && h === 280)))), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const next = question.locator(".quiz-question-next");
      assert.equal(await next.innerText(), "Back to top");
      const before = await page.evaluate(() => window.adCalls.length);
      await next.click();
      assert.equal(await question.isVisible(), true, "unanswered question cannot advance");
      assert.equal(await page.evaluate(() => window.adCalls.length), before);
      await question.locator(".quiz-engine__answer").first().click();
      await page.waitForTimeout(650);
      assert.equal(await question.isVisible(), true, "selection does not auto-advance");
      assert.equal(await page.evaluate(() => window.adCalls.length), before, "selection does not refresh ads");
      const buttonBox = await next.boundingBox();
      const bottomAd = await question.locator("[data-display-ad]").last().boundingBox();
      const card = await question.boundingBox();
      assert.ok(buttonBox.y >= bottomAd.y + bottomAd.height, "Next sits below the lower ad");
      assert.ok(Math.abs(buttonBox.x + buttonBox.width / 2 - card.x - card.width / 2) < 2, "Next is centered");
      if (index === 1) await page.screenshot({ path: `/tmp/mechanic-display-${width}.png`, fullPage: true, animations: "disabled" });
      assert.match(await next.innerText(), index === ids.length - 1 ? /results/i : /Next Question/);
      await next.click();
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
      await first.locator(".quiz-question-next").click();
      await page.locator(`[data-question-id="${ids[1]}"]`).waitFor();
    }
    assert.deepEqual(errors, []);
    console.log(`Mechanic ${width}px: 10 manual questions, 20 display requests, 2 rewards, correct unit paths, score and no-fill recovery PASS`);
    await context.close();
  }
} finally { await browser.close(); }
