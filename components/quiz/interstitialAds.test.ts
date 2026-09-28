import assert from "node:assert/strict";
import test from "node:test";
import { mountQuizInterstitial } from "./interstitialAds.ts";
import type { GoogleTag, GptSlot } from "./gpt.ts";

test("one web interstitial uses /display with every automatic trigger disabled", async () => {
  const queued: Array<() => void> = [];
  const definitions: unknown[][] = [];
  const configs: unknown[] = [];
  const displayed: GptSlot[] = [];
  const destroyed: GptSlot[][] = [];
  const slot: GptSlot = { addService() { return this; }, setConfig(value) { configs.push(value); return this; } };
  const tag: GoogleTag = {
    cmd: queued, enums: { OutOfPageFormat: { INTERSTITIAL: "INTERSTITIAL" } },
    defineOutOfPageSlot(...args) { definitions.push(args); return slot; },
    pubads: () => ({ addEventListener() {} }), pubadsReady: true,
    display(value) { displayed.push(value as GptSlot); },
    destroySlots(slots) { destroyed.push(slots); },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { googletag: tag } });
  mountQuizInterstitial("/22677279144/display")(); // Strict Mode's discarded effect.
  const cleanup = mountQuizInterstitial("/22677279144/display");
  await Promise.resolve();
  queued.splice(0).forEach(command => command());
  assert.deepEqual(definitions, [["/22677279144/display", "INTERSTITIAL"]]);
  assert.deepEqual(configs, [{ interstitial: { triggers: {
    navBar: false, unhideWindow: false, inactivity: false,
    endOfArticle: false, continueReading: false, backward: false,
  } } }]);
  assert.deepEqual(displayed, [slot]);
  cleanup(); cleanup();
  assert.deepEqual(destroyed, [[slot]], "other display placements are never destroyed");
});

test("late GPT work is cancelled on navigation and unsupported slots leave the quiz usable", async () => {
  const queued: Array<() => void> = [];
  let calls = 0;
  Object.defineProperty(globalThis, "window", { configurable: true, value: { googletag: {
    cmd: queued, enums: { OutOfPageFormat: { INTERSTITIAL: 0 } },
    defineOutOfPageSlot() { calls++; return null; },
    pubads: () => ({}), display() { throw Error("must not display an unsupported slot"); },
  } } });
  const abandoned = mountQuizInterstitial("/22677279144/display");
  await Promise.resolve(); abandoned();
  queued.splice(0).forEach(command => command());
  assert.equal(calls, 0);
  const cleanup = mountQuizInterstitial("/22677279144/display");
  await Promise.resolve(); queued.splice(0).forEach(command => command());
  assert.equal(calls, 1);
  cleanup();
});
