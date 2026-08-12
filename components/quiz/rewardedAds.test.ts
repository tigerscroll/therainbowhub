import assert from "node:assert/strict";
import test from "node:test";

import { requestRewardedAd, type RewardedResult } from "./rewardedAds.ts";

test("rewarded ads distinguish reward, early close, and genuine unavailability", async () => {
  type Listener = (event: { isEmpty?: boolean; makeRewardedVisible?: () => void; slot: object }) => void;
  const listeners = new Map<string, Listener>();
  const outcomes: RewardedResult[] = [];
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
        if (outcome === "unavailable") {
          listeners.get("slotRenderEnded")?.({ isEmpty: true, slot });
          return;
        }

        listeners.get("rewardedSlotReady")?.({ makeRewardedVisible() {}, slot });
        if (outcome === "granted") listeners.get("rewardedSlotGranted")?.({ slot });
        listeners.get("rewardedSlotClosed")?.({ slot });
      });
    },
    enableServices() {},
    enums: { OutOfPageFormat: { REWARDED: "rewarded" } },
    pubads() { return pubads; },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { clearTimeout, googletag, setTimeout },
  });

  outcomes.push("closed");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3 }), "closed");
  assert.equal(requests, 1, "an early close must not be counted as three inventory failures");

  outcomes.push("unavailable", "unavailable", "unavailable");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3 }), "unavailable");
  assert.equal(requests, 4, "only genuine unavailable responses use the three-attempt fallback");

  outcomes.push("granted");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3 }), "granted");
  assert.equal(requests, 5);
});
