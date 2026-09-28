import type { GoogleTag, GptEvent, GptSlot, PubAds } from "./gpt";

export type DisplayAdController = { destroy(): void; refresh(): void };

export function mountDisplayAd(
  element: HTMLElement,
  adUnitPath: string,
  onRender: (filled: boolean) => void,
  sizes: Array<[number, number] | "fluid"> = [[336, 280]],
): DisplayAdController {
  let disposed = false;
  let googletag: GoogleTag | undefined;
  let pubads: PubAds | undefined;
  let slot: GptSlot | null = null;
  let inFlight = true;
  let timeout: ReturnType<typeof setTimeout>;
  const armTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (disposed) return;
      onRender(false);
      disposed = true;
      release();
    }, 8000);
  };
  const onRenderEnded = (event: GptEvent) => {
    if (!disposed && slot && event.slot === slot) {
      clearTimeout(timeout);
      inFlight = false;
      onRender(event.isEmpty === false);
    }
  };
  armTimeout();
  const release = () => {
    clearTimeout(timeout);
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
          release();
          onRender(false);
          return;
        }
        slot = googletag.defineSlot(adUnitPath, sizes, element.id);
        if (!slot) {
          release();
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

  return {
    destroy() {
      disposed = true;
      release();
    },
    refresh() {
      // Initial loads already cover newly mounted slots. Never overlap requests
      // or refresh a placement that has left the question screen.
      if (disposed || inFlight || !element.isConnected || !slot || !pubads?.refresh) return;
      inFlight = true;
      armTimeout();
      try { pubads.refresh([slot]); } catch {
        clearTimeout(timeout);
        inFlight = false;
      }
    },
  };
}
