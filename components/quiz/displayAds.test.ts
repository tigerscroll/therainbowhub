import assert from "node:assert/strict";
import test from "node:test";
import { createDisplayAd, DISPLAY_AD_SIZES } from "./displayAds.ts";
import type { GoogleTag, GptEvent } from "./gpt.ts";

function fixture(width = 390, deferred = false) {
  const calls: unknown[][] = [];
  const commands: Array<() => void> = [];
  const listeners = new Map<string, (event: GptEvent) => void>();
  const slot = {
    addService() { return this; },
    setConfig(config: unknown) { calls.push(["config", config]); },
  };
  const pubads = {
    addEventListener(name: string, cb: (event: GptEvent) => void) { listeners.set(name, cb); },
    removeEventListener(name: string) { listeners.delete(name); },
    refresh(slots: unknown[]) { calls.push(["refresh", slots]); },
  };
  const tag: GoogleTag = {
    cmd: {push(cb) { if (deferred) commands.push(cb); else cb(); }},
    defineSlot(path, sizes, id) { calls.push(["define", path, sizes, id]); return slot; },
    pubads: () => pubads,
    enableServices() {},
    display(id) { calls.push(["display", id]); },
    destroySlots(slots) { calls.push(["destroy", slots]); },
  };
  const element = {id: "display-test", clientWidth: width, isConnected: true} as HTMLElement;
  const empty: boolean[] = [];
  const ad = createDisplayAd(tag, element, "/22677279144/display", "q1", value => empty.push(value));
  const flush = () => { while (commands.length) commands.shift()!(); };
  return {ad, calls, empty, element, listeners, slot, flush};
}

test("display requests only the two approved sizes and enables expansion", () => {
  const f = fixture();
  assert.deepEqual(DISPLAY_AD_SIZES, [[336,280],[300,250]]);
  assert.deepEqual(f.calls[0], ["define", "/22677279144/display", DISPLAY_AD_SIZES, "display-test"]);
  assert.deepEqual(f.calls[1], ["config", {adExpansion:{enabled:true},safeFrame:{allowOverlayExpansion:true,allowPushExpansion:true}}]);
  assert.equal(f.calls.filter(call => call[0] === "display").length, 1);
});

test("small phones never request a fixed creative wider than their placement", () => {
  assert.deepEqual(fixture(304).calls[0][2], [[300,250]]);
  const narrow = fixture(299);
  assert.equal(narrow.calls.length, 0);
  assert.deepEqual(narrow.empty, [true]);
});

test("one refresh per new question, never on answer-selection renders", () => {
  const f = fixture();
  f.ad.update("q1"); f.ad.update("q1");
  assert.equal(f.calls.filter(call => call[0] === "refresh").length, 0);
  f.ad.update("q2"); f.ad.update("q2"); f.ad.update("q3");
  assert.equal(f.calls.filter(call => call[0] === "refresh").length, 2);
  assert.equal(f.calls.filter(call => call[0] === "define").length, 1);
});

test("late GPT uses the latest question and never creates an unmounted placement", () => {
  const f = fixture(390, true);
  f.ad.update("q2"); f.ad.update("q3"); f.flush();
  assert.equal(f.calls.filter(call => call[0] === "display").length, 1);
  assert.equal(f.calls.filter(call => call[0] === "refresh").length, 0);
  const removed = fixture(390, true);
  removed.ad.destroy(); removed.flush();
  assert.equal(removed.calls.length, 0);
});

test("empty placements collapse, filled responses restore them, and teardown isolates slots", () => {
  const f = fixture();
  const listener = f.listeners.get("slotRenderEnded")!;
  listener({slot: f.slot, isEmpty:true});
  listener({slot: f.slot, isEmpty:false});
  listener({slot:{addService(){return this;}},isEmpty:true});
  assert.deepEqual(f.empty, [true,false]);
  f.ad.destroy(); f.ad.update("q2"); listener({slot:f.slot,isEmpty:true});
  assert.equal(f.listeners.size,0);
  assert.deepEqual(f.calls.at(-1), ["destroy", [f.slot]]);
  assert.deepEqual(f.empty, [true,false]);
});
