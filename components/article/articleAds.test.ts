import assert from "node:assert/strict";
import test from "node:test";
import { mountArticleDisplayAd, requestArticleReward } from "./articleAds.ts";

type Slot = { path: string; sizes?: number[][]; addService(): Slot };
type Event = { slot: Slot; isEmpty?: boolean; makeRewardedVisible?: () => void };

function mockAds(width = 360) {
  const listeners = new Map<string, Set<(event: Event) => void>>();
  const slots: Slot[] = [];
  const destroyed: Slot[] = [];
  const displayed: unknown[] = [];
  const pubads = {
    addEventListener(name: string, listener: (event: Event) => void) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name)!.add(listener);
    },
    removeEventListener(name: string, listener: (event: Event) => void) { listeners.get(name)?.delete(listener); },
  };
  const create = (path: string, sizes?: number[][]) => {
    const slot: Slot = { path, sizes, addService() { return this; } };
    slots.push(slot);
    return slot;
  };
  const tag = {
    cmd: { push(command: () => void) { command(); } },
    defineOutOfPageSlot: (path: string) => create(path),
    defineSlot: (path: string, sizes: number[][]) => create(path, sizes),
    destroySlots: (removed: Slot[]) => destroyed.push(...removed),
    display: (value: unknown) => displayed.push(value),
    enableServices() {},
    enums: { OutOfPageFormat: { REWARDED: "rewarded" } },
    pubads: () => pubads,
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    googletag: tag, setTimeout, clearTimeout,
    fbq() { throw new Error("Article ads must not send Meta quiz or purchase events"); },
  } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    getElementById: () => ({ clientWidth: width }),
  } });
  return { tag, slots, destroyed, displayed, listeners,
    emit(name: string, slot = slots[0], extra: Omit<Partial<Event>, "slot"> = {}) {
      for (const listener of listeners.get(name) ?? []) listener({ slot, ...extra });
    },
  };
}

test("article reward unlocks only on its own grant; keeps Google's ad until closed", async () => {
  const mock = mockAds();
  const promise = requestArticleReward({ adUnitPath: "/rewarded", signal: new AbortController().signal });
  let result: string | undefined;
  void promise.then(value => { result = value; });
  mock.emit("rewardedSlotGranted", { path: "/other", addService() { return this; } });
  await Promise.resolve();
  assert.equal(result, undefined);
  mock.emit("rewardedSlotReady", mock.slots[0], { makeRewardedVisible() {} });
  mock.emit("rewardedSlotGranted");
  assert.equal(await promise, "granted");
  assert.equal(mock.destroyed.length, 0, "grant must not remove the ad or its close control");
  mock.emit("rewardedSlotClosed");
  assert.equal(mock.destroyed.length, 1);
  assert.equal([...mock.listeners.values()].every(set => set.size === 0), true);
});

test("early close does not grant, retry or automatically reopen", async () => {
  const mock = mockAds();
  const promise = requestArticleReward({ adUnitPath: "/rewarded", signal: new AbortController().signal });
  mock.emit("rewardedSlotReady", mock.slots[0], { makeRewardedVisible() {} });
  mock.emit("rewardedSlotClosed");
  assert.equal(await promise, "closed");
  assert.equal(mock.slots.length, 1);
});

test("no fill and unsupported formats return a bounded unavailable result", async () => {
  const mock = mockAds();
  const promise = requestArticleReward({ adUnitPath: "/rewarded", signal: new AbortController().signal });
  mock.emit("slotRenderEnded", mock.slots[0], { isEmpty: true });
  assert.equal(await promise, "unavailable");
  Object.assign(mock.tag, { defineOutOfPageSlot: () => null });
  assert.equal(await requestArticleReward({ adUnitPath: "/rewarded", signal: new AbortController().signal }), "unavailable");
});

test("visible timeout is not mistaken for a reward or no-fill", async () => {
  const mock = mockAds();
  const promise = requestArticleReward({ adUnitPath: "/rewarded", signal: new AbortController().signal, visibleTimeoutMs: 5 });
  mock.emit("rewardedSlotReady", mock.slots[0], { makeRewardedVisible() {} });
  assert.equal(await promise, "closed");
});

test("late GPT callbacks after cancellation or blocked-script timeout cannot open ads", async () => {
  const mock = mockAds();
  const queued: Array<() => void> = [];
  mock.tag.cmd.push = callback => { queued.push(callback); };
  const controller = new AbortController();
  const cancelled = requestArticleReward({ adUnitPath: "/rewarded", signal: controller.signal });
  controller.abort();
  assert.equal(await cancelled, "closed");
  const unavailable = requestArticleReward({ adUnitPath: "/rewarded", signal: new AbortController().signal, timeoutMs: 5 });
  assert.equal(await unavailable, "unavailable");
  queued.forEach(callback => callback());
  assert.equal(mock.slots.length, 0);
});

test("display uses only fitting 300x250 and 336x280 sizes, with cleanup and no refresh", () => {
  for (const width of [300, 360]) {
    const mock = mockAds(width);
    let empty = false;
    const cleanup = mountArticleDisplayAd("top", "/display", () => { empty = true; });
    assert.deepEqual(mock.slots[0].sizes, width < 336 ? [[300, 250]] : [[300, 250], [336, 280]]);
    assert.deepEqual(mock.displayed, ["top"]);
    mock.emit("slotRenderEnded", mock.slots[0], { isEmpty: true });
    assert.equal(empty, true);
    cleanup();
    assert.equal(mock.destroyed.length, 1);
  }
});

test("display does not request an oversized ad or mount after disposal", () => {
  const narrow = mockAds(280);
  let empty = false;
  mountArticleDisplayAd("top", "/display", () => { empty = true; });
  assert.equal(empty, true);
  assert.equal(narrow.slots.length, 0);
  const mock = mockAds();
  const queued: Array<() => void> = [];
  mock.tag.cmd.push = callback => { queued.push(callback); };
  const cleanup = mountArticleDisplayAd("top", "/display", () => {});
  cleanup();
  queued.forEach(callback => callback());
  assert.equal(mock.slots.length, 0);
});
