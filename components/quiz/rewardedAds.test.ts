import assert from "node:assert/strict";
import test from "node:test";

import { requestRewardedAd, type RewardedResult } from "./rewardedAds.ts";

test("rewarded ads send Google conversions on successful display only, preserving gates and no Meta events", async (t) => {
  type Listener = (event: { isEmpty?: boolean; makeRewardedVisible?: () => boolean; slot: object }) => void;
  const listeners = new Map<string, Listener>();
  const outcomes: Array<RewardedResult | "granted-without-close" | "ready-only" | "pending" | "deferred" | "failed-show" | "throw-on-show" | "missing-show" | "grant-only"> = [];
  const metaEvents: string[] = [];
  const conversions: Array<{command: string; name: string; payload: unknown}> = [];
  const logs: unknown[][] = [];
  const warnings: unknown[][] = [];
  const conversion = {command: "event", name: "conversion", payload: {send_to: "AW-18146485081/nWCKCJu12rIdENnG9cxD"}};
  t.mock.method(console, "log", (...args: unknown[]) => { logs.push(args); });
  t.mock.method(console, "warn", (...args: unknown[]) => { warnings.push(args); });
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
      gtag(command: string, name: string, payload: unknown) { conversions.push({command, name, payload}); },
      setTimeout,
    },
  });

  outcomes.push("closed", "closed", "granted");
  assert.equal(await requestRewardedAd({
    adUnitPath: "/test",
    attempts: 3,
  }), "granted");
  assert.equal(requests, 3, "each early close must reopen until the reward is granted");
  assert.deepEqual(conversions, [conversion, conversion, conversion], "each separately displayed ad counts once, even if it is closed early");
  assert.deepEqual(metaEvents, [], "rewarded ads never emit Meta events");

  outcomes.push("unavailable", "unavailable", "unavailable");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3 }), "unavailable");
  assert.equal(requests, 6, "only genuine unavailable responses use the three-attempt fallback");
  assert.equal(conversions.length, 3, "unavailable ads never count");

  outcomes.push("granted");
  assert.equal(await requestRewardedAd({
    adUnitPath: "/test",
    attempts: 3,
  }), "granted");
  assert.equal(requests, 7);
  assert.equal(conversions.length, 4, "a later separately displayed ad counts again");
  assert.deepEqual(metaEvents, [], "rewarded ads never emit Meta events");

  outcomes.push("ready-only");
  assert.equal(
    await requestRewardedAd({ adUnitPath: "/test", attempts: 1, timeoutMs: 10, visibleTimeoutMs: 10 }),
    "unavailable",
    "a ready ad that never closes must settle through the visible-ad watchdog",
  );
  assert.equal(requests, 8);
  assert.equal(conversions.length, 5, "successful display counts before any reward or close");
  assert.equal(metaEvents.length, 0, "no Meta events on display, grant, close, retry or cancellation");

  let grantSettled = false;
  outcomes.push("granted-without-close");
  const grantWithoutClose = requestRewardedAd({
    adUnitPath: "/test", attempts: 1, timeoutMs: 100, visibleTimeoutMs: 100,
  }).then(result => { grantSettled = true; return result; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(metaEvents.length, 0, "no Meta events on display, grant, close, retry or cancellation");
  assert.equal(grantSettled, false, "the quiz does not advance while the ad remains open");
  assert.equal(conversions.length, 6, "conversion is already sent while the ad is open");
  assert.equal(
    await grantWithoutClose,
    "granted",
    "the watchdog must preserve an earned reward even when GPT loses the close event",
  );
  assert.equal(requests, 9);
  assert.equal(conversions.length, 6, "the reward and watchdog never send another conversion");
  assert.equal(metaEvents.length, 0, "no Meta events on display, grant, close, retry or cancellation");

  const controller = new AbortController();
  outcomes.push("pending");
  const cancelled = requestRewardedAd({ adUnitPath: "/test", attempts: 3, signal: controller.signal, timeoutMs: 1000 });
  controller.abort();
  assert.equal(await cancelled, "closed", "aborting a gate must stop it without consuming unavailable attempts");
  assert.equal(requests, 10);
  assert.equal(conversions.length, 6, "cancelled pending requests never count");

  outcomes.push("closed");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3, retryOnClose: false }), "closed");
  assert.equal(requests, 11, "a first-answer gate does not reopen after the user closes it");
  outcomes.push("granted");
  assert.equal(await requestRewardedAd({ adUnitPath: "/test", attempts: 3, retryOnClose: false }), "granted");
  assert.equal(requests, 12, "a fresh user interaction can request another ad");
  assert.equal(conversions.length, 8);
  assert.equal(metaEvents.length, 0, "no Meta events on display, grant, close, retry or cancellation");

  let activate!: () => void;
  const permission = new Promise<void>(resolve => {activate = resolve;});
  outcomes.push("deferred");
  const preloaded = requestRewardedAd({adUnitPath: "/test", attempts: 1, beforeVisible: () => permission});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests, 13, "preloading fetches the slot immediately");
  assert.equal(deferredShows, 0, "a loaded ad waits for the user's CTA and loader delay");
  assert.equal(conversions.length, 8, "ready and preloaded ads do not count until shown");
  assert.equal(metaEvents.length, 0, "no Meta events on display, grant, close, retry or cancellation");
  activate();
  assert.equal(await preloaded, "granted");
  assert.equal(deferredShows, 1);
  assert.equal(conversions.length, 9, "consented display counts exactly once");
  assert.equal(metaEvents.length, 0);

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
  assert.equal(conversions.length, 9, "abandoned preloads do not count");
  assert.equal(metaEvents.length, 0, "no Meta events on display, grant, close, retry or cancellation");

  for (const outcome of ["failed-show", "throw-on-show", "missing-show"] as const) {
    outcomes.push(outcome);
    assert.equal(await requestRewardedAd({adUnitPath: "/test", attempts: 1}), "unavailable");
    assert.equal(conversions.length, 9, `${outcome} does not send a conversion`);
    assert.equal(metaEvents.length, 0, "no Meta events on display, grant, close, retry or cancellation");
  }
  outcomes.push("grant-only");
  assert.equal(await requestRewardedAd({adUnitPath: "/test", attempts: 1}), "granted");
  assert.equal(conversions.length, 9, "grant alone without display never counts");
  assert.equal(metaEvents.length, 0, "no Meta events on display, grant, close, retry or cancellation");

  outcomes.push("pending");
  const duplicated = requestRewardedAd({adUnitPath: "/test", attempts: 1});
  let shows = 0;
  const slot = lastSlot!;
  const ready = {slot, makeRewardedVisible() {shows++; return true;}};
  listeners.get("rewardedSlotReady")?.({...ready, slot: {}});
  assert.equal(shows, 0, "unrelated slots are ignored");
  assert.equal(conversions.length, 9);
  listeners.get("rewardedSlotReady")?.(ready);
  listeners.get("rewardedSlotReady")?.(ready);
  assert.equal(shows, 1, "duplicate ready events do not show the same ad twice");
  assert.equal(conversions.length, 10, "duplicate ready callbacks never duplicate conversion tracking");
  assert.equal(metaEvents.length, 0, "duplicate ready events never emit Meta events");
  listeners.get("rewardedSlotGranted")?.({slot});
  listeners.get("rewardedSlotGranted")?.({slot});
  assert.equal(metaEvents.length, 0, "no Meta events on display, grant, close, retry or cancellation");
  listeners.get("rewardedSlotClosed")?.({slot});
  assert.equal(await duplicated, "granted");
  assert.equal(conversions.length, 10, "duplicate grants and close do not count again");
  assert(conversions.every(item => JSON.stringify(item) === JSON.stringify(conversion)), "every conversion uses the exact requested destination");
  assert.equal(logs.length, 10, "one console log per queued conversion");
  assert(logs.every(args => String(args[0]).includes("Rewarded ad started") && JSON.stringify(args[1]) === JSON.stringify(conversion.payload)));

  // A fast click before the global tag initializes must remain queued, not lost.
  delete window.gtag;
  window.dataLayer = [];
  outcomes.push("granted");
  assert.equal(await requestRewardedAd({adUnitPath: "/test", attempts: 1}), "granted");
  assert.deepEqual(window.dataLayer.map(args => Array.from(args as IArguments)), [["event", "conversion", conversion.payload]]);
  assert.equal(logs.length, 11);

  window.gtag = () => { throw Error("Tracking blocked"); };
  outcomes.push("granted");
  assert.equal(await requestRewardedAd({adUnitPath: "/test", attempts: 1}), "granted", "tracking errors never block an earned reward");
  assert.equal(logs.length, 11, "a failed queue does not log a successful conversion");
  assert.equal(warnings.length, 1);
  assert.deepEqual(metaEvents, [], "QuizStart remains removed");
});
