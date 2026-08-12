"use client";

type RewardedResult = "granted" | "closed" | "unavailable";

type GptSlot = {
  addService(service: unknown): GptSlot;
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

type GoogleTag = {
  cmd: Array<() => void>;
  defineOutOfPageSlot?: (path: string, format: unknown) => GptSlot | null;
  destroySlots?: (slots: GptSlot[]) => void;
  display?: (slot: GptSlot) => void;
  enableServices?: () => void;
  enums?: { OutOfPageFormat?: { REWARDED?: unknown } };
  pubads?: () => PubAds;
};

declare global {
  interface Window {
    googletag?: GoogleTag;
  }
}

type ActiveRequest = {
  granted: boolean;
  id: number;
  ready: boolean;
  resolve: (result: RewardedResult) => void;
  slot: GptSlot | null;
  timer: number;
};

let activeRequest: ActiveRequest | null = null;
let listenersInstalled = false;
let requestId = 0;
let servicesEnabled = false;

function finish(result: RewardedResult) {
  const request = activeRequest;
  if (!request) return;
  activeRequest = null;
  window.clearTimeout(request.timer);
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
    activeRequest.ready = true;
    window.clearTimeout(activeRequest.timer);
    try { event.makeRewardedVisible?.(); } catch { finish("unavailable"); }
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

function requestOnce(adUnitPath: string, timeoutMs: number) {
  if (activeRequest) return Promise.resolve<RewardedResult>("unavailable");

  return new Promise<RewardedResult>((resolve) => {
    const id = ++requestId;
    window.googletag = window.googletag ?? { cmd: [] };
    activeRequest = {
      granted: false,
      id,
      ready: false,
      resolve,
      slot: null,
      timer: window.setTimeout(() => {
        if (activeRequest?.id === id && !activeRequest.ready) finish("unavailable");
      }, timeoutMs),
    };

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

export async function requestRewardedAd({
  adUnitPath,
  attempts,
  onAttempt,
  timeoutMs = 4000,
}: {
  adUnitPath: string;
  attempts: number;
  onAttempt?: (attempt: number, maximum: number) => void;
  timeoutMs?: number;
}) {
  const maximum = Math.max(1, attempts);
  for (let attempt = 1; attempt <= maximum; attempt += 1) {
    onAttempt?.(attempt, maximum);
    const result = await requestOnce(adUnitPath, timeoutMs);
    if (result === "granted") return true;
    if (attempt < maximum) await new Promise((resolve) => window.setTimeout(resolve, 450));
  }
  return false;
}
