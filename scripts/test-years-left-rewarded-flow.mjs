import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright-core";

const base = process.env.QUIZ_TEST_URL ?? "http://localhost:3198";
const manifest = JSON.parse(fs.readFileSync("data/quizzes/years-left/quiz.json", "utf8"));
const copy = JSON.parse(fs.readFileSync("data/quizzes/years-left/en.json", "utf8"));
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
try {
  for (const width of (process.env.QUIZ_TEST_WIDTHS ?? "320,390,1440").split(",").map(Number)) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: width === 320 ? "reduce" : "no-preference" });
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
        addEventListener(name, cb) { const callbacks = listeners.get(name) ?? []; callbacks.push(cb); listeners.set(name, callbacks); },
        removeEventListener(name, cb) { listeners.set(name, (listeners.get(name) ?? []).filter(x => x !== cb)); },
        updateCorrelator() {},
      };
      const emit = (name, slot, extra = {}) => (listeners.get(name) ?? []).forEach(cb => cb({ slot, ...extra }));
      window.googletag = {
        cmd: { push(cb) { cb(); } },
        defineSlot() { window.adCalls.push({ format: "DISPLAY" }); throw Error("Unexpected display request"); },
        defineOutOfPageSlot(path, format) {
          const slot = { path, format, addService() { return this; } };
          window.adCalls.push(slot);
          return window.noAdFill ? null : slot;
        },
        pubads: () => pubads, enableServices() {}, setConfig() {}, destroySlots() {},
        enums: { OutOfPageFormat: { REWARDED: "REWARDED", INTERSTITIAL: "INTERSTITIAL" } },
        display(slot) {
          queueMicrotask(() => emit("rewardedSlotReady", slot, {
            makeRewardedVisible() { queueMicrotask(() => { emit("rewardedSlotGranted", slot); emit("rewardedSlotClosed", slot); }); },
          }));
        },
      };
    });
    await page.goto(`${base}/years-left?test_keep=1`);
    await page.locator(".quiz-engine__landing").waitFor();
    await page.screenshot({ path: `/tmp/years-left-polish-landing-${width}.png`, fullPage: true, animations: "disabled" });
    assert.equal(await page.evaluate(() => window.adCalls.length), 0, "no ad before clicking Start");
    assert.match(await page.locator(".quiz-engine__landing").innerText(), /One short ad/i);
    await page.locator(".quiz-engine__landing .quiz-engine__primary").click();
    await page.locator("[data-question-id]").waitFor();
    let expectedRewards = 1;
    const initialDocuments = documents;
    for (const [stageIndex, stage] of manifest.structure.stages.entries()) {
      for (const [index, id] of stage.questionIds.entries()) {
        const question = page.locator(`[data-question-id="${id}"]`);
        await question.waitFor();
        assert.equal(await question.locator(".quiz-engine__answer").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationName === "none")), true, "answers appear immediately without staggered entry animations");
        if (stageIndex === 0 && index === 0) {
          await page.screenshot({ path: `/tmp/years-left-polish-question-${width}.png`, fullPage: true, animations: "disabled" });
          assert.equal(await page.locator(".quiz-engine__overall-progress").count(), 0);
          assert.equal(await question.locator("h1").evaluate(node => getComputedStyle(node).animationName), "years-question-in");
        }
        assert.equal(await page.locator("[data-display-ad], .quiz-question-next").count(), 0, "no display placements or manual Next button");
        assert.equal((await page.locator(".quiz-engine__progress-head > span").innerText()).toUpperCase(), `${index + 1} OF 6`);
        assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards);
        const answerIds = manifest.structure.questions[id].answerIds;
        assert.deepEqual(await question.locator(".quiz-engine__answer").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-answer-id"))), answerIds);
        assert.deepEqual(await question.locator(".quiz-engine__answer strong").allTextContents(), answerIds.map(answerId => copy.stages[stage.id].questions[id].answers[answerId]));
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await question.locator(".quiz-engine__answer").first().click();
        await question.waitFor({ state: "detached" });
      }
      const checkpoint = page.locator(".quiz-engine__checkpoint");
      await checkpoint.waitFor();
      const progressBar = checkpoint.getByRole("progressbar");
      assert.equal(await progressBar.getAttribute("aria-valuenow"), String((stageIndex + 1) * 20));
      assert.equal(await checkpoint.locator(".quiz-engine__checkpoint-journey-progress").evaluate(node => node.style.getPropertyValue("--career-result-progress-from")), `${stageIndex * 20}%`);
      assert.equal(await progressBar.locator("b").evaluate(node => getComputedStyle(node).animationName), "years-checkpoint-fill");
      await page.waitForFunction(() => {
        const bar = document.querySelector('.quiz-engine__checkpoint-journey-progress > i');
        return Math.abs(bar.firstElementChild.getBoundingClientRect().width / bar.clientWidth * 100 - Number(bar.getAttribute('aria-valuenow'))) < 1;
      });
      assert.equal(await checkpoint.getAttribute("data-round"), String(stageIndex + 1));
      assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards, "round ad waits for Continue/Reveal click");
      await checkpoint.locator(".quiz-engine__checkpoint-ad-note").waitFor();
      if (stageIndex === 0) {
        assert.equal(await checkpoint.evaluate(node => getComputedStyle(node).minHeight), "0px");
        await page.screenshot({ path: `/tmp/years-left-polish-checkpoint-${width}.png`, fullPage: true });
      }
      assert.match(await checkpoint.locator(".quiz-engine__checkpoint-ad-note").innerText(), /short ad/i);
      if (stageIndex === 0 && width === 390) {
        await page.screenshot({ path: "/tmp/years-left-rewarded-checkpoint.png", fullPage: true });
        await page.reload();
        await checkpoint.waitFor();
        assert.equal(await checkpoint.getAttribute("data-round"), "1", "checkpoint survives reload");
        assert.equal(await page.evaluate(() => window.adCalls.length), 0, "restoring a checkpoint does not request an ad");
        expectedRewards = 0;
      }
      await checkpoint.locator(".quiz-engine__primary").click();
      expectedRewards++;
    }
    await page.locator(".quiz-engine__results").waitFor();
    await page.screenshot({ path: `/tmp/years-left-polish-result-${width}.png`, fullPage: true, animations: "disabled" });
    assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards);
    assert.equal(expectedRewards + (width === 390 ? 1 : 0), 6, "six normal rewarded requests across the full journey");
    assert.equal(await page.evaluate(() => window.adCalls.every(ad => ad.format === "REWARDED" && ad.path === "/22677279144/rewarded")), true);
    assert.equal(documents, initialDocuments + (width === 390 ? 1 : 0), "SPA; only the deliberate test reload navigates");
    await page.locator(".quiz-engine__about-restart").click();
    await page.locator(".quiz-engine__landing").waitFor();
    assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards, "restart waits for Start");
    if (width === 390) {
      await page.evaluate(() => { window.noAdFill = true; });
      await page.locator(".quiz-engine__landing .quiz-engine__primary").click();
      await page.locator(`[data-question-id="${manifest.structure.stages[0].questionIds[0]}"]`).waitFor();
      assert.equal(await page.evaluate(() => window.adCalls.length), expectedRewards + 3, "no-fill requests have a bounded retry budget and do not deadlock the quiz");
    }
    assert.deepEqual(errors, []);
    console.log(`Years Left ${width}px: 30 questions, 5 rounds, 6 rewards, no display/interstitial requests, stable answer mapping and restart PASS`);
    await context.close();
  }
} finally { await browser.close(); }
