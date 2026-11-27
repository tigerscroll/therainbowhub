"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CampaignEntryPopup, type CampaignActionTone } from "@/components/experience/CampaignEntryPopup";
import { useRewardedGate } from "@/components/experience/useRewardedGate";
import { campaignGuideBootAttribute, hasGuideCampaign, type CampaignGuideLabels } from "@/lib/campaignGuides";
import styles from "./CampaignGuideEntry.module.css";

type Entry = "initial" | "prompt" | "dismissed" | "teaser" | "full" | "direct";

export function CampaignGuideEntry({ children, guide, publicNotice, actionTone, labels }: {
  children: ReactNode;
  guide: { title: string; intro: string; campaignIntro: string; popupTitle: string; continueLabel?: string };
  publicNotice?: ReactNode;
  actionTone?: CampaignActionTone;
  labels?: CampaignGuideLabels;
}) {
  const [entry, setEntry] = useState<Entry>("initial");
  const [adUnavailable, setAdUnavailable] = useState(false);
  const { busy, runGate } = useRewardedGate({ attempts: 1 });
  const title = useRef<HTMLHeadingElement>(null);
  const reopen = useRef<HTMLButtonElement>(null);
  const fullGuide = useRef<HTMLDivElement>(null);
  const showFullGuide = entry === "initial" || entry === "direct" || entry === "full";
  const useCampaignIntro = entry === "teaser" || entry === "full";

  useLayoutEffect(() => {
    setEntry(hasGuideCampaign(window.location.search) ? "prompt" : "direct");
  }, []);

  useLayoutEffect(() => {
    if (entry !== "initial") document.documentElement.removeAttribute(campaignGuideBootAttribute);
  }, [entry]);

  useEffect(() => {
    if (entry === "dismissed") reopen.current?.focus({ preventScroll: true });
    if (entry === "teaser") title.current?.focus({ preventScroll: true });
    if (entry === "full") fullGuide.current?.focus();
  }, [entry]);

  function reveal(next: "teaser" | "full") {
    setAdUnavailable(false);
    setEntry(next);
  }

  function requestAd(next: "teaser" | "full") {
    setAdUnavailable(false);
    void runGate(() => reveal(next), { retryOnClose: false, scrollAfter: false, onUnavailable: () => setAdUnavailable(true) });
  }

  function dismiss() {
    setAdUnavailable(false);
    setEntry("dismissed");
  }

  return (
    <>
      <article className={styles.guide} aria-labelledby="campaign-guide-title" hidden={entry === "prompt"}>
        <h1 id="campaign-guide-title" ref={title} tabIndex={-1}>{guide.title}</h1>
        <p className={styles.intro}>{useCampaignIntro ? guide.campaignIntro : guide.intro}</p>
        {publicNotice}
        {entry === "dismissed" && (
          <button className={styles.primary} data-google-interstitial="false" ref={reopen} type="button" onClick={() => setEntry("prompt")}>{labels?.reopen ?? "Open Guide Popup"}</button>
        )}
        {entry === "teaser" && (
          <div className={styles.teaserActions}>
            <button
              type="button"
              className={`${styles.primary} ${styles.seeMore} ${actionTone === "red" ? styles.red : ""}`}
              aria-describedby="campaign-guide-more-note"
              data-google-interstitial="false"
              disabled={busy}
              onClick={() => requestAd("full")}
            >
              {busy ? labels?.loading ?? "Loading..." : <>{guide.continueLabel ?? "See more"} <span className={styles.arrow} aria-hidden="true">→</span></>}
            </button>
            <p className={styles.moreNote} id="campaign-guide-more-note">{labels?.readNote ?? "Watch one short ad to read the rest."}</p>
            {adUnavailable && (
              <>
                <p className={styles.moreNote} role="status">{labels?.unavailable ?? "No ad is available right now."}</p>
                <button className={styles.readWithoutAd} data-google-interstitial="false" type="button" onClick={() => reveal("full")}>{labels?.readWithoutAd ?? "Read without an ad"}</button>
              </>
            )}
          </div>
        )}
        {showFullGuide && (
          <div className={styles.fullGuide} ref={fullGuide} tabIndex={entry === "full" ? -1 : undefined} role="region" aria-label={labels?.fullGuide ?? "Full guide"}>
            {children}
          </div>
        )}
      </article>
      {(entry === "initial" || entry === "prompt") && (
        <CampaignEntryPopup
          title={guide.popupTitle}
          actionTone={actionTone}
          prerendered={entry === "initial"}
          busy={busy}
          adUnavailable={adUnavailable}
          adNote={labels?.startNote ?? "Watch a short ad to continue"}
          continueLabel={labels?.start}
          loadingLabel={labels?.startLoading}
          unavailableLabel={labels?.unavailable}
          noAdLabel={labels?.readWithoutAd}
          onStart={() => requestAd("teaser")}
          onDismiss={dismiss}
          onContinueWithoutAd={() => reveal("teaser")}
        />
      )}
    </>
  );
}
