"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
  const dialog = useRef<HTMLDivElement>(null);
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
    if (entry === "prompt") dialog.current?.focus({ preventScroll: true });
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
        <div
          className={styles.overlay}
          data-campaign-guide-preview={entry === "initial" ? "" : undefined}
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="campaign-guide-entry-title"
          aria-describedby="campaign-guide-ad-note"
          tabIndex={-1}
          onKeyDown={event => {
            if (busy) return;
            if (event.key === "Escape") dismiss();
            if (event.key === "Tab") {
              const choices = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled),a[href]"));
              const first = choices[0];
              const last = choices.at(-1);
              if (event.target === event.currentTarget || (event.shiftKey ? event.target === first : event.target === last)) {
                event.preventDefault();
                (event.shiftKey ? last : first)?.focus();
              }
            }
          }}
        >
          <div className={styles.popup}>
            <h2 id="campaign-guide-entry-title">{guide.popupTitle}</h2>
            <button className={styles.popupAction} type="button" disabled={busy} data-google-interstitial="false" aria-describedby="campaign-guide-ad-note" onClick={requestAd}>
              <span className={styles.actionFace}>{busy ? "LOADING..." : "CONTINUE"}</span>
            </button>
            {adUnavailable ? (
              <>
                <p className={styles.adNote} role="status">No ad is available right now.</p>
                <button className={styles.secondary} type="button" data-google-interstitial="false" onClick={openGuide}>Read without an ad</button>
              </>
            ) : null}
          </div>
          <p className={`${styles.adNote} ${styles.adFooter}`} id="campaign-guide-ad-note">Watch one short ad to open the guide.</p>
        </div>
      )}
    </>
  );
}
