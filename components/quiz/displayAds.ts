import type { GoogleTag, GptEvent, GptSlot } from "./gpt.ts";

export const DISPLAY_AD_SIZES: Array<[number, number]> = [[336, 280], [300, 250]];

export function createDisplayAd(
  tag: GoogleTag,
  element: HTMLElement,
  path: string,
  initialContent: string,
  onEmpty: (empty: boolean) => void,
) {
  let disposed = false;
  let slot: GptSlot | null = null;
  let content = initialContent;
  let requestedContent: string | undefined;
  let listener: ((event: GptEvent) => void) | undefined;

  tag.cmd.push(() => {
    if (disposed || !element.isConnected || !tag.defineSlot || !tag.pubads || !tag.display) return;
    const sizes = DISPLAY_AD_SIZES.filter(([width]) => width <= element.clientWidth);
    if (!sizes.length) { onEmpty(true); return; }
    const pubads = tag.pubads();
    slot = tag.defineSlot(path, sizes, element.id);
    if (!slot) { onEmpty(true); return; }
    slot.addService(pubads);
    slot.setConfig?.({
      adExpansion: { enabled: true },
      safeFrame: { allowOverlayExpansion: true, allowPushExpansion: true },
    });
    listener = (event) => {
      if (!disposed && event.slot === slot) onEmpty(event.isEmpty === true);
    };
    pubads.addEventListener("slotRenderEnded", listener);
    tag.enableServices?.();
    requestedContent = content;
    tag.display(element.id);
  });

  return {
    update(nextContent: string) {
      content = nextContent;
      tag.cmd.push(() => {
        if (disposed || !slot || requestedContent === content) return;
        const pubads = tag.pubads?.();
        if (!pubads?.refresh) return;
        requestedContent = content;
        pubads.refresh([slot]);
      });
    },
    destroy() {
      disposed = true;
      tag.cmd.push(() => {
        if (listener) tag.pubads?.().removeEventListener?.("slotRenderEnded", listener);
        if (slot) tag.destroySlots?.([slot]);
        slot = null;
      });
    },
  };
}
