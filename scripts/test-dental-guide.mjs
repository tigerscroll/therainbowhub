import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = new URL(process.env.DENTAL_TEST_URL ?? "http://localhost:3217");
assert(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local build only");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

try {
  for (const [width, key] of [[320, "utm_source"], [390, "utm_campaign"], [1200, "utm_medium"], [390, "ref"], [390, ""]]) {
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
      window.dentalTest = state;
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
    const dialog = page.getByRole("dialog", { name: "Need Dental Work?" });
    const cta = dialog.getByRole("button", { name: "See Options" });
    const section = page.getByRole("heading", { name: "2. Call a community clinic or dental school" });
    const prerendered = page.locator("[data-dental-entry-preview]");
    const requests = () => page.evaluate(() => window.dentalTest.requests);
    const waitAd = () => page.waitForFunction(() => Boolean(window.dentalTest.slot));

    try {
      assert.equal((await page.goto(new URL(key ? `/dental?${key}=test` : "/dental", base).href, { waitUntil: "commit" })).status(), 200);
      await prerendered.waitFor({ state: "attached" });
      if (campaign) {
        await cta.waitFor();
        await page.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0);
        assert.equal(await page.locator("html").getAttribute("data-dental-entry-boot"), "");
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
      const note = dialog.getByText("Watch one short ad to open the guide.", { exact: true });
      assert(await note.evaluate(el => window.innerHeight - el.getBoundingClientRect().bottom < 80), "disclosure sits at the bottom");
      if (width === 390) {
        if (process.env.DENTAL_SCREENSHOT) await page.screenshot({ path: process.env.DENTAL_SCREENSHOT });
        await dialog.getByRole("button", { name: "Not now" }).click();
        await page.getByText("Need urgent care?", { exact: true }).waitFor();
        assert.equal(await section.isVisible(), false);
        assert.equal(await requests(), 0);
        await page.getByRole("button", { name: "Open Guide Popup" }).click();
      }

      if (width === 1200) {
        await page.evaluate(() => { window.dentalTest.noFill = true; });
        await cta.click();
        await dialog.getByText("No ad is available right now.").waitFor();
        assert.equal(await section.isVisible(), false);
        await dialog.getByRole("button", { name: "Read without an ad" }).click();
        assert.equal(await requests(), 1);
      } else {
        await cta.click();
        await waitAd();
        await page.evaluate(() => window.dentalTest.close(false));
        await cta.waitFor();
        assert.equal(await section.isVisible(), false, "closing without a reward must not unlock the guide");
        await cta.click();
        await waitAd();
        await page.evaluate(() => window.dentalTest.close(true));
        assert.equal(await requests(), 2);
      }
    }
    await section.waitFor();
    assert.equal(await dialog.count(), 0);
    assert.equal(await page.locator("h1").count(), 1);
    await page.getByRole("link", { name: "Canada: Canadian Dental Care Plan" }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log(`${width}px ${key || "direct"}: passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
