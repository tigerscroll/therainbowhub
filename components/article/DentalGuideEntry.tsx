"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useRewardedGate } from "@/components/experience/useRewardedGate";
import { dentalEntryBootAttribute, dentalGuide, hasDentalCampaign } from "@/lib/dentalGuide";
import styles from "./DentalGuideEntry.module.css";

type Entry = "initial" | "prompt" | "dismissed" | "guide";

export function DentalGuideEntry({ children, urgentCare }: { children: ReactNode; urgentCare: ReactNode }) {
  const [entry, setEntry] = useState<Entry>("initial");
  const [adUnavailable, setAdUnavailable] = useState(false);
  const { busy, runGate } = useRewardedGate({ attempts: 1 });
  const dialog = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const reopen = useRef<HTMLButtonElement>(null);
  const didUnlock = useRef(false);

  useLayoutEffect(() => {
    setEntry(hasDentalCampaign(window.location.search) ? "prompt" : "guide");
  }, []);

  useLayoutEffect(() => {
    if (entry !== "initial") document.documentElement.removeAttribute(dentalEntryBootAttribute);
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
      <article className={styles.guide} aria-labelledby="dental-guide-title" hidden={entry === "prompt"}>
        <p className={styles.eyebrow}>A quick guide</p>
        <h1 id="dental-guide-title" ref={title} tabIndex={-1}>{dentalGuide.title}</h1>
        <p className={styles.intro}>If the cost of dental work feels out of reach, start with these steps. What’s available depends on where you live, your income and the treatment you need.</p>
        {urgentCare}
        {entry === "dismissed" ? (
          <button className={styles.primary} data-google-interstitial="false" ref={reopen} type="button" onClick={() => setEntry("prompt")}>Open Guide Popup</button>
        ) : children}
      </article>
      {(entry === "initial" || entry === "prompt") && (
        <div
          className={styles.overlay}
          data-dental-entry-preview={entry === "initial" ? "" : undefined}
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dental-entry-title"
          aria-describedby="dental-ad-note"
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
            <h2 id="dental-entry-title">Need Dental Work?</h2>
            <button className={styles.popupAction} type="button" disabled={busy} data-google-interstitial="false" aria-describedby="dental-ad-note" onClick={requestAd}>
              <span className={styles.actionFace}>{busy ? "LOADING..." : "CONTINUE"}</span>
            </button>
            {adUnavailable ? (
              <>
                <p className={styles.adNote} role="status">No ad is available right now.</p>
                <button className={styles.secondary} type="button" data-google-interstitial="false" onClick={openGuide}>Read without an ad</button>
              </>
            ) : null}
          </div>
          <p className={`${styles.adNote} ${styles.adFooter}`} id="dental-ad-note">Watch one short ad to open the guide.</p>
        </div>
      )}
    </>
  );
}
