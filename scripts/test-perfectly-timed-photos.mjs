import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = new URL(process.env.PHOTO_TEST_URL ?? "http://localhost:3198");
assert(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local build only");
const url = new URL("/perfectly-timed-photos", base);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  for (const [width, campaign] of [[390, ""], [320, "utm_source"], [390, "utm_campaign"], [1240, "utm_medium"]]) {
    const context = await browser.newContext({ viewport: { width, height: 840 }, reducedMotion: "reduce" });
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
      const state = { requests: [], displayed: null, noFill: false };
      window.sportsTest = state;
      const service = { addEventListener: (name, listener) => listeners.set(name, listener) };
      window.googletag = {
        cmd: { push: (run) => run() },
        pubads: () => service,
        enums: { OutOfPageFormat: { REWARDED: "rewarded" } },
        defineOutOfPageSlot(path) {
          state.requests.push(path);
          return { addService() {} };
        },
        display(slot) {
          queueMicrotask(() => {
            if (state.noFill) emit("slotRenderEnded", slot, { isEmpty: true });
            else emit("rewardedSlotReady", slot, { makeRewardedVisible() { state.displayed = slot; return true; } });
          });
        },
      };
      state.close = (granted) => {
        if (granted) emit("rewardedSlotGranted", state.displayed);
        emit("rewardedSlotClosed", state.displayed);
        state.displayed = null;
      };
    });

    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(campaign ? `${url}?${campaign}=test` : url.href, { waitUntil: "commit" });
    await page.locator("h1").waitFor({ state: "attached" });
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator("h1").textContent(), "The Timing Of This Was Just Perfect");
    const gallery = page.getByRole("region", { name: "Sports photo gallery" });
    const overlay = page.getByRole("dialog", { name: "See Content" });
    const entry = overlay.getByRole("button", { name: "Continue", exact: true });
    const next = gallery.getByRole("button", { name: "Next photo" });
    const requests = () => page.evaluate(() => window.sportsTest.requests.length);
    const close = (granted) => page.evaluate(granted => window.sportsTest.close(granted), granted);
    const waitForAd = () => page.waitForFunction(() => Boolean(window.sportsTest.displayed));

    // Inspect the actual first paint while every Next client script is held.
    const prerendered = page.locator("[data-sports-entry-preview]");
    try {
      await prerendered.waitFor({ state: "attached" });
      if (campaign) {
        await entry.waitFor();
        await page.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0);
        assert.equal(await page.locator("html").getAttribute("data-sports-entry-boot"), "");
        assert.equal(await page.locator(".site-shell").evaluate(node => getComputedStyle(node).visibility), "hidden");
        assert.equal(await prerendered.evaluate(node => getComputedStyle(node).position), "fixed");
        assert.equal(await prerendered.evaluate(node => getComputedStyle(node).backgroundColor), "rgb(0, 0, 0)");
        assert.equal(await gallery.getByRole("img").count(), 0);
        assert.equal(await requests(), 0, "first paint does not preload or request a rewarded ad");
      } else {
        assert.equal(await page.locator("html").getAttribute("data-sports-entry-boot"), null);
        assert.equal(await prerendered.isVisible(), false, "direct traffic must not flash the server-rendered popup");
      }
    } finally {
      releaseHydration();
    }
    await prerendered.waitFor({ state: "detached" });
    assert.equal(await page.locator("html").getAttribute("data-sports-entry-boot"), null);

    if (campaign) {
      await entry.waitFor();
      assert.equal(await overlay.evaluate(node => getComputedStyle(node).position), "fixed");
      assert.equal(await overlay.evaluate(node => getComputedStyle(node).backgroundColor), "rgb(0, 0, 0)");
      assert.equal(await overlay.getByText("The Timing Of This Was Just Perfect", { exact: true }).count(), 0);
      assert.equal(await overlay.getByText("Photo gallery", { exact: true }).count(), 0);
      await overlay.getByText("Watch a short ad to continue.", { exact: true }).waitFor();
      await entry.press("Escape");
      await overlay.waitFor({ state: "hidden" });
      await gallery.getByRole("button", { name: "Open player" }).click();
      await overlay.click({ position: { x: 2, y: 2 } });
      if (width === 390 && process.env.PHOTO_DEMO_SCREENSHOT) {
        await page.screenshot({ path: process.env.PHOTO_DEMO_SCREENSHOT, animations: "disabled" });
      }
      assert.equal(await requests(), 0);
      assert.equal(await gallery.getByRole("img").count(), 0);
      await overlay.getByText("See Content", { exact: true }).click();
      await waitForAd();
      await overlay.getByRole("button", { name: "LOADING...", exact: true }).waitFor();
      await close(false);
      await entry.locator("svg").last().click();
      await waitForAd();
      assert.equal(await requests(), 2, "each player tap requests one ad; tapping the backdrop requests none");
      assert.equal(await gallery.getByRole("img").count(), 0, "display alone must not open the gallery");
      await close(true);
    }

    await gallery.getByText("Photo 1 of 50").waitFor();
    assert.equal(await overlay.count(), 0, "the player is closed after grant and never opens for direct traffic");
    if (!campaign) assert.equal(await requests(), 0, "direct traffic has no entry ad");
    const image = gallery.getByRole("img");
    await page.waitForFunction(() => document.querySelector("figure img")?.naturalWidth > 0);
    assert.match(await image.getAttribute("src"), /242495\.jpg$/);
    assert.match(await gallery.getByRole("link", { name: "Original photo" }).getAttribute("href"), /^https:\/\/commons\.wikimedia\.org\//);
    await gallery.getByRole("link", { name: "CC BY-SA 2.0", exact: true }).waitFor();

    const entryCount = await requests();
    for (let index = 2; index <= 5; index++) {
      await next.click();
      await gallery.getByText(`Photo ${index} of 50`).waitFor();
    }
    assert.equal(await requests(), entryCount);
    await page.evaluate(() => { window.sportsTest.noFill = true; });
    await next.click();
    await gallery.getByText("No ad is available right now.").waitFor();
    await gallery.getByText("Photo 5 of 50").waitFor();
    await page.evaluate(() => { window.sportsTest.noFill = false; });
    await next.click();
    await waitForAd();
    await close(true);
    await gallery.getByText("Photo 6 of 50").waitFor();
    await next.press("ArrowLeft");
    await gallery.getByText("Photo 5 of 50").waitFor();
    assert.equal(await requests(), entryCount + 2);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log(`${width}px ${campaign ? "campaign" : "direct"}: title, credits, photo navigation, and reward gates passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
