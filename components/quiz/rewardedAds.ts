"use client";

import type { GptSlot } from "./gpt";

export type RewardedResult = "granted" | "closed" | "unavailable";

type ActiveRequest = {
  beforeVisible?: () => Promise<void>;
  cleanup?: () => void;
  displayed: boolean;
  granted: boolean;
  id: number;
  resolve: (result: RewardedResult) => void;
  slot: GptSlot | null;
  timer: number;
  visibleTimeoutMs: number;
};

let activeRequest: ActiveRequest | null = null;
let listenersInstalled = false;
let requestId = 0;
let servicesEnabled = false;

function trackRewardGranted() {
  const sendTo = "AW-18146485081/0p8ACLL9tv4cENnG9cxD";
  try {
    if (!window.gtag) {
      console.warn("[RewardedAd] Reward granted; Google tag unavailable, conversion not queued.");
      return;
    }
    window.gtag("event", "conversion", { send_to: sendTo });
    console.log("[RewardedAd] Reward granted; Google Ads conversion queued.", { send_to: sendTo });
  } catch (error) {
    console.warn("[RewardedAd] Reward granted; Google Ads conversion tracking failed.", error);
  }
}

function finish(result: RewardedResult) {
  const request = activeRequest;
  if (!request) return;
  activeRequest = null;
  window.clearTimeout(request.timer);
  request.cleanup?.();
  if (request.slot) {
    try { window.googletag?.destroySlots?.([request.slot]); } catch { /* GPT cleanup is best effort. */ }
  }
  request.resolve(result);
}

function installListeners() {
  if (listenersInstalled) return;
  const pubads = window.googletag?.pubads?.();
  if (!pubads) return;

  pubads.addEventListener("rewardedSlotReady", (event) => {
    if (!activeRequest || event.slot !== activeRequest.slot || activeRequest.displayed) return;
    const request = activeRequest;
    window.clearTimeout(request.timer);
    if (!event.makeRewardedVisible) {
      finish("unavailable");
      return;
    }
    const show = () => {
      if (activeRequest?.id !== request.id || request.displayed) return;
      window.clearTimeout(request.timer);
      try {
        // GPT returns true only when it successfully displays the rewarded ad.
        if (event.makeRewardedVisible!() !== true) {
          if (activeRequest?.id === request.id) finish("unavailable");
          return;
        }
      } catch { finish("unavailable"); return; }
      request.displayed = true;
      if (activeRequest?.id !== request.id) return;
      request.timer = window.setTimeout(() => {
        if (activeRequest?.id === request.id) finish(activeRequest.granted ? "granted" : "unavailable");
      }, request.visibleTimeoutMs);
    };
    if (request.beforeVisible) {
      // A preloaded slot must wait for an explicit user action before display.
      request.timer = window.setTimeout(() => {
        if (activeRequest?.id === request.id) finish("unavailable");
      }, request.visibleTimeoutMs);
      void request.beforeVisible().then(show, () => {
        if (activeRequest?.id === request.id) finish("unavailable");
      });
    } else show();
  });
  pubads.addEventListener("rewardedSlotGranted", (event) => {
    if (!activeRequest || event.slot !== activeRequest.slot || activeRequest.granted) return;
    activeRequest.granted = true;
    trackRewardGranted();
  });
  pubads.addEventListener("rewardedSlotClosed", (event) => {
    if (!activeRequest || event.slot !== activeRequest.slot) return;
    finish(activeRequest.granted ? "granted" : "closed");
  });
  pubads.addEventListener("slotRenderEnded", (event) => {
    if (activeRequest && event.slot === activeRequest.slot && event.isEmpty) finish("unavailable");
  });
  listenersInstalled = true;
}

function requestOnce(
  adUnitPath: string,
  timeoutMs: number,
  visibleTimeoutMs: number,
  signal?: AbortSignal,
  beforeVisible?: () => Promise<void>,
) {
  if (signal?.aborted) return Promise.resolve<RewardedResult>("closed");
  if (activeRequest) return Promise.resolve<RewardedResult>("unavailable");

  return new Promise<RewardedResult>((resolve) => {
    const id = ++requestId;
    const onAbort = () => {
      if (activeRequest?.id === id) finish("closed");
    };
    window.googletag = window.googletag ?? { cmd: [] };
    activeRequest = {
      beforeVisible,
      cleanup: signal ? () => signal.removeEventListener("abort", onAbort) : undefined,
      displayed: false,
      granted: false,
      id,
      resolve,
      slot: null,
      timer: window.setTimeout(() => {
        if (activeRequest?.id === id) finish("unavailable");
      }, timeoutMs),
      visibleTimeoutMs,
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) {
      onAbort();
      return;
    }

    window.googletag.cmd.push(() => {
      if (!activeRequest || activeRequest.id !== id) return;
      try {
        installListeners();
        const googletag = window.googletag;
        const rewardedFormat = googletag?.enums?.OutOfPageFormat?.REWARDED;
        if (!googletag?.defineOutOfPageSlot || !googletag.pubads || !googletag.display || !rewardedFormat) {
          finish("unavailable");
          return;
        }
        try { googletag.pubads().updateCorrelator?.(); } catch { /* Optional GPT refresh hint. */ }
        const slot = googletag.defineOutOfPageSlot(adUnitPath, rewardedFormat);
        if (!slot) {
          finish("unavailable");
          return;
        }
        activeRequest.slot = slot;
        slot.addService(googletag.pubads());
        if (!servicesEnabled) {
          googletag.enableServices?.();
          servicesEnabled = true;
        }
        googletag.display(slot);
      } catch {
        finish("unavailable");
      }
    });
  });
}

function waitBeforeRetry(signal?: AbortSignal) {
  if (signal?.aborted) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let timer = 0;
    const finishWait = () => {
      window.clearTimeout(timer);
      signal?.removeEventListener("abort", finishWait);
      resolve();
    };
    timer = window.setTimeout(finishWait, 450);
    signal?.addEventListener("abort", finishWait, { once: true });
  });
}

export async function requestRewardedAd({
  adUnitPath,
  attempts,
  onAttempt,
  signal,
  retryOnClose = true,
  timeoutMs = 4000,
  visibleTimeoutMs = 120000,
  beforeVisible,
}: {
  adUnitPath: string;
  attempts: number;
  onAttempt?: (attempt: number, maximum: number) => void;
  retryOnClose?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
  visibleTimeoutMs?: number;
  beforeVisible?: () => Promise<void>;
}) {
  const maximum = Math.max(1, attempts);
  let unavailableAttempts = 0;

  while (unavailableAttempts < maximum) {
    if (signal?.aborted) return "closed";
    const attempt = unavailableAttempts + 1;
    onAttempt?.(attempt, maximum);
    const result = await requestOnce(
      adUnitPath,
      timeoutMs,
      visibleTimeoutMs,
      signal,
      beforeVisible,
    );
    if (signal?.aborted) return "closed";
    if (result === "granted") return result;
    if (result === "closed") {
      if (!retryOnClose) return "closed";
      await waitBeforeRetry(signal);
      continue;
    }

    unavailableAttempts += 1;
    if (unavailableAttempts < maximum) await waitBeforeRetry(signal);
  }

  return "unavailable";
}
