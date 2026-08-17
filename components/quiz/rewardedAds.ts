"use client";

export type RewardedResult = "granted" | "closed" | "unavailable";

type GptSlot = {
  addService(service: unknown): GptSlot;
  defineSizeMapping?: (mapping: unknown) => GptSlot;
};

type RewardedEvent = {
  slot: GptSlot;
  makeRewardedVisible?: () => void;
  isEmpty?: boolean;
};

type PubAds = {
  addEventListener(name: string, listener: (event: RewardedEvent) => void): void;
  updateCorrelator?: () => void;
};

type SizeMappingBuilder = {
  addSize(viewport: number[], sizes: number[][]): SizeMappingBuilder;
  build(): unknown;
};

type GoogleTag = {
  cmd: Array<() => void>;
  defineSlot?: (path: string, sizes: number[][], elementId: string) => GptSlot | null;
  defineOutOfPageSlot?: (path: string, format: unknown) => GptSlot | null;
  destroySlots?: (slots: GptSlot[]) => void;
  display?: (slotOrElementId: GptSlot | string) => void;
  enableServices?: () => void;
  enums?: { OutOfPageFormat?: { REWARDED?: unknown } };
  pubads?: () => PubAds;
  sizeMapping?: () => SizeMappingBuilder;
};

declare global {
  interface Window {
    googletag?: GoogleTag;
  }
}

type ActiveRequest = {
  cleanup?: () => void;
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

export function mountDisplayAds({
  adUnitPath,
  elementIds,
  sizes,
}: {
  adUnitPath: string;
  elementIds: string[];
  sizes: Array<[number, number]>;
}) {
  let cancelled = false;
  const slots: GptSlot[] = [];
  window.googletag = window.googletag ?? { cmd: [] };
  window.googletag.cmd.push(() => {
    if (cancelled) return;
    const googletag = window.googletag;
    const pubads = googletag?.pubads?.();
    if (!googletag?.defineSlot || !googletag.display || !pubads) return;

    const mapping = googletag.sizeMapping?.()
      .addSize([0, 0], [[300, 250]])
      .addSize([360, 0], sizes.map(([width, height]) => [width, height]))
      .build();

    elementIds.forEach((elementId) => {
      const slot = googletag.defineSlot?.(adUnitPath, sizes.map(([width, height]) => [width, height]), elementId);
      if (!slot) return;
      if (mapping) slot.defineSizeMapping?.(mapping);
      slots.push(slot.addService(pubads));
    });
    if (!slots.length || cancelled) return;
    if (!servicesEnabled) {
      googletag.enableServices?.();
      servicesEnabled = true;
    }
    elementIds.forEach((elementId) => googletag.display?.(elementId));
  });

  return () => {
    cancelled = true;
    if (slots.length) {
      try { window.googletag?.destroySlots?.(slots); } catch { /* GPT cleanup is best effort. */ }
    }
  };
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
    if (!activeRequest || event.slot !== activeRequest.slot) return;
    const request = activeRequest;
    window.clearTimeout(request.timer);
    if (!event.makeRewardedVisible) {
      finish("unavailable");
      return;
    }
    try { event.makeRewardedVisible(); } catch { finish("unavailable"); return; }
    if (!activeRequest || activeRequest.id !== request.id) return;
    request.timer = window.setTimeout(() => {
      if (activeRequest?.id === request.id) finish(activeRequest.granted ? "granted" : "unavailable");
    }, request.visibleTimeoutMs);
  });
  pubads.addEventListener("rewardedSlotGranted", (event) => {
    if (activeRequest && event.slot === activeRequest.slot) activeRequest.granted = true;
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

function requestOnce(adUnitPath: string, timeoutMs: number, visibleTimeoutMs: number, signal?: AbortSignal) {
  if (signal?.aborted) return Promise.resolve<RewardedResult>("closed");
  if (activeRequest) return Promise.resolve<RewardedResult>("unavailable");

  return new Promise<RewardedResult>((resolve) => {
    const id = ++requestId;
    const onAbort = () => {
      if (activeRequest?.id === id) finish("closed");
    };
    window.googletag = window.googletag ?? { cmd: [] };
    activeRequest = {
      cleanup: signal ? () => signal.removeEventListener("abort", onAbort) : undefined,
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
  timeoutMs = 4000,
  visibleTimeoutMs = 120000,
}: {
  adUnitPath: string;
  attempts: number;
  onAttempt?: (attempt: number, maximum: number) => void;
  signal?: AbortSignal;
  timeoutMs?: number;
  visibleTimeoutMs?: number;
}) {
  const maximum = Math.max(1, attempts);
  let unavailableAttempts = 0;

  while (unavailableAttempts < maximum) {
    if (signal?.aborted) return "closed";
    const attempt = unavailableAttempts + 1;
    onAttempt?.(attempt, maximum);
    const result = await requestOnce(adUnitPath, timeoutMs, visibleTimeoutMs, signal);
    if (signal?.aborted) return "closed";
    if (result === "granted") return result;
    if (result === "closed") {
      await waitBeforeRetry(signal);
      continue;
    }

    unavailableAttempts += 1;
    if (unavailableAttempts < maximum) await waitBeforeRetry(signal);
  }

  return "unavailable";
}
