import type { GoogleTag, GptEvent, GptSlot, PubAds } from "./gpt";

export const INTERSTITIAL_REARM_MS = 60_000;
const SPA_NAVIGATION_EVENT = "rainbowhub:spa-navigation";
const BLOCKED_RECHECK_MS = 1_000;

const OVERLAY_SELECTOR = [
  "dialog[open]",
  "[aria-modal='true']",
  "[data-overlay-open='true']",
  "[data-ad-overlay='true']",
  "[role='dialog'][data-state='open']",
  "[id^='google_ads_iframe_'][id$='__container__']",
].join(",");

function isVisibleOverlay(element: Element) {
  if (!(element instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 1 || rect.height <= 1) return false;
  if (element.matches("[id^='google_ads_iframe_'][id$='__container__']")) {
    return style.position === "fixed" || rect.width >= window.innerWidth * .75 || rect.height >= window.innerHeight * .75;
  }
  return true;
}

function hasVisibleOverlay() {
  return Array.from(document.querySelectorAll(OVERLAY_SELECTOR)).some(isVisibleOverlay);
}

/**
 * Keeps one GPT-managed interstitial opportunity prepared throughout a quiz
 * SPA. A viewable impression starts the re-arm window; replacing the slot only
 * prepares fresh inventory. Google still decides whether a later eligible
 * navigation may show an ad and applies its own frequency cap.
 */
export function mountQuizInterstitial(adUnitPath: string) {
  let disposed = false;
  let googletag: GoogleTag | undefined;
  let pubads: PubAds | undefined;
  let slot: GptSlot | null = null;
  let impressionListener: ((event: GptEvent) => void) | null = null;
  let viewableAt: number | null = null;
  let rearmTimer: number | null = null;
  let rearming = false;

  const clearRearmTimer = () => {
    if (rearmTimer === null) return;
    window.clearTimeout(rearmTimer);
    rearmTimer = null;
  };

  const removeImpressionListener = () => {
    if (!impressionListener) return;
    try { pubads?.removeEventListener?.("impressionViewable", impressionListener); } catch { /* Best-effort GPT cleanup. */ }
    impressionListener = null;
  };

  const destroyCurrentSlot = () => {
    removeImpressionListener();
    if (!slot) return;
    try { googletag?.destroySlots?.([slot]); } catch { /* Navigation must remain usable. */ }
    slot = null;
  };

  const defineAndDisplaySlot = () => {
    if (disposed || !googletag) return;
    const format = googletag.enums?.OutOfPageFormat?.INTERSTITIAL;
    if (format === undefined || !googletag.defineOutOfPageSlot || !googletag.pubads || !googletag.display) return;

    const nextSlot = googletag.defineOutOfPageSlot(adUnitPath, format);
    if (!nextSlot) return;

    slot = nextSlot;
    pubads = googletag.pubads();
    nextSlot.setConfig?.({
      interstitial: {
        triggers: {
          navBar: false,
          unhideWindow: false,
          inactivity: false,
          endOfArticle: false,
          continueReading: false,
          backward: false,
        },
      },
    });
    nextSlot.addService(pubads);

    impressionListener = (event) => {
      if (disposed || event.slot !== nextSlot || slot !== nextSlot || viewableAt !== null) return;
      viewableAt = Date.now();
      scheduleRearm(INTERSTITIAL_REARM_MS);
    };
    pubads.addEventListener("impressionViewable", impressionListener);

    if (!googletag.pubadsReady) googletag.enableServices?.();
    googletag.display(nextSlot);
  };

  const checkRearmEligibility = () => {
    clearRearmTimer();
    if (disposed || rearming || viewableAt === null || !slot) return;

    const remaining = INTERSTITIAL_REARM_MS - (Date.now() - viewableAt);
    if (remaining > 0) {
      scheduleRearm(remaining);
      return;
    }
    if (document.visibilityState !== "visible" || hasVisibleOverlay()) {
      scheduleRearm(BLOCKED_RECHECK_MS);
      return;
    }

    rearming = true;
    window.googletag?.cmd.push(() => {
      try {
        if (disposed) return;
        destroyCurrentSlot();
        viewableAt = null;
        defineAndDisplaySlot();
      } catch {
        destroyCurrentSlot();
      } finally {
        rearming = false;
      }
    });
  };

  function scheduleRearm(delay: number) {
    if (disposed || rearmTimer !== null) return;
    rearmTimer = window.setTimeout(checkRearmEligibility, Math.max(0, delay));
  }

  const recheck = () => checkRearmEligibility();
  window.addEventListener(SPA_NAVIGATION_EVENT, recheck);
  window.addEventListener("popstate", recheck);
  window.addEventListener("hashchange", recheck);
  document.addEventListener("visibilitychange", recheck);

  queueMicrotask(() => {
    if (disposed) return;
    window.googletag ??= { cmd: [] };
    window.googletag.cmd.push(() => {
      if (disposed) return;
      googletag = window.googletag;
      try { defineAndDisplaySlot(); } catch { destroyCurrentSlot(); }
    });
  });

  return () => {
    if (disposed) return;
    disposed = true;
    clearRearmTimer();
    window.removeEventListener(SPA_NAVIGATION_EVENT, recheck);
    window.removeEventListener("popstate", recheck);
    window.removeEventListener("hashchange", recheck);
    document.removeEventListener("visibilitychange", recheck);
    destroyCurrentSlot();
  };
}
