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
  collapseEmptyDivs?: (collapseBeforeAdFetch?: boolean) => boolean;
  removeEventListener?: (name: string, listener: (event: RewardedEvent) => void) => void;
  refresh?: (slots: GptSlot[], options?: { changeCorrelator: boolean }) => void;
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
  enums?: { OutOfPageFormat?: { BOTTOM_ANCHOR?: unknown; REWARDED?: unknown } };
  pubads?: () => PubAds;
  setConfig?: (config: { adExpansion?: { enabled: boolean } }) => void;
  sizeMapping?: () => SizeMappingBuilder;
};

declare global {
  interface Window {
    googletag?: GoogleTag;
  }
}

type ActiveRequest = {
  closed: boolean;
  cleanup?: () => void;
  granted: boolean;
  id: number;
  onRewardClosed?: () => void;
  rewardClosedAlreadySent: boolean;
  resolve: (result: RewardedResult) => void;
  sent: boolean;
  slot: GptSlot | null;
  timer: number;
  visibleTimeoutMs: number;
};

let activeRequest: ActiveRequest | null = null;
let listenersInstalled = false;
let requestId = 0;
let servicesEnabled = false;

function sendRewardClosedIfComplete(request: ActiveRequest) {
  if (!request.granted || !request.closed || request.sent || request.rewardClosedAlreadySent) return;
  request.sent = true;
  request.rewardClosedAlreadySent = true;
  window.fbq?.("trackCustom", "RewardClosed");
  console.info("[RewardedAd] RewardClosed conditions met; Meta event requested.");
  request.onRewardClosed?.();
}

export function mountDisplayAd({
  adUnitPath,
  elementId,
  sizes,
}: {
  adUnitPath: string;
  elementId: string;
  sizes: Array<[number, number]>;
}) {
  let cancelled = false;
  let slot: GptSlot | null = null;
  let pubads: PubAds | undefined;
  let renderListener: ((event: RewardedEvent) => void) | undefined;
  window.googletag = window.googletag ?? { cmd: [] };
  window.googletag.cmd.push(() => {
    if (cancelled) return;
    const googletag = window.googletag;
    pubads = googletag?.pubads?.();
    if (!googletag?.defineSlot || !googletag.display || !pubads) return;

    googletag.setConfig?.({ adExpansion: { enabled: true } });
    const allSizes = sizes.map(([width, height]) => [width, height]);
    const compactSizes = allSizes.filter(([width]) => width <= 300);
    const mediumSizes = allSizes.filter(([width]) => width <= 320);
    const mapping = googletag.sizeMapping?.()
      .addSize([0, 0], compactSizes.length ? compactSizes : allSizes)
      .addSize([320, 0], mediumSizes.length ? mediumSizes : allSizes)
      .addSize([336, 0], allSizes)
      .build();

    slot = googletag.defineSlot(adUnitPath, allSizes, elementId);
    if (!slot) return;
    if (mapping) slot.defineSizeMapping?.(mapping);
    slot.addService(pubads);
    renderListener = (event) => {
      if (event.slot !== slot) return;
      const row = document.getElementById(elementId)?.closest<HTMLElement>("[data-display-ad]");
      if (!row) return;
      row.toggleAttribute("data-ad-empty", Boolean(event.isEmpty));
    };
    pubads.addEventListener("slotRenderEnded", renderListener);
    if (!servicesEnabled) {
      googletag.enableServices?.();
      servicesEnabled = true;
    }
    googletag.display(elementId);
  });

  return {
    refresh() {
      window.googletag?.cmd.push(() => {
        if (!cancelled && slot && pubads?.refresh) pubads.refresh([slot], { changeCorrelator: true });
      });
    },
    destroy() {
      cancelled = true;
      if (pubads && renderListener) pubads.removeEventListener?.("slotRenderEnded", renderListener);
      if (slot) {
        try { window.googletag?.destroySlots?.([slot]); } catch { /* GPT cleanup is best effort. */ }
      }
    },
  };
}

export function mountStickyDisplayAd({ adUnitPath }: { adUnitPath: string }) {
  let cancelled = false;
  let slot: GptSlot | null = null;
  window.googletag = window.googletag ?? { cmd: [] };
  window.googletag.cmd.push(() => {
    if (cancelled) return;
    const googletag = window.googletag;
    const pubads = googletag?.pubads?.();
    const format = googletag?.enums?.OutOfPageFormat?.BOTTOM_ANCHOR;
    if (!googletag?.defineOutOfPageSlot || !googletag.display || !pubads || format === undefined) return;

    googletag.setConfig?.({ adExpansion: { enabled: true } });
    slot = googletag.defineOutOfPageSlot(adUnitPath, format);
    if (!slot) return;
    slot.addService(pubads);
    if (!servicesEnabled) {
      googletag.enableServices?.();
      servicesEnabled = true;
    }
    googletag.display(slot);
  });

  return {
    destroy() {
      cancelled = true;
      if (slot) {
        try { window.googletag?.destroySlots?.([slot]); } catch { /* GPT cleanup is best effort. */ }
      }
    },
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
    if (!activeRequest || event.slot !== activeRequest.slot) return;
    activeRequest.granted = true;
    sendRewardClosedIfComplete(activeRequest);
  });
  pubads.addEventListener("rewardedSlotClosed", (event) => {
    if (!activeRequest || event.slot !== activeRequest.slot) return;
    activeRequest.closed = true;
    sendRewardClosedIfComplete(activeRequest);
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
  rewardClosedAlreadySent = false,
  onRewardClosed?: () => void,
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
      closed: false,
      cleanup: signal ? () => signal.removeEventListener("abort", onAbort) : undefined,
      granted: false,
      id,
      onRewardClosed,
      rewardClosedAlreadySent,
      resolve,
      sent: false,
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
  onRewardClosed,
  rewardClosedAlreadySent = false,
  signal,
  timeoutMs = 4000,
  visibleTimeoutMs = 120000,
}: {
  adUnitPath: string;
  attempts: number;
  onAttempt?: (attempt: number, maximum: number) => void;
  onRewardClosed?: () => void;
  rewardClosedAlreadySent?: boolean;
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
    const result = await requestOnce(
      adUnitPath,
      timeoutMs,
      visibleTimeoutMs,
      signal,
      rewardClosedAlreadySent,
      onRewardClosed,
    );
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
