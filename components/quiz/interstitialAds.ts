import type { GoogleTag, GptSlot } from "./gpt";

/**
 * Registers one GPT-managed web interstitial for the lifetime of a quiz SPA.
 * GPT owns serving, dismissal and the Ad Manager frequency cap. We disable
 * optional ambient triggers so only explicitly eligible anchor clicks can
 * open an interstitial.
 */
export function mountQuizInterstitial(adUnitPath: string) {
  let disposed = false;
  let googletag: GoogleTag | undefined;
  let slot: GptSlot | null = null;

  const release = () => {
    if (!slot) return;
    try { googletag?.destroySlots?.([slot]); } catch { /* Navigation must remain usable. */ }
    slot = null;
  };

  queueMicrotask(() => {
    if (disposed) return;
    window.googletag ??= { cmd: [] };
    window.googletag.cmd.push(() => {
      if (disposed) return;
      googletag = window.googletag;
      const format = googletag?.enums?.OutOfPageFormat?.INTERSTITIAL;
      if (format === undefined || !googletag?.defineOutOfPageSlot || !googletag.pubads || !googletag.display) return;

      try {
        slot = googletag.defineOutOfPageSlot(adUnitPath, format);
        if (!slot) return;
        slot.setConfig?.({
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
        slot.addService(googletag.pubads());
        if (!googletag.pubadsReady) googletag.enableServices?.();
        googletag.display(slot);
      } catch {
        release();
      }
    });
  });

  return () => {
    disposed = true;
    release();
  };
}
