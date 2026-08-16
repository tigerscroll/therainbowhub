"use client";

import { useEffect, useRef, useState } from "react";

import type { GptEvent, GptSlot, PubAds } from "./rewardedAds";

const DISPLAY_ELEMENT_ID = "quiz-display-ad";

type DisplayState = "loading" | "filled" | "empty";

export function DisplayAd({ adUnitPath, questionKey }: { adUnitPath: string; questionKey: string }) {
  const [displayState, setDisplayState] = useState<DisplayState>("loading");
  const previousQuestion = useRef(questionKey);
  const slotRef = useRef<GptSlot | null>(null);
  const pubadsRef = useRef<PubAds | null>(null);
  const renderListenerRef = useRef<((event: GptEvent) => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    window.googletag = window.googletag ?? { cmd: [] };
    window.googletag.cmd.push(() => {
      if (cancelled) return;
      const googletag = window.googletag;
      const pubads = googletag?.pubads?.();
      if (!googletag?.defineSlot || !googletag.display || !pubads) {
        setDisplayState("empty");
        return;
      }

      const slot = googletag.defineSlot(adUnitPath, [300, 250], DISPLAY_ELEMENT_ID);
      if (!slot) {
        setDisplayState("empty");
        return;
      }

      const onRender = (event: GptEvent) => {
        if (event.slot !== slot || cancelled) return;
        setDisplayState(event.isEmpty ? "empty" : "filled");
      };
      slotRef.current = slot;
      pubadsRef.current = pubads;
      renderListenerRef.current = onRender;
      pubads.addEventListener("slotRenderEnded", onRender);
      slot.addService(pubads);
      googletag.enableServices?.();
      googletag.display(DISPLAY_ELEMENT_ID);
    });

    return () => {
      cancelled = true;
      const listener = renderListenerRef.current;
      if (listener) pubadsRef.current?.removeEventListener?.("slotRenderEnded", listener);
      if (slotRef.current) {
        try { window.googletag?.destroySlots?.([slotRef.current]); } catch { /* GPT cleanup is best effort. */ }
      }
      slotRef.current = null;
      pubadsRef.current = null;
      renderListenerRef.current = null;
    };
  }, [adUnitPath]);

  useEffect(() => {
    if (previousQuestion.current === questionKey) return;
    previousQuestion.current = questionKey;
    setDisplayState("loading");
    let animationFrame = 0;
    let checks = 0;
    let cancelled = false;

    const refreshAfterScroll = () => {
      if (cancelled) return;
      checks += 1;
      if (window.scrollY <= 4 || checks >= 12) {
        window.googletag?.cmd.push(() => {
          if (cancelled || !slotRef.current) return;
          window.googletag?.pubads?.().refresh?.([slotRef.current], { changeCorrelator: true });
        });
        return;
      }
      animationFrame = window.requestAnimationFrame(refreshAfterScroll);
    };

    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = window.requestAnimationFrame(refreshAfterScroll);
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
    };
  }, [questionKey]);

  return (
    <aside
      aria-hidden={displayState === "empty" || undefined}
      aria-label="Advertisement"
      className="quiz-engine__display-ad"
      data-state={displayState}
    >
      <span>Advertisement</span>
      <div className="quiz-engine__display-ad-slot" id={DISPLAY_ELEMENT_ID} />
    </aside>
  );
}
