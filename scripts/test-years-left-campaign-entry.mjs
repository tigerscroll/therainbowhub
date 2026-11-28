import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = new URL(process.env.QUIZ_CAMPAIGN_TEST_URL ?? "http://localhost:3217");
assert(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local build only");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

try {
  for (const [width, path] of [
    [320, "/years-left?utm_source=demo"],
    [390, "/years-left?utm_campaign=demo"],
    [1200, "/years-left?utm_medium=demo"],
    [390, "/years-left?ref=demo"],
    [390, "/fr/years-left?utm_source=demo"],
    [320, "/memory?utm_source=demo"],
    [390, "/memory?utm_campaign=demo"],
    [390, "/fr/memory?utm_source=demo"],
  ]) {
    const campaign = /^\/(?:years-left|memory)\?utm_/.test(path);
    const context = await browser.newContext({ viewport: { width, height: width === 320 ? 568 : 780 }, reducedMotion: "reduce" });
    let releaseHydration;
    const hydration = new Promise(resolve => { releaseHydration = resolve; });
    await context.route("**/*", async (route) => {
      const request = route.request();
      const target = new URL(request.url());
      if (target.origin !== base.origin) return route.abort();
      if (request.resourceType() === "script" && target.pathname.startsWith("/_next/static/")) await hydration;
      await route.continue();
    });
    await context.addInitScript(() => {
      const listeners = new Map();
      const emit = (name, slot, extra = {}) => listeners.get(name)?.({ slot, ...extra });
      const service = { addEventListener: (name, listener) => listeners.set(name, listener) };
      const state = { requests: [], displayed: null };
      window.quizCampaignTest = state;
      window.googletag = {
        cmd: { push: run => run() },
        pubads: () => service,
        enums: { OutOfPageFormat: { REWARDED: "rewarded" } },
        defineOutOfPageSlot(path) {
          state.requests.push(path);
          return { addService() {} };
        },
        display(slot) {
          queueMicrotask(() => emit("rewardedSlotReady", slot, {
            makeRewardedVisible() { state.displayed = slot; return true; },
          }));
        },
      };
      state.grant = () => emit("rewardedSlotGranted", state.displayed);
      state.close = () => {
        emit("rewardedSlotClosed", state.displayed);
        state.displayed = null;
      };
    });

    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const landing = page.locator(".quiz-engine__landing");
    const button = landing.locator(".quiz-engine__primary");
    const question = page.getByText(path.startsWith("/memory?")
      ? "Which planet is commonly known as the Red Planet?"
      : "Your alarm goes off. Which version of you shows up?", { exact: true });
    const requests = () => page.evaluate(() => window.quizCampaignTest.requests.length);
    const waitForAd = () => page.waitForFunction(() => Boolean(window.quizCampaignTest.displayed));
    const verifyNoPopup = async () => {
      assert.equal(await page.locator("html").getAttribute("data-quiz-campaign-boot"), null);
      assert.equal(await page.getByRole("dialog", { name: "Ready to Start?" }).count(), 0);
      assert.equal(await page.locator("[data-quiz-campaign-preview], [data-quiz-campaign-entry]").count(), 0);
    };

    try {
      assert.equal((await page.goto(new URL(path, base).href, { waitUntil: "commit" })).status(), 200);
      await landing.getByRole("heading", { level: 1 }).waitFor();
      await page.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0);
      assert.equal(await page.locator(".site-shell").evaluate(el => getComputedStyle(el).visibility), "visible");
      await verifyNoPopup();
      assert.equal(await button.isDisabled(), true, "the Start label is visible before hydration");
      assert.equal(await requests(), 0, "there must be no ad preload");
    } finally {
      releaseHydration();
    }

    await page.waitForFunction(() => !document.querySelector(".quiz-engine__landing .quiz-engine__primary")?.disabled);
    await verifyNoPopup();
    if (path.startsWith("/fr/")) {
      assert.match(await button.innerText(), /Commencer/);
      assert.equal(await landing.locator(".quiz-engine__quick-start").count(), 0, "French has the same compact landing");
      assert.equal(await requests(), 0);
    } else {
      assert.equal(await button.getAttribute("data-google-interstitial"), "false");
      assert.equal(await landing.getByRole("button", { name: "Start", exact: true }).count(), 1);
      assert.equal(await landing.locator(".quiz-engine__quick-start").count(), 0, "English subtitle is not rendered");
      const { upper, lower, offset } = await landing.evaluate(el => {
        const badge = el.querySelector(".quiz-engine__landing-badge").getBoundingClientRect();
        const title = el.querySelector("h1").getBoundingClientRect();
        const cta = el.querySelector(".quiz-engine__primary").getBoundingClientRect();
        return { upper: title.top - badge.bottom, lower: cta.top - title.bottom, offset: title.x + title.width / 2 - cta.x - cta.width / 2 };
      });
      assert(upper >= 20 && Math.abs(upper - lower) < 1, `the title is centered vertically: ${upper}px above, ${lower}px below`);
      assert(Math.abs(offset) < 1, "the title is centered horizontally over Start");
      assert.equal(await button.evaluate(el => parseFloat(getComputedStyle(el).minHeight)), 88);
      assert(await button.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), "Start is visible without scrolling");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await button.evaluate(el => getComputedStyle(el).animationName), "none", "honor reduced motion");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      assert.equal(await button.evaluate(el => getComputedStyle(el).animationName), "years-start-pulse");
      assert.equal(await button.evaluate(el => getComputedStyle(el).animationIterationCount), "infinite", "the idle pulse keeps going");
      await page.emulateMedia({ reducedMotion: "reduce" });
      if (width === 390 && campaign && process.env.QUIZ_CAMPAIGN_SCREENSHOT) {
        await page.screenshot({ path: process.env.QUIZ_CAMPAIGN_SCREENSHOT, animations: "disabled" });
      }
      if (campaign) {
        await button.click();
        await waitForAd();
        await landing.getByRole("button", { name: "Loading...", exact: true }).waitFor();
        await page.evaluate(() => window.quizCampaignTest.close());
        await landing.getByRole("button", { name: "Start", exact: true }).waitFor();
        assert.equal(await question.isVisible(), false, "closing without a reward does not open Question 1");

        await button.click();
        await waitForAd();
        assert.equal(await requests(), 2, "each click requests one rewarded ad");
        await page.evaluate(() => { window.quizCampaignTest.grant(); window.quizCampaignTest.close(); });
        await question.waitFor();
        assert.equal(await landing.count(), 0);
        assert.equal(await requests(), 2, "Question 1 does not request a second ad");
        await page.reload();
        await question.waitFor();
        await verifyNoPopup();
        assert.equal(await requests(), 0, "saved progress resumes without a new ad");
      }
    }
    assert.deepEqual(errors, []);
    console.log(`${width}px ${path}: passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
