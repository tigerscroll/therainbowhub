"use client";

import { siteConfig } from "@/lib/siteConfig";
import { trackRewardClosed, trackRewardGranted } from "@/lib/tracking";

type RewardedPlacement = "before_start" | "before_stage_results" | "before_final_results";
type RewardedSlot = {
  addService?: (service: unknown) => void;
};
type RewardedEvent = {
  makeRewardedVisible?: () => void;
  slot: RewardedSlot;
};
type GooglePublisherTag = {
  cmd: { push(callback: () => void): void };
  defineOutOfPageSlot?: (adUnitPath: string, format: unknown) => RewardedSlot | null;
  destroySlots?: (slots: RewardedSlot[]) => void;
  display?: (slot: RewardedSlot) => void;
  enableServices?: () => void;
  enums?: {
    OutOfPageFormat?: {
      REWARDED?: unknown;
    };
  };
  pubads?: () => {
    addEventListener: (eventName: string, callback: (event: RewardedEvent) => void) => void;
  };
};
type RewardedRequest = {
  failTimer: number;
  granted: boolean;
  placement: RewardedPlacement;
  ready: boolean;
  requestId: number;
  resolve: (result: RewardedResult) => void;
  slot: RewardedSlot | null;
};
type RewardedResult = {
  reason: string;
  status: "closed_without_reward" | "granted" | "unavailable";
};
type RewardedStatusCallback = (message: string) => void;

declare global {
  interface Window {
    googletag?: GooglePublisherTag;
  }
}

let activeRewardedAd: RewardedRequest | null = null;
let listenersInstalled = false;
let servicesEnabled = false;
let requestId = 0;
const googlePublisherTagUrl = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";

function finishRewardedAd(status: RewardedResult["status"], reason: string) {
  const request = activeRewardedAd;
  if (!request) return;
  const granted = status === "granted";

  activeRewardedAd = null;
  window.clearTimeout(request.failTimer);

  if (request.slot && window.googletag?.cmd) {
    window.googletag.cmd.push(() => {
      try {
        window.googletag?.destroySlots?.([request.slot as RewardedSlot]);
      } catch {}
    });
  }

  trackRewardClosed({
    placement: request.placement,
    fallback: status === "unavailable",
    granted,
    reason,
    ad_unit_path: siteConfig.googleAdManagerRewardedAdUnitPath,
  });

  request.resolve({ reason, status });
}

function ensureRewardedListeners() {
  if (listenersInstalled || !window.googletag?.pubads) return;

  const pubads = window.googletag.pubads();

  pubads.addEventListener("rewardedSlotReady", (event) => {
    const request = activeRewardedAd;
    if (!request || event.slot !== request.slot) return;

    request.ready = true;
    window.clearTimeout(request.failTimer);

    try {
      event.makeRewardedVisible?.();
    } catch {
      finishRewardedAd("unavailable", "make_visible_failed");
    }
  });

  pubads.addEventListener("rewardedSlotGranted", (event) => {
    const request = activeRewardedAd;
    if (!request || event.slot !== request.slot) return;

    request.granted = true;
    trackRewardGranted({
      placement: request.placement,
      fallback: false,
      ad_unit_path: siteConfig.googleAdManagerRewardedAdUnitPath,
    });
  });

  pubads.addEventListener("rewardedSlotClosed", (event) => {
    const request = activeRewardedAd;
    if (!request || event.slot !== request.slot) return;

    finishRewardedAd(request.granted ? "granted" : "closed_without_reward", request.granted ? "reward_granted" : "closed_without_reward");
  });

  listenersInstalled = true;
}

function loadGooglePublisherTag() {
  if (typeof window.googletag?.defineOutOfPageSlot === "function") return;
  if (document.querySelector('script[data-rainbow-gpt-loader="true"]')) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = googlePublisherTagUrl;
  script.setAttribute("data-rainbow-gpt-loader", "true");
  document.head.appendChild(script);
}

function requestRewardedAdOnce(placement: RewardedPlacement): Promise<RewardedResult> {
  if (!siteConfig.googleAdManagerRewardedAdUnitPath) {
    return Promise.resolve({ reason: "missing_ad_unit_path", status: "unavailable" });
  }

  if (activeRewardedAd) {
    return Promise.resolve({ reason: "ad_request_already_active", status: "unavailable" });
  }

  return new Promise((resolve) => {
    const currentRequestId = ++requestId;

    window.googletag = window.googletag || { cmd: [] };
    loadGooglePublisherTag();
    activeRewardedAd = {
      failTimer: window.setTimeout(() => {
        if (activeRewardedAd?.requestId === currentRequestId && !activeRewardedAd.ready) {
          finishRewardedAd("unavailable", "no_rewarded_ad");
        }
      }, 8000),
      granted: false,
      placement,
      ready: false,
      requestId: currentRequestId,
      resolve,
      slot: null,
    };

    try {
      window.googletag.cmd.push(() => {
        const request = activeRewardedAd;
        if (!request || request.requestId !== currentRequestId) return;

        try {
          ensureRewardedListeners();

          const slot = window.googletag?.defineOutOfPageSlot?.(
            siteConfig.googleAdManagerRewardedAdUnitPath,
            window.googletag?.enums?.OutOfPageFormat?.REWARDED,
          );

          if (!slot) {
            finishRewardedAd("unavailable", "slot_unavailable");
            return;
          }

          request.slot = slot;
          slot.addService?.(window.googletag?.pubads?.());

          if (!servicesEnabled) {
            window.googletag?.enableServices?.();
            servicesEnabled = true;
          }

          window.googletag?.display?.(slot);
        } catch {
          finishRewardedAd("unavailable", "request_error");
        }
      });
    } catch {
      finishRewardedAd("unavailable", "gpt_queue_error");
    }
  });
}

function requestRewardedAd(placement: RewardedPlacement, onStatus?: RewardedStatusCallback): Promise<boolean> {
  const maxUnavailableAttempts = 3;
  let unavailableAttempts = 0;

  return new Promise((resolve) => {
    function setStatus(message: string) {
      onStatus?.(message);
    }

    function proceedWithoutAd(reason: string) {
      trackRewardGranted({
        placement,
        fallback: true,
        reason,
        ad_unit_path: siteConfig.googleAdManagerRewardedAdUnitPath,
      });
      resolve(true);
    }

    function tryAd() {
      requestRewardedAdOnce(placement).then((result) => {
        if (result.status === "granted") {
          resolve(true);
          return;
        }

        if (result.status === "closed_without_reward") {
          setStatus("Please complete the ad to continue. Reopening...");
          window.setTimeout(tryAd, 350);
          return;
        }

        unavailableAttempts += 1;
        if (unavailableAttempts >= maxUnavailableAttempts) {
          proceedWithoutAd("no_rewarded_ad_after_3_attempts");
          return;
        }

        setStatus(`No ad was available. Trying again ${unavailableAttempts + 1}/${maxUnavailableAttempts}`);
        window.setTimeout(tryAd, 450);
      });
    }

    tryAd();
  });
}

export function showRewardedAdBeforeStart(onStatus?: RewardedStatusCallback) {
  return requestRewardedAd("before_start", onStatus);
}

export function showRewardedAdBeforeStageResults(onStatus?: RewardedStatusCallback) {
  return requestRewardedAd("before_stage_results", onStatus);
}

export function showRewardedAdBeforeFinalResults(onStatus?: RewardedStatusCallback) {
  return requestRewardedAd("before_final_results", onStatus);
}
