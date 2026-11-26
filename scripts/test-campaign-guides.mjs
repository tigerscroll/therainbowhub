import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = new URL(process.env.CAMPAIGN_GUIDE_TEST_URL ?? "http://localhost:3217");
assert(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local build only");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const guides = [
  {
    path: "/dental",
    popup: "Need Dental Work?",
    teaser: "That dental quote might not be your only option.",
    section: "2. Call a community clinic or dental school",
    source: "Canada: Canadian Dental Care Plan",
    notice: "Need urgent care?",
    screenshot: process.env.DENTAL_SCREENSHOT,
  },
  {
    path: "/mobility",
    popup: "Want A Mobility Scooter?",
    teaser: "Before you pay for a mobility scooter, check who might cover it.",
    section: "2. Ask about an assessment before buying",
    source: "United States: Medicare wheelchair and scooter coverage",
    screenshot: process.env.MOBILITY_SCREENSHOT,
  },
  {
    path: "/retired",
    popup: "Retired? Looking For A Job?",
    teaser: "You don’t have to go back to full-time work to earn again.",
    section: "2. Look for real openings",
    source: "United States: USAGov job search resources",
    screenshot: process.env.RETIRED_SCREENSHOT,
  },
  {
    path: "/retreats",
    popup: "Business Retreats Adults Only",
    teaser: "An adults-only venue can look perfect online and still be wrong for your team.",
    actionColor: "rgb(162, 29, 44)",
    section: "2. Make sure the venue fits the group",
    screenshot: process.env.RETREATS_SCREENSHOT,
  },
  {
    path: "/beaches",
    popup: "Adults Only Beaches",
    teaser: "An adults-only resort doesn’t always mean the beach is adults-only.",
    actionColor: "rgb(162, 29, 44)",
    section: "What Exactly Is An Adults-Only Beach?",
    sectionCount: 48,
    screenshot: process.env.BEACHES_SCREENSHOT,
  },
  {
    path: "/resorts",
    popup: "Adults Only Resorts",
    teaser: "Two adults-only resorts can look identical online.",
    actionColor: "rgb(162, 29, 44)",
    section: "2. Look past the pool photos",
    sectionCount: 4,
    screenshot: process.env.RESORTS_SCREENSHOT,
  },
];
const cases = [[320, "utm_source"], [390, "utm_campaign"], [1200, "utm_medium"], [390, "ref"], [390, ""]];

