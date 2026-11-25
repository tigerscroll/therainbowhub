"use client";

import { useEffect, useRef, useState } from "react";
import { useRewardedGate } from "@/components/experience/useRewardedGate";
import styles from "./SportsPhotoGallery.module.css";

type Photo = {
  src: string;
  alt: string;
  title: string;
  credit: string;
  originalTitle: string;
  source: string;
  license: string;
  licenseUrl: string;
};

type Progress = { index: number; views: number };
const adInterval = 5;

export function SportsPhotoGallery({
  photos,
  content,
}: {
  photos: readonly Photo[];
  content: { title: string; description: string; source: string };
}) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [ready, setReady] = useState(false);
  const [adError, setAdError] = useState(false);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const reopenButton = useRef<HTMLButtonElement>(null);
  const focusAfterUnlock = useRef(false);
  const { busy, runGate } = useRewardedGate({ attempts: 1 });
  const photo = progress ? photos[progress.index] : null;
  const nextNeedsAd = Boolean(progress && progress.views >= adInterval);
  const showPlayer = ready && !progress && !dismissed;

  useEffect(() => {
    // Keep the first server and client renders identical. Campaign visits
    // must never briefly display the first photo before the gate is known.
    const params = new URLSearchParams(window.location.search);
    if (![...params.keys()].some(key => /^utm_.+/i.test(key))) {
      setProgress({ index: 0, views: 1 });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (showPlayer) continueButton.current?.focus({ preventScroll: true });
    else if (dismissed) reopenButton.current?.focus({ preventScroll: true });
  }, [showPlayer, dismissed]);

  useEffect(() => {
    if (!photo || !focusAfterUnlock.current) return;
    focusAfterUnlock.current = false;
    nextButton.current?.focus({ preventScroll: true });
  }, [photo]);

  function show(next: Progress) {
    setFailedPhoto(null);
    setAdError(false);
    setProgress(next);
  }

  function openWithAd(next: Progress, initial = false) {
    if (busy) return;
    setAdError(false);
    void runGate(() => {
      if (initial) focusAfterUnlock.current = true;
      show(next);
    }, { retryOnClose: false, scrollAfter: false, onUnavailable: () => setAdError(true) });
  }

  function navigate(direction: -1 | 1) {
    if (!progress || busy) return;
    const index = (progress.index + direction + photos.length) % photos.length;
    if (direction === 1 && nextNeedsAd) openWithAd({ index, views: 1 });
    else show({ index, views: progress.views + 1 });
  }

  return (
    <article className={styles.page} aria-labelledby="sports-gallery-title">
      <header className={styles.heading}>
        <h1 id="sports-gallery-title">{content.title}</h1>
        <p>{content.description}</p>
      </header>
      <section
        aria-label="Sports photo gallery"
        className={styles.card}
        onKeyDown={(event) => {
          if (!progress || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          navigate(event.key === "ArrowRight" ? 1 : -1);
        }}
      >
        {!ready ? (
          <p className={styles.entry} role="status">Loading photos…</p>
        ) : photo && progress ? (
          <>
            <figure className={styles.figure}>
              <div
                className={styles.frame}
                onTouchStart={(event) => {
                  const touch = event.changedTouches[0];
                  touchStart.current = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : null;
                }}
                onTouchCancel={() => { touchStart.current = null; }}
                onTouchEnd={(event) => {
                  const start = touchStart.current;
                  touchStart.current = null;
                  const touch = event.changedTouches[0];
                  if (!start || !touch) return;
                  const x = touch.clientX - start.x;
                  if (Math.abs(x) >= 45 && Math.abs(x) > Math.abs(touch.clientY - start.y)) navigate(x < 0 ? 1 : -1);
                }}
              >
                {failedPhoto === photo.src ? (
                  <p role="status">This photo couldn’t load. Try the next one or open the original below.</p>
                ) : (
                  <img key={photo.src} src={photo.src} alt={photo.alt} decoding="async" onError={() => setFailedPhoto(photo.src)} />
                )}
              </div>
              <figcaption className={styles.caption}>
                <div aria-live="polite">
                  <p className={styles.position}>Photo {progress.index + 1} of {photos.length}</p>
                  <h2>{photo.title}</h2>
                </div>
                <p>{photo.credit}</p>
                <div className={styles.credits}>
                  <a href={photo.source} title={photo.originalTitle} target="_blank" rel="noopener noreferrer">Original photo</a>
                  <a href={photo.licenseUrl || photo.source} target="_blank" rel="noopener noreferrer">{photo.license}</a>
                </div>
              </figcaption>
            </figure>
            <nav className={styles.controls} aria-label="Photo navigation">
              <button type="button" onClick={() => navigate(-1)} disabled={busy}>
                <span aria-hidden="true">←</span> Previous photo
              </button>
              <button
                type="button"
                ref={nextButton}
                className={styles.primary}
                onClick={() => navigate(1)}
                disabled={busy}
                aria-describedby={nextNeedsAd ? "sports-next-disclosure" : undefined}
              >
                {busy ? "Loading…" : "Next photo"} <span aria-hidden="true">→</span>
              </button>
            </nav>
            {nextNeedsAd && <p id="sports-next-disclosure" className={styles.note}>Watch a short ad to see the next photo.</p>}
          </>
        ) : (
          <>
            <div className={styles.entry} inert={showPlayer}>
              <p>{photos.length} perfectly timed sports photos</p>
              {dismissed && <button ref={reopenButton} className={styles.primary} type="button" onClick={() => setDismissed(false)}>Open player</button>}
            </div>
            {showPlayer && <div
              className={styles.overlay}
              role="dialog"
              aria-modal="true"
              aria-label="See Content"
              aria-describedby="sports-entry-disclosure"
              onKeyDown={(event) => {
                if (event.key === "Escape" && !busy) {
                  event.preventDefault();
                  setDismissed(true);
                  return;
                }
                if (event.key !== "Tab") return;
                const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                if (!first || !last) return;
                if (event.shiftKey && document.activeElement === first) {
                  event.preventDefault();
                  last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                  event.preventDefault();
                  first.focus();
                }
              }}
            >
              <div className={styles.player}>
                <button
                  ref={continueButton}
                  type="button"
                  className={styles.playerSurface}
                  disabled={busy}
                  aria-labelledby="sports-player-action"
                  aria-describedby="sports-entry-disclosure"
                  onClick={() => openWithAd({ index: 0, views: 1 }, true)}
                >
                  <span className={styles.stage}>
                    <span className={styles.playerHeading}>See Content</span>
                    <span id="sports-player-action" className={styles.continue}>{busy ? "Loading ad…" : "Continue"}</span>
                  </span>
                  <span className={styles.playerControls} aria-hidden="true">
                    <span className={styles.track} />
                    <span className={styles.playerActions}>
                      <svg className={styles.playGlyph} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3 21 12 5 21Z" /></svg>
                      <svg className={styles.playerGlyph} viewBox="0 0 24 24"><path d="m11 5-6 4H2v6h3l6 4V5Z M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></svg>
                      <svg className={`${styles.playerGlyph} ${styles.captionsGlyph}`} viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 9H8v6h2m8-6h-2v6h2" /></svg>
                      <svg className={styles.playerGlyph} viewBox="0 0 24 24"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg>
                    </span>
                  </span>
                  <span id="sports-entry-disclosure" className={styles.playerDisclosure}>Watch a short ad to continue.</span>
                </button>
                {adError && <p className={styles.playerNote} role="status">No ad is available right now. Please try again shortly.</p>}
              </div>
            </div>}
          </>
        )}
        {adError && photo && <p className={styles.note} role="status">No ad is available right now. Please try again shortly.</p>}
      </section>
      <noscript><p>Enable JavaScript to browse, or <a href={content.source}>view the original gallery</a>.</p></noscript>
    </article>
  );
}
