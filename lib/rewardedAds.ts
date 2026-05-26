"use client";

import { siteConfig } from "@/lib/siteConfig";
import { trackRewardClosed, trackRewardGranted } from "@/lib/tracking";

const adTimeoutMs = 7500;
const maxAdAttempts = 3;

type RewardedPlacement = "before_start" | "before_stage_results" | "before_final_results";

type GoogleTagSlot = unknown;

type RewardedEvent = {
  slot: GoogleTagSlot;
  makeRewardedVisible?: () => void;
};

type GoogleTag = {
  cmd: Array<() => void>;
  defineOutOfPageSlot?: (path: string, format: unknown) => GoogleTagSlot | null;
  destroySlots?: (slots: GoogleTagSlot[]) => void;
  display?: (slot: GoogleTagSlot) => void;
  enableServices?: () => void;
  enums?: {
    OutOfPageFormat?: {
      REWARDED?: unknown;
    };
  };
  pubads?: () => {
    addEventListener?: (eventName: string, callback: (event: RewardedEvent) => void) => void;
    removeEventListener?: (eventName: string, callback: (event: RewardedEvent) => void) => void;
    updateCorrelator?: () => void;
  };
};

declare global {
  interface Window {
    googletag?: GoogleTag;
  }
}

function resolveWithoutAd(placement: RewardedPlacement) {
  // If Google Ad Manager is unavailable, the quiz continues. This keeps the flow usable while ad setup is incomplete.
  trackRewardGranted({ placement, fallback: true });
  trackRewardClosed({ placement, reason: "fallback_resolved" });
  return true;
}

function clearRewardedSlot(slot: GoogleTagSlot | null) {
  if (!slot || typeof window === "undefined") {
    return;
  }

  try {
    window.googletag?.destroySlots?.([slot]);
  } catch {
    // Destroying a stale GPT slot should never block the quiz flow.
  }
}

function requestRewardedAd(placement: RewardedPlacement, attempt = 1): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(true);
  }

  window.googletag = window.googletag ?? { cmd: [] };

  return new Promise((resolve) => {
    let rewardedSlot: GoogleTagSlot | null = null;
    let rewardGranted = false;
    let hasSettled = false;

    function settle(value: boolean) {
      if (hasSettled) {
        return;
      }

      hasSettled = true;
      clearTimeout(timeout);
      clearRewardedSlot(rewardedSlot);
      resolve(value);
    }

    function retryOrContinue() {
      clearTimeout(timeout);

      if (attempt < maxAdAttempts) {
        setTimeout(() => {
          requestRewardedAd(placement, attempt + 1).then(resolve);
        }, 450);
        return;
      }

      settle(resolveWithoutAd(placement));
    }

    const timeout = window.setTimeout(retryOrContinue, adTimeoutMs);
    const googleTag = window.googletag;

    if (!googleTag?.cmd || !googleTag.defineOutOfPageSlot || !googleTag.pubads) {
      retryOrContinue();
      return;
    }

    googleTag.cmd.push(() => {
      try {
        const pubads = window.googletag?.pubads?.();
        pubads?.updateCorrelator?.();

        const rewardedFormat = window.googletag?.enums?.OutOfPageFormat?.REWARDED;
        const slot = window.googletag?.defineOutOfPageSlot?.(siteConfig.rewardedAdUnitPath, rewardedFormat);
        rewardedSlot = slot ?? null;

        if (!slot || !pubads) {
          retryOrContinue();
          return;
        }

        const removeListeners = () => {
          pubads.removeEventListener?.("rewardedSlotReady", onReady);
          pubads.removeEventListener?.("rewardedSlotGranted", onGranted);
          pubads.removeEventListener?.("rewardedSlotClosed", onClosed);
        };

        const onReady = (event: RewardedEvent) => {
          if (event.slot !== slot) {
            return;
          }

          clearTimeout(timeout);
          event.makeRewardedVisible?.();
        };

        const onGranted = (event: RewardedEvent) => {
          if (event.slot !== slot) {
            return;
          }

          rewardGranted = true;
          trackRewardGranted({ placement });
        };

        const onClosed = (event: RewardedEvent) => {
          if (event.slot !== slot) {
            return;
          }

          removeListeners();

          if (rewardGranted) {
            trackRewardClosed({ placement });
            settle(true);
            return;
          }

          retryOrContinue();
        };

        pubads.addEventListener?.("rewardedSlotReady", onReady);
        pubads.addEventListener?.("rewardedSlotGranted", onGranted);
        pubads.addEventListener?.("rewardedSlotClosed", onClosed);
        window.googletag?.enableServices?.();
        window.googletag?.display?.(slot);
      } catch {
        retryOrContinue();
      }
    });
  });
}

export function showRewardedAdBeforeStart() {
  return requestRewardedAd("before_start");
}

export function showRewardedAdBeforeStageResults() {
  return requestRewardedAd("before_stage_results");
}

export function showRewardedAdBeforeFinalResults() {
  return requestRewardedAd("before_final_results");
}
