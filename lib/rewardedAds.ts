"use client";

import { trackRewardClosed, trackRewardGranted } from "@/lib/tracking";

type RewardedPlacement = "before_start" | "before_stage_results" | "before_final_results";

function resolveWithoutAd(placement: RewardedPlacement) {
  // Local testing mode: rewarded ad gates continue immediately.
  // Reconnect Google Ad Manager rewarded code here when you are ready to test ads.
  trackRewardGranted({ placement, fallback: true });
  trackRewardClosed({ placement, reason: "fallback_resolved" });
  return true;
}

function requestRewardedAd(placement: RewardedPlacement): Promise<boolean> {
  return Promise.resolve(resolveWithoutAd(placement));
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
