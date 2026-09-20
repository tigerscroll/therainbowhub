"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { requestRewardedAd } from "@/components/quiz/rewardedAds";
import { siteConfig } from "@/lib/siteConfig";

type RewardedGateOptions = {
  attempts: number;
  onRewardClosed?: () => void;
  rewardClosedAlreadySent?: boolean;
};

type RunGateOptions = {
  scrollAfter?: boolean;
  scrollBehavior?: ScrollBehavior;
};

function scrollExperienceToTop(behavior: ScrollBehavior) {
  window.scrollTo({ top: 0, behavior });
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior }));
}

export function useRewardedGate({ attempts, onRewardClosed, rewardClosedAlreadySent }: RewardedGateOptions) {
  const [busy, setBusy] = useState(false);
  const active = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);

  const cancelGate = useCallback(() => {
    generation.current += 1;
    controller.current?.abort();
    controller.current = null;
    active.current = false;
    setBusy(false);
  }, []);

  useEffect(() => () => {
    generation.current += 1;
    controller.current?.abort();
  }, []);

  const runGate = useCallback(async (
    onComplete: () => void,
    { scrollAfter = true, scrollBehavior = "auto" }: RunGateOptions = {},
  ) => {
    if (active.current) return;
    const requestGeneration = ++generation.current;
    const requestController = new AbortController();
    controller.current = requestController;
    active.current = true;
    setBusy(true);

    try {
      const outcome = await requestRewardedAd({
        adUnitPath: siteConfig.rewardedAdUnitPath,
        attempts,
        onRewardClosed,
        rewardClosedAlreadySent,
        signal: requestController.signal,
      });
      if (requestGeneration !== generation.current) return;
      controller.current = null;
      active.current = false;
      if (outcome === "closed") {
        setBusy(false);
        return;
      }
      flushSync(() => {
        onComplete();
        setBusy(false);
      });
      if (scrollAfter) scrollExperienceToTop(scrollBehavior);
    } catch {
      if (requestGeneration !== generation.current) return;
      controller.current = null;
      active.current = false;
      setBusy(false);
    }
  }, [attempts, onRewardClosed, rewardClosedAlreadySent]);

  return { busy, cancelGate, runGate };
}
