import assert from "node:assert/strict";
import test from "node:test";
import { mountDisplayAd } from "./displayAds.ts";
import type { GoogleTag, GptEvent, GptSlot } from "./gpt.ts";

function setup({ ready = false, noFill = false, throwOnDisplay = false, throwOnRefresh = false } = {}) {
  const commands: Array<() => void> = [];
  const listeners = new Set<(event: GptEvent) => void>();
  const requests: unknown[][] = [];
  const displayed: unknown[] = [];
  const refreshed: GptSlot[][] = [];
  const destroyed: GptSlot[][] = [];
  const filled: boolean[] = [];
  let enableCalls = 0;
  const pubads = {
    refresh(slots: GptSlot[]) {
      if (throwOnRefresh) throw new Error("Refresh unavailable");
      refreshed.push(slots);
    },
    addEventListener(name: string, listener: (event: GptEvent) => void) {
      assert.equal(name, "slotRenderEnded");
      listeners.add(listener);
    },
    removeEventListener(name: string, listener: (event: GptEvent) => void) {
      assert.equal(name, "slotRenderEnded");
      listeners.delete(listener);
    },
  };
  const slot: GptSlot = { addService(service) { assert.equal(service, pubads); return this; } };
  const googletag: GoogleTag = {
    cmd: commands,
    defineSlot(...args) { requests.push(args); return noFill ? null : slot; },
    pubads: () => pubads,
    pubadsReady: ready,
    enableServices() { enableCalls++; },
    display(value) {
      if (throwOnDisplay) throw new Error("GPT could not display");
      displayed.push(value);
    },
    destroySlots(values) { destroyed.push(values); },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { googletag } });
  const element = { id: "display-test", isConnected: true } as HTMLElement;
  const mount = (path = "/22677279144/display", sizes: Array<[number, number] | "fluid"> = [[336, 280]]) => mountDisplayAd(element, path, value => filled.push(value), sizes);
  const emit = (event: GptEvent) => listeners.forEach(listener => listener(event));
  const flush = async () => { await Promise.resolve(); commands.splice(0).forEach(command => command()); };
  return { mount, flush, emit, requests, displayed, refreshed, destroyed, filled, slot, listeners, element, commands, get enableCalls() { return enableCalls; } };
}

test("a display placement uses the exact unit with only 336×280 sizing and one display request", async () => {
  const env = setup();
  const cleanup = env.mount();
  assert.equal(env.requests.length, 0, "wait for GPT's command queue");
  await env.flush();
  assert.deepEqual(env.requests, [["/22677279144/display", [[336, 280]], "display-test"]]);
  assert.deepEqual(env.displayed, [env.slot]);
  assert.equal(env.enableCalls, 1);
  env.emit({ slot: env.slot, isEmpty: false });
  assert.deepEqual(env.filled, [true]);
  cleanup.destroy();
  assert.deepEqual(env.destroyed, [[env.slot]]);
  assert.equal(env.listeners.size, 0);
});

test("the lower placement requests the native card as Fluid and refreshes the same slot", async () => {
  const env = setup();
  const ad = env.mount("/22677279144/quiz_native_card", ["fluid"]);
  await env.flush();
  assert.deepEqual(env.requests, [["/22677279144/quiz_native_card", ["fluid"], "display-test"]]);
  env.emit({ slot: env.slot, isEmpty: false });
  ad.refresh();
  assert.deepEqual(env.refreshed, [[env.slot]]);
  ad.destroy();
});

test("display events and cleanup never affect a rewarded or other placement", async () => {
  const env = setup({ ready: true });
  const cleanup = env.mount();
  await env.flush();
  assert.equal(env.enableCalls, 0, "reuse already-enabled services without global reconfiguration");
  const rewardedSlot = { addService() { return this; } };
  env.emit({ slot: rewardedSlot, isEmpty: true });
  env.emit({ slot: rewardedSlot, isEmpty: false });
  assert.deepEqual(env.filled, []);
  const lateListener = [...env.listeners][0];
  cleanup.destroy();
  lateListener({ slot: env.slot, isEmpty: false });
  assert.deepEqual(env.filled, [], "a late callback does not update an unmounted component");
  assert.deepEqual(env.destroyed, [[env.slot]]);
  cleanup.destroy();
  assert.equal(env.destroyed.length, 1, "cleanup is idempotent");
});

test("empty ads collapse; failed slot creation or rendering never blocks the quiz", async () => {
  for (const options of [{}, { noFill: true }, { throwOnDisplay: true }]) {
    const env = setup(options);
    const cleanup = env.mount();
    await env.flush();
    if (!options.noFill && !options.throwOnDisplay) env.emit({ slot: env.slot, isEmpty: true });
    assert.deepEqual(env.filled, [false]);
    cleanup.destroy();
    assert.equal(env.destroyed.length, options.noFill ? 0 : 1);
  }
});

test("Strict Mode cleanup cancels the first effect before it can create an impression", async () => {
  const env = setup();
  env.mount().destroy();
  const cleanup = env.mount();
  await env.flush();
  assert.equal(env.requests.length, 1);
  assert.equal(env.displayed.length, 1);
  cleanup.destroy();
});

test("leaving the question before GPT loads cancels queued display work", async () => {
  const env = setup();
  const cleanup = env.mount();
  await Promise.resolve();
  assert.equal(env.commands.length, 1);
  cleanup.destroy();
  await env.flush();
  assert.deepEqual(env.requests, []);
  assert.deepEqual(env.filled, []);
  assert.deepEqual(env.destroyed, []);
});

test("a detached slot container cannot trigger an ad request", async () => {
  const env = setup();
  const cleanup = env.mount();
  Object.defineProperty(env.element, "isConnected", { value: false });
  await env.flush();
  assert.deepEqual(env.requests, []);
  cleanup.destroy();
});

test("refresh reuses only its display slot and does not duplicate an outstanding request", async () => {
  const env = setup();
  const ad = env.mount();
  ad.refresh();
  await env.flush();
  ad.refresh();
  assert.deepEqual(env.refreshed, [], "initial load already covers a newly mounted slot");
  env.emit({ slot: env.slot, isEmpty: false });
  ad.refresh();
  ad.refresh();
  assert.deepEqual(env.refreshed, [[env.slot]]);
  assert.equal(env.requests.length, 1, "reuse the registered slot");
  assert.equal(env.displayed.length, 1);
  env.emit({ slot: env.slot, isEmpty: false });
  ad.refresh();
  assert.equal(env.refreshed.length, 2, "a later navigation can request another creative");
  ad.destroy();
  ad.refresh();
  assert.equal(env.refreshed.length, 2, "leaving the question cancels further requests");
});

test("a no-fill placement can fill on the next refresh; failed refreshes preserve the current ad", async () => {
  const env = setup();
  const ad = env.mount();
  await env.flush();
  env.emit({ slot: env.slot, isEmpty: true });
  ad.refresh();
  env.emit({ slot: env.slot, isEmpty: false });
  assert.deepEqual(env.filled, [false, true]);
  Object.defineProperty(env.element, "isConnected", { value: false });
  ad.refresh();
  assert.deepEqual(env.refreshed, [[env.slot]], "detached placements never refresh");
  ad.destroy();

  const failed = setup({ throwOnRefresh: true });
  const failedAd = failed.mount();
  await failed.flush();
  failed.emit({ slot: failed.slot, isEmpty: false });
  assert.doesNotThrow(() => failedAd.refresh());
  assert.deepEqual(failed.filled, [true]);
  failedAd.destroy();
});
