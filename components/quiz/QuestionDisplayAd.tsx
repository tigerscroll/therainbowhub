"use client";

import { useEffect, useId, useRef } from "react";

type DisplaySlot = {
  addService(service: unknown): DisplaySlot;
};

type DisplayPubAds = {
  refresh?: (slots: DisplaySlot[], options?: { changeCorrelator?: boolean }) => void;
};

type DisplayGoogleTag = {
  cmd: Array<() => void>;
  defineSlot?: (path: string, size: [number, number], elementId: string) => DisplaySlot | null;
  destroySlots?: (slots: DisplaySlot[]) => void;
  display?: (elementId: string) => void;
  enableServices?: () => void;
  pubads?: () => DisplayPubAds;
};

function googleTag() {
  const target = window as unknown as { googletag?: DisplayGoogleTag };
  target.googletag = target.googletag ?? { cmd: [] };
  return target.googletag;
}

export function QuestionDisplayAd({ adUnitPath, refreshKey }: { adUnitPath: string; refreshKey: string | null }) {
  const reactId = useId();
  const elementId = `quiz-question-ad-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const slotRef = useRef<DisplaySlot | null>(null);

  useEffect(() => {
    let cancelled = false;
    const googletag = googleTag();

    googletag.cmd.push(() => {
      if (cancelled || !googletag.defineSlot || !googletag.pubads || !googletag.display) return;
      const pubads = googletag.pubads();
      const slot = googletag.defineSlot(adUnitPath, [300, 250], elementId);
      if (!slot) return;
      slotRef.current = slot;
      slot.addService(pubads);
      googletag.enableServices?.();
      googletag.display(elementId);
    });

    return () => {
      cancelled = true;
      const slot = slotRef.current;
      slotRef.current = null;
      if (!slot) return;
      googletag.cmd.push(() => {
        try { googletag.destroySlots?.([slot]); } catch { /* GPT cleanup is best effort. */ }
      });
    };
  }, [adUnitPath, elementId]);

  useEffect(() => {
    if (refreshKey === null) return;
    const googletag = googleTag();
    googletag.cmd.push(() => {
      const slot = slotRef.current;
      const pubads = googletag.pubads?.();
      if (!slot || !pubads?.refresh) return;
      pubads.refresh([slot], { changeCorrelator: true });
    });
  }, [refreshKey]);

  return (
    <div className="quiz-engine__question-ad" data-ad-size="300x250">
      <div id={elementId} />
    </div>
  );
}
