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
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const focusAfterUnlock = useRef(false);
  const { busy, runGate } = useRewardedGate({ attempts: 1 });
  const photo = progress ? photos[progress.index] : null;
  const nextNeedsAd = Boolean(progress && progress.views >= adInterval);

  useEffect(() => {
    // Keep the first server and client renders identical. Campaign visits
    // must never briefly display the first photo before the gate is known.
    if (!new URLSearchParams(window.location.search).has("utm_source")) {
      setProgress({ index: 0, views: 1 });
    }
    setReady(true);
  }, []);

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
          <div className={styles.entry}>
            <p>{photos.length} photos</p>
            <button
              type="button"
              className={styles.primary}
              disabled={busy}
              aria-describedby="sports-entry-disclosure"
              onClick={() => openWithAd({ index: 0, views: 1 }, true)}
            >
              {busy ? "Loading…" : "Open Photo Gallery"} <span aria-hidden="true">→</span>
            </button>
            <p id="sports-entry-disclosure">Watch a short ad to open the gallery.</p>
          </div>
        )}
        {adError && <p className={styles.note} role="status">No ad is available right now. Please try again shortly.</p>}
      </section>
      <noscript><p>Enable JavaScript to browse, or <a href={content.source}>view the original gallery</a>.</p></noscript>
    </article>
  );
}
