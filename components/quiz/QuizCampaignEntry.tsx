"use client";

import { useEffect, useRef } from "react";
import styles from "./QuizCampaignEntry.module.css";

export function QuizCampaignEntry({ busy, prerendered, unavailable, onStart }: {
  busy: boolean;
  prerendered: boolean;
  unavailable: boolean;
  onStart: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!prerendered && !busy) dialog.current?.focus({ preventScroll: true });
  }, [prerendered, busy]);

  return (
    <div
      ref={dialog}
      className={styles.overlay}
      data-quiz-campaign-preview={prerendered ? "" : undefined}
      data-quiz-campaign-entry=""
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-campaign-title"
      aria-describedby="quiz-campaign-disclosure"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key !== "Tab" || busy) return;
        event.preventDefault();
        startButton.current?.focus();
      }}
    >
      <div className={styles.panel}>
        <h2 className={styles.title} id="quiz-campaign-title">Ready to Start?</h2>
        <button
          ref={startButton}
          className={`quiz-engine__primary ${styles.start}`}
          type="button"
          disabled={busy}
          data-google-interstitial="false"
          aria-describedby="quiz-campaign-disclosure"
          onClick={onStart}
        >
          {busy ? "Loading..." : "Start Test"}
          <span aria-hidden="true" className={styles.startIcon}>→</span>
        </button>
        {unavailable && <p className={styles.status} role="status">No ad is available right now. Please try again.</p>}
      </div>
      <p id="quiz-campaign-disclosure" className={styles.disclosure}>Watch a short ad to start.</p>
    </div>
  );
}
