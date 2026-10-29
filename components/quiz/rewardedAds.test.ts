import assert from "node:assert/strict";
import test from "node:test";

import { requestRewardedAd, type RewardedResult } from "./rewardedAds.ts";

test("rewarded ads track confirmed starts, preserve reward gates and deduplicate retries", async () => {
  type Listener = (event: { isEmpty?: boolean; makeRewardedVisible?: () => boolean; slot: object }) => void;
  const listeners = new Map<string, Listener>();
  const outcomes: Array<RewardedResult | "granted-without-close" | "ready-only" | "pending" | "deferred" | "failed-show" | "throw-on-show" | "missing-show" | "grant-only"> = [];
  const metaEvents: string[] = [];
  let quizStartSent = false;
  let requests = 0;
  let deferredShows = 0;
  let lastSlot: object;

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
      return lastSlot = { addService() { return this; } };
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
        if (outcome === "missing-show") {
          listeners.get("rewardedSlotReady")?.({slot});
          return;
        }
        if (outcome === "grant-only") {
          listeners.get("rewardedSlotGranted")?.({slot});
          listeners.get("rewardedSlotClosed")?.({slot});
          return;
        }
        if (outcome === "deferred") {
          listeners.get("rewardedSlotReady")?.({slot, makeRewardedVisible() {
            deferredShows++;
            queueMicrotask(() => {
              listeners.get("rewardedSlotGranted")?.({slot});
              listeners.get("rewardedSlotClosed")?.({slot});
            });
            return true;
          }});
          return;
        }

        listeners.get("rewardedSlotReady")?.({ makeRewardedVisible() {
          if (outcome === "throw-on-show") throw Error("Display failed");
          return outcome !== "failed-show";
        }, slot });
        if (outcome === "ready-only" || outcome === "failed-show" || outcome === "throw-on-show") return;
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
    onQuizStart: () => { quizStartSent = true; },
    quizStartAlreadySent: quizStartSent,
  }), "granted");
  assert.equal(requests, 3, "each early close must reopen until the reward is granted");
  assert.deepEqual(metaEvents, ["QuizStart"], "the first display emits once, not once per early-close retry");
  assert.equal(quizStartSent, true, "the quiz session is marked on ad display");

  outcomes.push("unavailable", "unavailable", "unavailable");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3 }), "unavailable");
  assert.equal(requests, 6, "only genuine unavailable responses use the three-attempt fallback");

  outcomes.push("granted");
  assert.equal(await requestRewardedAd({
    adUnitPath: "/test",
    attempts: 3,
    onQuizStart: () => { quizStartSent = true; },
    quizStartAlreadySent: quizStartSent,
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
  assert.equal(metaEvents.length, 2, "a displayed ad counts even without a reward or close event");

  let grantMarked = false;
  let grantSettled = false;
  outcomes.push("granted-without-close");
  const grantWithoutClose = requestRewardedAd({
    adUnitPath: "/test", attempts: 1, timeoutMs: 100, visibleTimeoutMs: 100,
    onQuizStart: () => { grantMarked = true; },
  }).then(result => { grantSettled = true; return result; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(metaEvents.length, 3, "display emits QuizStart before the close event");
  assert.equal(grantMarked, true, "the session is marked as soon as the ad is displayed");
  assert.equal(grantSettled, false, "tracking does not advance the quiz while the ad remains open");
  assert.equal(
    await grantWithoutClose,
    "granted",
    "the watchdog must preserve an earned reward even when GPT loses the close event",
  );
  assert.equal(requests, 9);
  assert.equal(metaEvents.length, 3, "the reward and watchdog do not emit the event again");

  const controller = new AbortController();
  outcomes.push("pending");
  const cancelled = requestRewardedAd({ adUnitPath: "/test", attempts: 3, signal: controller.signal, timeoutMs: 1000 });
  controller.abort();
  assert.equal(await cancelled, "closed", "aborting a gate must stop it without consuming unavailable attempts");
  assert.equal(requests, 10);

  outcomes.push("closed");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3, retryOnClose: false }), "closed");
  assert.equal(requests, 11, "a first-answer gate does not reopen after the user closes it");
  outcomes.push("granted");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3, retryOnClose: false, quizStartAlreadySent: true }), "granted");
  assert.equal(requests, 12, "a fresh user interaction can request another ad");
  assert.equal(metaEvents.length, 4, "early close counts a displayed ad; already-marked sessions do not emit again");

  let activate!: () => void;
  const permission = new Promise<void>(resolve => {activate = resolve;});
  outcomes.push("deferred");
  let preloadedStarted = false;
  const preloaded = requestRewardedAd({adUnitPath: "/test", attempts: 1, beforeVisible: () => permission, onQuizStart: () => {preloadedStarted = true;}});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests, 13, "preloading fetches the slot immediately");
  assert.equal(deferredShows, 0, "a loaded ad waits for the user's CTA and loader delay");
  assert.equal(metaEvents.length, 4, "ad ready/preloaded alone does not count as a start");
  assert.equal(preloadedStarted, false);
  activate();
  assert.equal(await preloaded, "granted");
  assert.equal(deferredShows, 1);
  assert.equal(metaEvents.length, 5);
  assert.equal(preloadedStarted, true);

  const abortPreload = new AbortController();
  let release!: () => void;
  const pendingPermission = new Promise<void>(resolve => {release = resolve;});
  outcomes.push("deferred");
  const abandoned = requestRewardedAd({adUnitPath: "/test", attempts: 1, beforeVisible: () => pendingPermission, signal: abortPreload.signal});
  await new Promise(resolve => setImmediate(resolve));
  abortPreload.abort();
  assert.equal(await abandoned, "closed");
  release();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(deferredShows, 1, "leaving the landing destroys the prepared slot and prevents a late display");
  assert.equal(metaEvents.length, 5, "cancelled preload never counts");

  for (const outcome of ["failed-show", "throw-on-show", "missing-show"] as const) {
    outcomes.push(outcome);
    assert.equal(await requestRewardedAd({adUnitPath: "/test", attempts: 1}), "unavailable");
    assert.equal(metaEvents.length, 5, `${outcome} never counts as a start`);
  }
  outcomes.push("grant-only");
  assert.equal(await requestRewardedAd({adUnitPath: "/test", attempts: 1}), "granted");
  assert.equal(metaEvents.length, 5, "a grant alone never sends the display-based pixel");

  outcomes.push("pending");
  const duplicated = requestRewardedAd({adUnitPath: "/test", attempts: 1});
  let shows = 0;
  const slot = lastSlot!;
  const ready = {slot, makeRewardedVisible() {shows++; return true;}};
  listeners.get("rewardedSlotReady")?.({...ready, slot: {}});
  assert.equal(shows, 0, "unrelated slots are ignored");
  listeners.get("rewardedSlotReady")?.(ready);
  listeners.get("rewardedSlotReady")?.(ready);
  assert.equal(shows, 1, "duplicate ready events do not show the same ad twice");
  assert.equal(metaEvents.length, 6);
  listeners.get("rewardedSlotGranted")?.({slot});
  listeners.get("rewardedSlotGranted")?.({slot});
  assert.equal(metaEvents.length, 6, "grant never repeats QuizStart");
  listeners.get("rewardedSlotClosed")?.({slot});
  assert.equal(await duplicated, "granted");
});
