import assert from "node:assert/strict";
import test from "node:test";
import { INTERSTITIAL_REARM_MS, mountQuizInterstitial } from "./interstitialAds.ts";
import type { GoogleTag, GptEvent, GptSlot, PubAds } from "./gpt.ts";

test("a viewable interstitial is replaced once after the one-minute SPA re-arm window", async (context) => {
  const queued: Array<() => void> = [];
  const definitions: unknown[][] = [];
  const configs: unknown[] = [];
  const displayed: GptSlot[] = [];
  const destroyed: GptSlot[][] = [];
  const eventListeners = new Map<string, Set<(event: Event) => void>>();
  const documentListeners = new Map<string, Set<(event: Event) => void>>();
  const gptListeners = new Map<string, Set<(event: GptEvent) => void>>();
  const timers = new Map<number, () => void>();
  const slots: GptSlot[] = [];
  let nextTimer = 1;
  let now = 0;

  const add = (map: Map<string, Set<(event: Event) => void>>, name: string, listener: (event: Event) => void) => {
    const listeners = map.get(name) ?? new Set();
    listeners.add(listener);
    map.set(name, listeners);
  };
  const remove = (map: Map<string, Set<(event: Event) => void>>, name: string, listener: (event: Event) => void) => {
    map.get(name)?.delete(listener);
  };

  const pubads: PubAds = {
    addEventListener(name, listener) {
      const listeners = gptListeners.get(name) ?? new Set();
      listeners.add(listener);
      gptListeners.set(name, listeners);
    },
    removeEventListener(name, listener) { gptListeners.get(name)?.delete(listener); },
  };
  const tag: GoogleTag = {
    cmd: queued,
    enums: { OutOfPageFormat: { INTERSTITIAL: "INTERSTITIAL" } },
    defineOutOfPageSlot(...args) {
      definitions.push(args);
      const slot: GptSlot = { addService() { return this; }, setConfig(value) { configs.push(value); return this; } };
      slots.push(slot);
      return slot;
    },
    pubads: () => pubads,
    pubadsReady: true,
    display(value) { displayed.push(value as GptSlot); },
    destroySlots(slots) { destroyed.push(slots); },
  };
  const fakeWindow = {
    addEventListener(name: string, listener: (event: Event) => void) { add(eventListeners, name, listener); },
    removeEventListener(name: string, listener: (event: Event) => void) { remove(eventListeners, name, listener); },
    clearTimeout(id: number) { timers.delete(id); },
    getComputedStyle() { return { display: "block", opacity: "1", position: "static", visibility: "visible" }; },
    googletag: tag,
    innerHeight: 800,
    innerWidth: 1200,
    setTimeout(callback: () => void) { const id = nextTimer++; timers.set(id, callback); return id; },
  };
  const fakeDocument = {
    addEventListener(name: string, listener: (event: Event) => void) { add(documentListeners, name, listener); },
    removeEventListener(name: string, listener: (event: Event) => void) { remove(documentListeners, name, listener); },
    querySelectorAll() { return []; },
    visibilityState: "visible",
  };

  const originalNow = Date.now;
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  Object.defineProperty(globalThis, "document", { configurable: true, value: fakeDocument });
  Date.now = () => now;
  context.after(() => { Date.now = originalNow; });

  mountQuizInterstitial("/22677279144/display")();
  const cleanup = mountQuizInterstitial("/22677279144/display");
  await Promise.resolve();
  queued.splice(0).forEach((command) => command());
  assert.deepEqual(definitions, [["/22677279144/display", "INTERSTITIAL"]]);
  assert.deepEqual(configs, [{ interstitial: { triggers: {
    navBar: false, unhideWindow: false, inactivity: false,
    endOfArticle: false, continueReading: false, backward: false,
  } } }]);
  assert.deepEqual(displayed, [slots[0]]);

  for (const listener of gptListeners.get("impressionViewable") ?? []) listener({ slot: slots[0] });
  assert.equal(timers.size, 1);
  now = INTERSTITIAL_REARM_MS;
  for (const callback of [...timers.values()]) callback();
  queued.splice(0).forEach((command) => command());

  assert.deepEqual(definitions, [
    ["/22677279144/display", "INTERSTITIAL"],
    ["/22677279144/display", "INTERSTITIAL"],
  ]);
  assert.deepEqual(displayed, [slots[0], slots[1]]);
  assert.deepEqual(destroyed, [[slots[0]]]);
  assert.equal(gptListeners.get("impressionViewable")?.size, 1);

  cleanup();
  cleanup();
  assert.deepEqual(destroyed, [[slots[0]], [slots[1]]]);
});