try {
  for (const [guide, width, key] of guides.flatMap(guide => cases.map(([width, key]) => [guide, width, key]))) {
    const campaign = key.startsWith("utm_");
    const context = await browser.newContext({ viewport: { width, height: 760 } });
    let releaseHydration;
    const hydration = new Promise(resolve => { releaseHydration = resolve; });
    await context.route("**/*", async route => {
      const target = new URL(route.request().url());
      if (target.origin !== base.origin) return route.abort();
      if (target.pathname.startsWith("/_next/static/") && route.request().resourceType() === "script") await hydration;
      return route.continue();
    });
    await context.addInitScript(() => {
      const listeners = new Map();
      const state = { requests: 0, slot: null, noFill: false };
      window.guideTest = state;
      const emit = (event, slot, extra = {}) => listeners.get(event)?.({ slot, ...extra });
      const service = { addEventListener: (name, fn) => listeners.set(name, fn) };
      window.googletag = {
        cmd: { push: fn => fn() },
        pubads: () => service,
        enums: { OutOfPageFormat: { REWARDED: "rewarded" } },
        defineOutOfPageSlot() { state.requests += 1; return { addService() {} }; },
        display(slot) {
          queueMicrotask(() => {
            if (state.noFill) emit("slotRenderEnded", slot, { isEmpty: true });
            else emit("rewardedSlotReady", slot, { makeRewardedVisible() { state.slot = slot; return true; } });
          });
        },
      };
      state.close = (granted) => {
        if (granted) emit("rewardedSlotGranted", state.slot);
        emit("rewardedSlotClosed", state.slot);
        state.slot = null;
      };
    });

    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const dialog = page.getByRole("dialog", { name: guide.popup });
    const cta = dialog.getByRole("button", { name: "CONTINUE", exact: true });
    const seeMore = page.getByRole("button", { name: "See more", exact: true });
    const teaser = page.getByText(guide.teaser);
    const section = page.getByRole("heading", { name: guide.section });
    const prerendered = page.locator("[data-campaign-guide-preview]");
    const requests = () => page.evaluate(() => window.guideTest.requests);
    const waitAd = () => page.waitForFunction(() => Boolean(window.guideTest.slot));

    try {
      const url = new URL(guide.path, base);
      if (key) url.searchParams.set(key, "test");
      assert.equal((await page.goto(url.href, { waitUntil: "commit" })).status(), 200);
      await prerendered.waitFor({ state: "attached" });
      if (campaign) {
        await cta.waitFor();
        await page.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0);
        assert.equal(await page.locator("html").getAttribute("data-campaign-guide-boot"), "");
        assert.equal(await section.isVisible(), false);
      } else {
        assert.equal(await prerendered.isVisible(), false);
        await section.waitFor();
      }
      assert.equal(await requests(), 0);
    } finally {
      releaseHydration();
    }

    await prerendered.waitFor({ state: "detached" });
    if (campaign) {
      await cta.waitFor();
      assert.equal(await page.locator(".hub-header").isVisible(), false);
      assert.equal(await section.isVisible(), false);
      assert.equal(await requests(), 0, "no ad request until opt-in");
      assert.equal((await cta.boundingBox()).height, Math.min(112, Math.max(72, width * .25)));
      const pulse = await cta.locator("span").evaluate(el => [getComputedStyle(el).animationDuration, getComputedStyle(el).animationIterationCount]);
      assert.deepEqual(pulse, ["1s", "infinite"]);
      const note = dialog.getByText("Watch a short ad to continue", { exact: true });
      assert(await note.evaluate(el => window.innerHeight - el.getBoundingClientRect().bottom < 80), "disclosure sits at the bottom");
      assert.equal(await dialog.getByRole("button").count(), 1, "the default popup has no close button or secondary CTA");
      if (width === 390) {
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(await cta.locator("span").evaluate(el => getComputedStyle(el).animationName), "none");
        assert.equal(await cta.locator("span").evaluate(el => getComputedStyle(el).backgroundColor), guide.actionColor ?? "rgb(24, 114, 67)");
        if (guide.screenshot) await page.screenshot({ path: guide.screenshot });
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await dialog.press("Escape");
        if (guide.notice) await page.getByText(guide.notice, { exact: true }).waitFor();
        assert.equal(await section.isVisible(), false);
        assert.equal(await seeMore.count(), 0, "the second gate isn't offered before the intro is unlocked");
        assert.equal(await requests(), 0);
        await page.getByRole("button", { name: "Open Guide Popup" }).click();
      }

      if (width === 1200) {
        await page.evaluate(() => { window.guideTest.noFill = true; });
        await cta.click();
        await dialog.getByText("No ad is available right now.").waitFor();
        assert.equal(await section.isVisible(), false);
        await dialog.getByRole("button", { name: "Read without an ad" }).click();
        assert.equal(await requests(), 1);
      } else {
        await cta.click();
        await waitAd();
        const loading = dialog.getByRole("button", { name: "LOADING...", exact: true });
        assert.equal(await loading.locator("span").evaluate(el => getComputedStyle(el).animationName), "none");
        await page.evaluate(() => window.guideTest.close(false));
        await cta.waitFor();
        assert.equal(await section.isVisible(), false, "closing without a reward must not unlock the guide");
        assert.equal(await seeMore.count(), 0);
        await cta.click();
        await waitAd();
        await page.evaluate(() => window.guideTest.close(true));
        assert.equal(await requests(), 2);
      }

      await teaser.waitFor();
      await seeMore.waitFor();
      await page.getByText("Watch one short ad to read the rest.", { exact: true }).waitFor();
      assert.equal(await dialog.count(), 0);
      assert.equal(await section.isVisible(), false, "the first gate only opens the intro");
      const firstStageRequests = await requests();
      assert.equal(firstStageRequests, width === 1200 ? 1 : 2, "no second ad is requested until See more is clicked");
      await seeMore.click();

      if (width === 1200) {
        await page.getByRole("status").getByText("No ad is available right now.").waitFor();
        assert.equal(await section.isVisible(), false);
        await page.getByRole("button", { name: "Read without an ad" }).click();
        assert.equal(await requests(), firstStageRequests + 1);
      } else {
        await waitAd();
        await page.getByRole("button", { name: "Loading...", exact: true }).waitFor();
        assert.equal(await section.isVisible(), false);
        await page.evaluate(() => window.guideTest.close(false));
        await seeMore.waitFor();
        assert.equal(await section.isVisible(), false, "closing the second ad early must not open the full article");
        await seeMore.click();
        await waitAd();
        await page.evaluate(() => window.guideTest.close(true));
        assert.equal(await requests(), firstStageRequests + 2);
      }
    } else {
      assert.equal(await teaser.count(), 0);
      assert.equal(await requests(), 0);
    }
    await section.waitFor();
    assert.equal(await dialog.count(), 0);
    assert.equal(await seeMore.count(), 0);
    assert.equal(await page.locator("h1").count(), 1);
    if (guide.sectionCount) assert.equal(await page.getByRole("region", { name: "Full guide" }).locator("section").count(), guide.sectionCount);
    if (guide.source) await page.getByRole("link", { name: guide.source }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log(`${guide.path} ${width}px ${key || "direct"}: passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
