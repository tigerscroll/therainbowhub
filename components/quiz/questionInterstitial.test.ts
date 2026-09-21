import assert from "node:assert/strict";
import test from "node:test";
import { mountQuestionInterstitial } from "./rewardedAds.ts";

test("SPA interstitial uses the display unit, delegates triggers to GPT and cleans up once", () => {
  const calls: unknown[] = [];
  const slot = { addService() { return this; }, setConfig(config: unknown) { calls.push(config); } };
  const tag = {
    cmd: { push(fn: () => void) { fn(); } },
    enums: { OutOfPageFormat: { INTERSTITIAL: "INTERSTITIAL" } },
    defineOutOfPageSlot(path: string, format: unknown) { calls.push([path, format]); return slot; },
    pubads() { return {}; }, enableServices() {},
    display(value: unknown) { calls.push(["display", value]); },
    destroySlots(value: unknown) { calls.push(["destroy", value]); },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { googletag: tag } });
  const ad = mountQuestionInterstitial("/22677279144/display");
  assert.deepEqual(calls[0], ["/22677279144/display", "INTERSTITIAL"]);
  assert.deepEqual(calls[1], { interstitial: { requireStorageAccess: true, triggers: {
    navBar: false, unhideWindow: false, inactivity: false, endOfArticle: false, continueReading: false,
  } } });
  ad.destroy(); ad.destroy();
  assert.equal(calls.filter(call => Array.isArray(call) && call[0] === "destroy").length, 1);
});

test("unsupported GPT, null slots, late loading and ad errors cannot block the quiz", () => {
  for (const mode of ["missing", "null", "late", "throws"] as const) {
    const queue: Array<() => void> = [];
    let definitions = 0;
    const tag = {
      cmd: { push(fn: () => void) { if (mode === "late") queue.push(fn); else fn(); } },
      enums: mode === "missing" ? undefined : { OutOfPageFormat: { INTERSTITIAL: "INTERSTITIAL" } },
      pubads() { return {}; },
      defineOutOfPageSlot() { definitions++; if (mode === "throws") throw new Error("ad failure"); return null; },
      display() { assert.fail("no usable slot should be displayed"); },
    };
    Object.defineProperty(globalThis, "window", { configurable: true, value: { googletag: tag } });
    assert.doesNotThrow(() => { const ad = mountQuestionInterstitial("/22677279144/display"); ad.destroy(); queue.forEach(fn => fn()); });
    assert.equal(definitions, mode === "missing" || mode === "late" ? 0 : 1);
  }
});
