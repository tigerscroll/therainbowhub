import assert from "node:assert/strict";
import test from "node:test";
import { mountQuizInterstitial } from "./interstitialAds.ts";
import type { GoogleTag, GptSlot } from "./gpt.ts";

test("one managed interstitial keeps only explicit anchor clicks eligible", async () => {
  const queued: Array<() => void> = [];
  const definitions: unknown[][] = [];
  const configs: unknown[] = [];
  const displayed: GptSlot[] = [];
  const destroyed: GptSlot[][] = [];
  const slot: GptSlot = { addService() { return this; }, setConfig(value) { configs.push(value); return this; } };
  const tag: GoogleTag = {
    cmd: queued,
    enums: { OutOfPageFormat: { INTERSTITIAL: "INTERSTITIAL" } },
    defineOutOfPageSlot(...args) { definitions.push(args); return slot; },
    pubads: () => ({ addEventListener() {} }),
    pubadsReady: true,
    display(value) { displayed.push(value as GptSlot); },
    destroySlots(slots) { destroyed.push(slots); },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { googletag: tag } });
  mountQuizInterstitial("/22677279144/display")();
  const cleanup = mountQuizInterstitial("/22677279144/display");
  await Promise.resolve();
  queued.splice(0).forEach((command) => command());
  assert.deepEqual(definitions, [["/22677279144/display", "INTERSTITIAL"]]);
  assert.deepEqual(configs, [{ interstitial: { triggers: {
    navBar: false, unhideWindow: false, inactivity: false,
    endOfArticle: false, continueReading: false, backward: false,
  } } }]);
  assert.deepEqual(displayed, [slot]);
  cleanup();
  cleanup();
  assert.deepEqual(destroyed, [[slot]]);
});
