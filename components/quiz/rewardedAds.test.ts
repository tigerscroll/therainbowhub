import assert from "node:assert/strict";
import test from "node:test";

import { requestRewardedAd, type RewardedResult } from "./rewardedAds.ts";

test("rewarded ads reopen after early closes and only count genuine unavailability", async () => {
  type Listener = (event: { isEmpty?: boolean; makeRewardedVisible?: () => void; slot: object }) => void;
  const listeners = new Map<string, Listener>();
  const outcomes: Array<RewardedResult | "granted-without-close" | "ready-only" | "pending"> = [];
  const metaEvents: string[] = [];
  let rewardClosedSent = false;
  let requests = 0;

  const pubads = {
    addEventListener(name: string, listener: Listener) {
      listeners.set(name, listener);
    },
    updateCorrelator() {},
  };

  const googletag = {
    cmd: {
      push(command: () => void) {
        command();
      },
    },
    defineOutOfPageSlot() {
      requests += 1;
      return { addService() { return this; } };
    },
    destroySlots() {},
    display(slot: object) {
      const outcome = outcomes.shift();
      queueMicrotask(() => {
        if (outcome === "pending") return;
        if (outcome === "unavailable") {
          listeners.get("slotRenderEnded")?.({ isEmpty: true, slot });
          return;
        }

        listeners.get("rewardedSlotReady")?.({ makeRewardedVisible() {}, slot });
        if (outcome === "ready-only") return;
        if (outcome === "granted" || outcome === "granted-without-close") listeners.get("rewardedSlotGranted")?.({ slot });
        if (outcome === "granted-without-close") return;
        listeners.get("rewardedSlotClosed")?.({ slot });
      });
    },
    enableServices() {},
    enums: { OutOfPageFormat: { REWARDED: "rewarded" } },
    pubads() { return pubads; },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      clearTimeout,
      fbq(command: string, name: string) {
        if (command === "trackCustom") metaEvents.push(name);
      },
      googletag,
      setTimeout,
    },
  });

  outcomes.push("closed", "closed", "granted");
  assert.equal(await requestRewardedAd({
    adUnitPath: "/test",
    attempts: 3,
    onRewardClosed: () => { rewardClosedSent = true; },
    rewardClosedAlreadySent: rewardClosedSent,
  }), "granted");
  assert.equal(requests, 3, "each early close must reopen until the reward is granted");
  assert.deepEqual(metaEvents, ["QuizStart"], "only the granted-and-closed attempt emits the Meta event");
  assert.equal(rewardClosedSent, true, "the quiz session is marked after its first completed reward");

  outcomes.push("unavailable", "unavailable", "unavailable");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3 }), "unavailable");
  assert.equal(requests, 6, "only genuine unavailable responses use the three-attempt fallback");

  outcomes.push("granted");
  assert.equal(await requestRewardedAd({
    adUnitPath: "/test",
    attempts: 3,
    onRewardClosed: () => { rewardClosedSent = true; },
    rewardClosedAlreadySent: rewardClosedSent,
  }), "granted");
  assert.equal(requests, 7);
  assert.deepEqual(metaEvents, ["QuizStart"], "later rewards in the same saved quiz session do not emit again");

  outcomes.push("ready-only");
  assert.equal(
    await requestRewardedAd({ adUnitPath: "/test", attempts: 1, timeoutMs: 10, visibleTimeoutMs: 10 }),
    "unavailable",
    "a ready ad that never closes must settle through the visible-ad watchdog",
  );
  assert.equal(requests, 8);

  outcomes.push("granted-without-close");
  assert.equal(
    await requestRewardedAd({ adUnitPath: "/test", attempts: 1, timeoutMs: 10, visibleTimeoutMs: 10 }),
    "granted",
    "the watchdog must preserve an earned reward even when GPT loses the close event",
  );
  assert.equal(requests, 9);
  assert.deepEqual(metaEvents, ["QuizStart"], "a grant without the close event must not emit QuizStart");

  const controller = new AbortController();
  outcomes.push("pending");
  const cancelled = requestRewardedAd({ adUnitPath: "/test", attempts: 3, signal: controller.signal, timeoutMs: 1000 });
  controller.abort();
  assert.equal(await cancelled, "closed", "aborting a gate must stop it without consuming unavailable attempts");
  assert.equal(requests, 10);
});
