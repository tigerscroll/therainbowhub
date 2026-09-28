import type { GoogleTag, GptEvent, GptSlot, PubAds } from "./gpt";

export function mountNativeAd(
  element: HTMLElement,
  adUnitPath: string,
  onRender: (filled: boolean) => void,
) {
  let disposed = false;
  let googletag: GoogleTag | undefined;
  let pubads: PubAds | undefined;
  let slot: GptSlot | null = null;
  const onRenderEnded = (event: GptEvent) => {
    if (!disposed && slot && event.slot === slot) onRender(event.isEmpty === false);
  };
  const release = () => {
    try { pubads?.removeEventListener?.("slotRenderEnded", onRenderEnded); } catch { /* Best-effort cleanup. */ }
    if (slot) {
      try { googletag?.destroySlots?.([slot]); } catch { /* Never destroy another placement. */ }
      slot = null;
    }
  };

  // Let Strict Mode's initial cleanup cancel the request before contacting GPT.
  queueMicrotask(() => {
    if (disposed || !element.isConnected) return;
    window.googletag ??= { cmd: [] };
    window.googletag.cmd.push(() => {
      if (disposed || !element.isConnected) return;
      googletag = window.googletag;
      try {
        if (!googletag?.defineSlot || !googletag.pubads || !googletag.display) {
          onRender(false);
          return;
        }
        slot = googletag.defineSlot(adUnitPath, ["fluid"], element.id);
        if (!slot) {
          onRender(false);
          return;
        }
        pubads = googletag.pubads();
        slot.addService(pubads);
        pubads.addEventListener("slotRenderEnded", onRenderEnded);
        if (!googletag.pubadsReady) googletag.enableServices?.();
        googletag.display(slot);
      } catch {
        release();
        if (!disposed) onRender(false);
      }
    });
  });

  return () => {
    disposed = true;
    release();
  };
}
