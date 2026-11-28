import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = new URL(process.env.QUIZ_TEST_URL ?? "http://127.0.0.1:3252");
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Run against the local static export");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

try {
  for (const [path, keyboard] of [["/years-left", false], ["/memory", true], ["/pt/memory", false], ["/mobility_scooter", false]]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    let release;
    const scripts = new Promise(resolve => { release = resolve; });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.route("**/*", async route => {
        if (new URL(route.request().url()).origin !== base.origin) return route.abort();
        if (route.request().resourceType() === "script") await scripts;
        return route.continue();
      });
      await page.addInitScript(() => {
        window.rewardedRequests = 0;
        const listeners = new Map();
        const add = (name, fn) => {
          const list = listeners.get(name) ?? [];
          listeners.set(name, [...list, fn]);
        };
        const emit = (name, slot, fields) => {
          for (const fn of listeners.get(name) ?? []) fn({ slot, ...fields });
        };
        window.googletag = {
          cmd: { push(fn) { fn(); } },
          pubads: () => ({
            addEventListener: add,
            removeEventListener(name, fn) { listeners.set(name, (listeners.get(name) ?? []).filter(item => item !== fn)); },
          }),
          enableServices() {},
          setConfig() {},
          destroySlots() {},
          enums: { OutOfPageFormat: { REWARDED: "REWARDED" } },
          defineOutOfPageSlot() { window.rewardedRequests++; return { addService() { return this; } }; },
          display(slot) {
            queueMicrotask(() => emit("rewardedSlotReady", slot, {
              makeRewardedVisible() {
                setTimeout(() => { emit("rewardedSlotGranted", slot); emit("rewardedSlotClosed", slot); }, 25);
                return true;
              },
            }));
          },
        };
      });
      await page.goto(new URL(path, base).href, { waitUntil: "commit" });
      const start = page.locator(".quiz-engine__landing [data-quiz-start]");
      await start.waitFor({ state: "visible" });
      assert.equal(await start.isEnabled(), true, path);
      assert.equal(await start.evaluate(button => getComputedStyle(button).opacity), "1", path);
      assert.equal(await page.evaluate(() => typeof window.quizStartBridge?.take), "function", path);
      if (keyboard) {
        await start.focus();
        await page.keyboard.press("Enter");
      } else {
        await start.click();
        await start.click();
      }
      assert.equal(await page.evaluate(() => window.rewardedRequests), 0, path);
      release();
      await page.locator("[data-question-id]").first().waitFor({ state: "visible" });
      assert.equal(await page.evaluate(() => window.rewardedRequests), 1, path);
      assert.equal(await page.evaluate(() => window.quizStartBridge), undefined, path);
      assert.deepEqual(errors, [], path);
      console.log(`${path}: no grey flash; early ${keyboard ? "keyboard activation" : "taps"} opened Q1 with one mocked reward.`);
    } finally {
      release();
      await page.close();
    }
  }
} finally {
  await browser.close();
}
