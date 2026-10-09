"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { requestRewardedAd, type RewardedResult } from "@/components/quiz/rewardedAds";
import { siteConfig } from "@/lib/siteConfig";

type RewardedGateOptions = {
  attempts: number;
  onRewardClosed?: () => void;
  rewardClosedAlreadySent?: boolean;
  preload?: boolean;
};

type RunGateOptions = {
  retryOnClose?: boolean;
  scrollAfter?: boolean;
  scrollBehavior?: ScrollBehavior;
  minimumVisibleDelayMs?: number;
};

function waitUntil(time: number, signal: AbortSignal) {
  if (signal.aborted || Date.now() >= time) return Promise.resolve();
  return new Promise<void>(resolve => {
    const done = () => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    };
    const timer = window.setTimeout(done, time - Date.now());
    signal.addEventListener("abort", done, {once: true});
  });
}

function scrollExperienceToTop(behavior: ScrollBehavior) {
  window.scrollTo({ top: 0, behavior });
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior }));
}

export function useRewardedGate({ attempts, onRewardClosed, rewardClosedAlreadySent, preload = false }: RewardedGateOptions) {
  const [busy, setBusy] = useState(false);
  const active = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const options = useRef({attempts, onRewardClosed, rewardClosedAlreadySent});
  options.current = {attempts, onRewardClosed, rewardClosedAlreadySent};
  const prepared = useRef<{controller: AbortController; activate: (time: number) => void; outcome: Promise<RewardedResult>} | null>(null);

  const cancelGate = useCallback(() => {
    generation.current += 1;
    controller.current?.abort();
    prepared.current?.controller.abort();
    prepared.current = null;
    controller.current = null;
    active.current = false;
    setBusy(false);
  }, []);

  useEffect(() => () => {
    generation.current += 1;
    controller.current?.abort();
    prepared.current?.controller.abort();
  }, []);

  useEffect(() => {
    if (!preload || active.current || prepared.current) return;
    const requestController = new AbortController();
    let activate!: (time: number) => void;
    const consent = new Promise<number>(resolve => {activate = resolve;});
    requestController.signal.addEventListener("abort", () => activate(Date.now()), {once: true});
    const cached = {
      controller: requestController,
      activate,
      outcome: requestRewardedAd({
        adUnitPath: siteConfig.rewardedAdUnitPath,
        attempts: 1,
        onRewardClosed: () => options.current.onRewardClosed?.(),
        rewardClosedAlreadySent: options.current.rewardClosedAlreadySent,
        signal: requestController.signal,
        retryOnClose: false,
        beforeVisible: async () => waitUntil(await consent, requestController.signal),
      }),
    };
    prepared.current = cached;
    return () => {
      if (active.current) return;
      requestController.abort();
      if (prepared.current === cached) prepared.current = null;
    };
  }, [preload]);

  const runGate = useCallback(async (
    onComplete: () => void,
    { retryOnClose = true, scrollAfter = true, scrollBehavior = "auto", minimumVisibleDelayMs = 0 }: RunGateOptions = {},
  ) => {
    if (active.current) return;
    const requestGeneration = ++generation.current;
    const cached = prepared.current;
    prepared.current = null;
    const requestController = cached?.controller ?? new AbortController();
    const visibleAt = Date.now() + Math.max(0, minimumVisibleDelayMs);
    controller.current = requestController;
    active.current = true;
    setBusy(true);

    try {
      cached?.activate(visibleAt);
      let outcome = cached ? await cached.outcome : "unavailable";
      if (!cached || outcome === "unavailable") outcome = await requestRewardedAd({
        adUnitPath: siteConfig.rewardedAdUnitPath,
        attempts,
        onRewardClosed,
        rewardClosedAlreadySent,
        retryOnClose,
        signal: requestController.signal,
        beforeVisible: minimumVisibleDelayMs > 0 ? () => waitUntil(visibleAt, requestController.signal) : undefined,
      });
      await waitUntil(visibleAt, requestController.signal);
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
