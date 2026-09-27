"use client";

import type { RewardedResult } from "../quiz/rewardedAds";

type Slot = { addService(service: unknown): Slot };
type AdEvent = { slot: Slot; isEmpty?: boolean; makeRewardedVisible?: () => void | boolean };

// Article rewards deliberately have no quiz tracking or automatic close/retry loop.
export function requestArticleReward({
  adUnitPath,
  signal,
  timeoutMs = 6000,
  visibleTimeoutMs = 180000,
}: {
  adUnitPath: string;
  signal: AbortSignal;
  timeoutMs?: number;
  visibleTimeoutMs?: number;
}): Promise<RewardedResult> {
  if (signal.aborted) return Promise.resolve("closed");
  return new Promise((resolve) => {
    let slot: Slot | null = null;
    let granted = false;
    let disposed = false;
    let timer: number;
    const listeners: Array<[string, (event: AdEvent) => void]> = [];
    let pubads: ReturnType<NonNullable<NonNullable<Window["googletag"]>["pubads"]>> | undefined;
    const finish = (result: RewardedResult) => {
      if (disposed) return;
      disposed = true;
      window.clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      for (const [name, listener] of listeners) pubads?.removeEventListener?.(name, listener);
      try { if (slot) window.googletag?.destroySlots?.([slot]); } catch { /* Best-effort cleanup. */ }
      resolve(granted ? "granted" : result);
    };
    const abort = () => finish("closed");
    timer = window.setTimeout(() => finish("unavailable"), timeoutMs);
    signal.addEventListener("abort", abort, { once: true });
    window.googletag ??= { cmd: [] };
    window.googletag.cmd.push(() => {
      if (disposed) return;
      try {
        const tag = window.googletag;
        const format = tag?.enums?.OutOfPageFormat?.REWARDED;
        pubads = tag?.pubads?.();
        if (!tag?.defineOutOfPageSlot || !tag.display || !pubads || !format) return finish("unavailable");
        slot = tag.defineOutOfPageSlot(adUnitPath, format);
        if (!slot) return finish("unavailable");
        const listen = (name: string, callback: (event: AdEvent) => void) => {
          const listener = (event: AdEvent) => { if (!disposed && event.slot === slot) callback(event); };
          listeners.push([name, listener]);
          pubads!.addEventListener(name, listener);
        };
        listen("rewardedSlotReady", event => {
          if (!event.makeRewardedVisible) return finish("unavailable");
          window.clearTimeout(timer);
          // A visible ad timing out is not proof of completion or no fill.
          timer = window.setTimeout(() => finish("closed"), visibleTimeoutMs);
          try { if (event.makeRewardedVisible() === false) finish("unavailable"); }
          catch { finish("unavailable"); }
        });
        listen("rewardedSlotGranted", () => {
          granted = true;
          resolve("granted");
          // Keep Google's ad and close control intact until the user closes it.
        });
        listen("rewardedSlotClosed", () => finish("closed"));
        listen("slotRenderEnded", event => { if (event.isEmpty) finish("unavailable"); });
        slot.addService(pubads);
        tag.enableServices?.();
        tag.display(slot);
      } catch { finish("unavailable"); }
    });
  });
}

export function mountArticleDisplayAd(elementId: string, adUnitPath: string, onEmpty: () => void) {
  let disposed = false;
  let slot: Slot | null = null;
  let pubads: ReturnType<NonNullable<NonNullable<Window["googletag"]>["pubads"]>> | undefined;
  const listener = (event: AdEvent) => {
    if (disposed || event.slot !== slot) return;
    window.clearTimeout(timer);
    if (event.isEmpty) onEmpty();
  };
  const timer = window.setTimeout(() => { cleanup(); onEmpty(); }, 10000);
  const cleanup = () => {
    disposed = true;
    window.clearTimeout(timer);
    pubads?.removeEventListener?.("slotRenderEnded", listener);
    try { if (slot) window.googletag?.destroySlots?.([slot]); } catch { /* Best-effort cleanup. */ }
  };
  window.googletag ??= { cmd: [] };
  window.googletag.cmd.push(() => {
    if (disposed) return;
    try {
      const tag = window.googletag;
      const width = document.getElementById(elementId)?.clientWidth ?? 0;
      const sizes: Array<[number, number]> = [[300, 250], [336, 280]].filter(size => size[0] <= width) as Array<[number, number]>;
      pubads = tag?.pubads?.();
      if (!tag?.defineSlot || !tag.display || !pubads || !sizes.length) { cleanup(); onEmpty(); return; }
      slot = tag.defineSlot(adUnitPath, sizes, elementId);
      if (!slot) { cleanup(); onEmpty(); return; }
      slot.addService(pubads);
      pubads.addEventListener("slotRenderEnded", listener);
      tag.enableServices?.();
      tag.display(elementId);
    } catch { cleanup(); onEmpty(); }
  });
  return cleanup;
}
