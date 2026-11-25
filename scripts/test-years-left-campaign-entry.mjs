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
  ]) {
    const campaign = path.startsWith("/years-left?utm_");
    const context = await browser.newContext({ viewport: { width, height: 780 }, reducedMotion: "reduce" });
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
    const popup = page.getByRole("dialog", { name: "Ready to Start?" });
    const button = popup.getByRole("button", { name: "Start Test" });
    const question = page.getByText("Your alarm goes off. Which version of you shows up?", { exact: true });
    const boot = page.locator("html");
    const preview = page.locator("[data-quiz-campaign-preview]");
    const requests = () => page.evaluate(() => window.quizCampaignTest.requests.length);
    const waitForAd = () => page.waitForFunction(() => Boolean(window.quizCampaignTest.displayed));

    try {
      assert.equal((await page.goto(new URL(path, base).href, { waitUntil: "commit" })).status(), 200);
      await page.locator("h1").waitFor({ state: "attached" });
      if (campaign) {
        await preview.waitFor();
        await page.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0);
        assert.equal(await boot.getAttribute("data-quiz-campaign-boot"), "");
        assert.equal(await page.locator(".site-shell").evaluate(el => getComputedStyle(el).visibility), "hidden");
        assert.equal(await preview.evaluate(el => getComputedStyle(el).backgroundColor), "rgb(0, 0, 0)");
        assert.equal(await button.isVisible(), true);
        assert.equal(await requests(), 0, "the ad must not preload");
      } else {
        assert.equal(await boot.getAttribute("data-quiz-campaign-boot"), null);
        assert.equal(await preview.isVisible(), false);
      }
    } finally {
      releaseHydration();
    }

    await preview.waitFor({ state: "detached" });
    assert.equal(await boot.getAttribute("data-quiz-campaign-boot"), null);
    if (campaign) {
      await button.waitFor();
      assert.equal(await page.locator(".hub-header").isVisible(), false, "site chrome must stay hidden after hydration");
      await page.waitForFunction(() => document.activeElement?.hasAttribute("data-quiz-campaign-entry"));
      assert.equal(await button.evaluate(el => getComputedStyle(el).outlineStyle), "none", "no focus ring on load");
      const disclosure = popup.getByText("Watch a short ad to start.", { exact: true });
      assert(await disclosure.evaluate(el => innerHeight - el.getBoundingClientRect().bottom <= 40), "disclosure sits at the viewport bottom");
      const { width: buttonWidth, height: buttonHeight } = await button.boundingBox();
      const expectedWidth = Math.min(width - 32, 520) - 2 * Math.min(36, Math.max(18, width * .05));
      assert(Math.abs(buttonWidth - expectedWidth) <= 1, "retain the popup button width");
      assert.equal(buttonHeight, Math.min(112, Math.max(72, width * .25)), "retain the popup button height");

      const direct = await context.newPage();
      try {
        await direct.goto(new URL("/years-left", base).href);
        const properties = ["backgroundImage", "color", "borderTop", "borderRadius", "boxShadow", "fontFamily", "fontSize", "fontWeight"];
        const readStyle = (locator) => locator.evaluate((el, keys) => keys.map(key => getComputedStyle(el)[key]), properties);
        assert.deepEqual(await readStyle(button), await readStyle(direct.locator(".quiz-engine__landing .quiz-engine__primary")));
        const fontFamily = locator => locator.evaluate(el => getComputedStyle(el).fontFamily);
        assert.equal(await fontFamily(popup.getByRole("heading")), await fontFamily(direct.locator(".quiz-engine__landing h1")));
      } finally {
        await direct.close();
      }
      if (width === 390 && process.env.QUIZ_CAMPAIGN_SCREENSHOT) {
        await page.screenshot({ path: process.env.QUIZ_CAMPAIGN_SCREENSHOT, animations: "disabled" });
      }
      await page.keyboard.press("Tab");
      assert.equal(await button.evaluate(el => el === document.activeElement && el.matches(":focus-visible")), true);
      assert.equal(await requests(), 0);
      await button.click();
      await waitForAd();
      await popup.getByRole("button", { name: "Loading..." }).waitFor();
      await page.evaluate(() => window.quizCampaignTest.close());
      await button.waitFor();
      assert.equal(await question.isVisible(), false, "closing without a reward must not open Question 1");

      await button.click();
      await waitForAd();
      assert.equal(await requests(), 2, "one ad request for each press");
      await page.evaluate(() => { window.quizCampaignTest.grant(); window.quizCampaignTest.close(); });
      await question.waitFor();
      assert.equal(await popup.count(), 0);
      assert.equal(await requests(), 2, "the first question must not request a second ad");
      await page.reload();
      await question.waitFor();
      assert.equal(await popup.count(), 0, "saved progress must resume without the start popup");
      assert.equal(await requests(), 0);
    } else {
      await page.locator("h1").waitFor();
      assert.equal(await popup.count(), 0);
    }
    assert.deepEqual(errors, []);
    console.log(`${width}px ${path}: passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
