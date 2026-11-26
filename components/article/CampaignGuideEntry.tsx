"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CampaignEntryPopup } from "@/components/experience/CampaignEntryPopup";
import { useRewardedGate } from "@/components/experience/useRewardedGate";
import { campaignGuideBootAttribute, hasGuideCampaign } from "@/lib/campaignGuides";
import styles from "./CampaignGuideEntry.module.css";

type Entry = "initial" | "prompt" | "dismissed" | "guide";

export function CampaignGuideEntry({ children, guide, publicNotice }: {
  children: ReactNode;
  guide: { title: string; intro: string; popupTitle: string };
  publicNotice?: ReactNode;
}) {
  const [entry, setEntry] = useState<Entry>("initial");
  const [adUnavailable, setAdUnavailable] = useState(false);
  const { busy, runGate } = useRewardedGate({ attempts: 1 });
  const title = useRef<HTMLHeadingElement>(null);
  const reopen = useRef<HTMLButtonElement>(null);
  const didUnlock = useRef(false);

  useLayoutEffect(() => {
    setEntry(hasGuideCampaign(window.location.search) ? "prompt" : "guide");
  }, []);

  useLayoutEffect(() => {
    if (entry !== "initial") document.documentElement.removeAttribute(campaignGuideBootAttribute);
  }, [entry]);

  useEffect(() => {
    if (entry === "dismissed") reopen.current?.focus({ preventScroll: true });
    if (entry === "guide" && didUnlock.current) title.current?.focus({ preventScroll: true });
  }, [entry]);

  function openGuide() {
    didUnlock.current = true;
    setEntry("guide");
  }

  function requestAd() {
    setAdUnavailable(false);
    void runGate(openGuide, { retryOnClose: false, scrollAfter: false, onUnavailable: () => setAdUnavailable(true) });
  }

  function dismiss() {
    setAdUnavailable(false);
    setEntry("dismissed");
  }

  return (
    <>
      <article className={styles.guide} aria-labelledby="campaign-guide-title" hidden={entry === "prompt"}>
        <p className={styles.eyebrow}>A quick guide</p>
        <h1 id="campaign-guide-title" ref={title} tabIndex={-1}>{guide.title}</h1>
        <p className={styles.intro}>{guide.intro}</p>
        {publicNotice}
        {entry === "dismissed" ? (
          <button className={styles.primary} data-google-interstitial="false" ref={reopen} type="button" onClick={() => setEntry("prompt")}>Open Guide Popup</button>
        ) : children}
      </article>
      {(entry === "initial" || entry === "prompt") && (
        <CampaignEntryPopup
          title={guide.popupTitle}
          prerendered={entry === "initial"}
          busy={busy}
          adUnavailable={adUnavailable}
          onStart={requestAd}
          onDismiss={dismiss}
          onContinueWithoutAd={openGuide}
        />
      )}
    </>
  );
}
