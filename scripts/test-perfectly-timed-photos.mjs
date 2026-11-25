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
  for (const [width, campaign] of [[390, false], [320, true], [1240, true]]) {
    const context = await browser.newContext({ viewport: { width, height: 840 } });
    await context.route("**/*", (route) => (
      new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort()
    ));
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
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(campaign ? `${url}?utm_source=test` : url.href);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator("h1").innerText(), "The Timing Of This Was Just Perfect");
    const gallery = page.getByRole("region", { name: "Sports photo gallery" });
    const entry = gallery.getByRole("button", { name: "Open Photo Gallery" });
    const next = gallery.getByRole("button", { name: "Next photo" });
    const requests = () => page.evaluate(() => window.sportsTest.requests.length);
    const close = (granted) => page.evaluate(granted => window.sportsTest.close(granted), granted);
    const waitForAd = () => page.waitForFunction(() => Boolean(window.sportsTest.displayed));

    if (campaign) {
      await entry.waitFor();
      assert.equal(await requests(), 0);
      assert.equal(await gallery.getByRole("img").count(), 0);
      await entry.click();
      await waitForAd();
      await close(false);
      await entry.click();
      await waitForAd();
      assert.equal(await gallery.getByRole("img").count(), 0, "display alone must not open the gallery");
      await close(true);
    }

    await gallery.getByText("Photo 1 of 50").waitFor();
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
