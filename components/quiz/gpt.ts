export type GptSlot = {
  addService(service: unknown): GptSlot;
  setConfig?: (config: {
    adExpansion?: { enabled: boolean };
    safeFrame?: { allowOverlayExpansion: boolean; allowPushExpansion: boolean };
  }) => void;
};

export type GptEvent = {
  slot: GptSlot;
  makeRewardedVisible?: () => void;
  isEmpty?: boolean;
};

export type PubAds = {
  addEventListener(name: string, listener: (event: GptEvent) => void): void;
  removeEventListener?: (name: string, listener: (event: GptEvent) => void) => void;
  refresh?: (slots: GptSlot[], options?: { changeCorrelator: boolean }) => void;
  updateCorrelator?: () => void;
};

export type GoogleTag = {
  cmd: { push(command: () => void): unknown };
  defineSlot?: (path: string, sizes: Array<[number, number] | "fluid">, elementId: string) => GptSlot | null;
  defineOutOfPageSlot?: (path: string, format: unknown) => GptSlot | null;
  destroySlots?: (slots: GptSlot[]) => void;
  display?: (slotOrElementId: GptSlot | string) => void;
  enableServices?: () => void;
  enums?: { OutOfPageFormat?: { REWARDED?: unknown } };
  pubads?: () => PubAds;
  pubadsReady?: boolean;
};

declare global {
  interface Window {
    googletag?: GoogleTag;
  }
}
