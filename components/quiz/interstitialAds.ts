import type { GoogleTag, GptSlot } from "./gpt";

// Anchor navigation is the only enabled trigger. GPT handles SPA navigation,
// creative presentation, dismissal and the network's frequency cap.
export function mountQuizInterstitial(adUnitPath: string) {
  let disposed = false;
  let googletag: GoogleTag | undefined;
  let slot: GptSlot | null = null;
  const release = () => {
    if (!slot) return;
    try { googletag?.destroySlots?.([slot]); } catch { /* Keep quiz navigation usable. */ }
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
        // Do not register an interstitial if automatic triggers cannot be disabled.
        if (!slot.setConfig) { release(); return; }
        slot.setConfig({ interstitial: { triggers: {
          navBar: false,
          unhideWindow: false,
          inactivity: false,
          endOfArticle: false,
          continueReading: false,
          backward: false,
        } } });
        slot.addService(googletag.pubads());
        if (!googletag.pubadsReady) googletag.enableServices?.();
        googletag.display(slot);
      } catch { release(); }
    });
  });
  return () => { disposed = true; release(); };
}
