"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./CampaignEntryPopup.module.css";

export function CampaignEntryPopup({
  title, prerendered, busy, adUnavailable, onStart, onDismiss, onContinueWithoutAd,
  adNote = "Watch one short ad to open the guide.",
  noAdLabel = "Read without an ad",
}: {
  title: string;
  prerendered: boolean;
  busy: boolean;
  adUnavailable: boolean;
  onStart: () => void;
  onDismiss: () => void;
  onContinueWithoutAd: () => void;
  adNote?: string;
  noAdLabel?: string;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const noteId = useId();

  useEffect(() => {
    if (!prerendered) dialog.current?.focus({ preventScroll: true });
  }, [prerendered]);

  return (
    <div
      className={styles.overlay}
      data-campaign-guide-preview={prerendered ? "" : undefined}
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={noteId}
      tabIndex={-1}
      onKeyDown={event => {
        if (busy) return;
        if (event.key === "Escape") {
          event.preventDefault();
          onDismiss();
        } else if (event.key === "Tab") {
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
        <h2 id={titleId}>{title}</h2>
        <button className={styles.popupAction} type="button" disabled={busy} data-google-interstitial="false" aria-describedby={noteId} onClick={onStart}>
          <span className={styles.actionFace}>{busy ? "LOADING..." : "CONTINUE"}</span>
        </button>
        {adUnavailable ? (
          <>
            <p className={styles.adNote} role="status">No ad is available right now.</p>
            <button className={styles.secondary} type="button" data-google-interstitial="false" onClick={onContinueWithoutAd}>{noAdLabel}</button>
          </>
        ) : null}
      </div>
      <p className={`${styles.adNote} ${styles.adFooter}`} id={noteId}>{adNote}</p>
    </div>
  );
}
