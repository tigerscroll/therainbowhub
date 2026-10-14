"use client";

import { useCallback, useEffect, useState } from "react";

import { ExperienceLanding } from "@/components/experience/ExperienceLanding";
import { signalSpaNavigation } from "@/components/experience/spaNavigation";
import { useRewardedGate } from "@/components/experience/useRewardedGate";
import { mountQuizInterstitial } from "@/components/quiz/interstitialAds";
import type { GalleryManifest } from "@/lib/galleries";
import { siteConfig } from "@/lib/siteConfig";

type GalleryPhase = "complete" | "gallery" | "landing";
const unlockKey = "rainbowhub:gallery-unlock:v1:art";

function getDestination(path: string, story: number | "complete") {
  const destination = new URL(path, window.location.href);
  const current = new URL(window.location.href);
  current.searchParams.forEach((value, key) => {
    if (key !== "story" && !destination.searchParams.has(key)) destination.searchParams.append(key, value);
  });
  destination.searchParams.set("story", String(story));
  return destination;
}

function getStateFromUrl(itemCount: number): { index: number; phase: GalleryPhase } {
  const story = new URL(window.location.href).searchParams.get("story");
  if (story === "complete") return { index: itemCount - 1, phase: "complete" };
  const value = Number(story);
  return Number.isInteger(value) && value >= 1 && value <= itemCount
    ? { index: value - 1, phase: "gallery" }
    : { index: 0, phase: "gallery" };
}

export function GalleryExperience({ gallery, path }: { gallery: GalleryManifest; path: string }) {
  const [phase, setPhase] = useState<GalleryPhase>("landing");
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const { busy, runGate } = useRewardedGate({ attempts: 3, preload: true });

  const restoreFromUrl = useCallback(() => {
    let unlocked = false;
    try { unlocked = window.sessionStorage.getItem(unlockKey) === "1"; } catch { /* Keep the rewarded entry gate. */ }
    if (!unlocked) {
      setPhase("landing");
      return;
    }
    const nextState = getStateFromUrl(gallery.items.length);
    setIndex(nextState.index);
    setPhase(nextState.phase);
  }, [gallery.items.length]);

  useEffect(() => {
    setHydrated(true);
    restoreFromUrl();
    window.addEventListener("popstate", restoreFromUrl);
    return () => window.removeEventListener("popstate", restoreFromUrl);
  }, [restoreFromUrl]);

  const interstitialActive = hydrated && phase !== "landing";
  useEffect(() => {
    if (!interstitialActive) return;
    return mountQuizInterstitial(siteConfig.displayAdUnitPath);
  }, [interstitialActive]);

  function moveTo(story: number | "complete", signalInterstitial: boolean) {
    const destination = getDestination(path, story);
    window.history.pushState(null, "", destination);
    if (story === "complete") {
      setPhase("complete");
    } else {
      setIndex(story - 1);
      setPhase("gallery");
    }
    if (signalInterstitial) signalSpaNavigation();
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function start() {
    void runGate(() => {
      try { window.sessionStorage.setItem(unlockKey, "1"); } catch { /* The current session still opens. */ }
      moveTo(1, false);
    }, { scrollAfter: false });
  }

  if (phase === "landing") {
    return (
      <ExperienceLanding
        adNote={gallery.landing.adNote}
        avatars={[]}
        busy={busy}
        busyLabel="Opening gallery…"
        className="gallery-article__landing"
        ctaIcon="→"
        ctaIconPosition="end"
        ctaLabel={gallery.landing.cta}
        icon={null}
        intro={gallery.landing.intro}
        onStart={start}
        showSocialProof={false}
        socialProofText=""
        title={gallery.landing.title}
      />
    );
  }

  if (phase === "complete") {
    return (
      <section className="gallery-article__complete quiz-engine__continuous-shell">
        <span>{gallery.gallery.completeEyebrow}</span>
        <div aria-hidden="true" className="gallery-article__seal">85</div>
        <h1>{gallery.gallery.completeTitle}</h1>
        <p>{gallery.gallery.completeCopy}</p>
        <button className="gallery-article__primary" data-google-interstitial="false" onClick={() => moveTo(1, false)} type="button">
          {gallery.gallery.restartLabel}
        </button>
      </section>
    );
  }

  const item = gallery.items[index];
  const nextStory = index + 1 < gallery.items.length ? index + 2 : "complete";
  const nextHref = getDestination(path, nextStory).toString();
  return (
    <article aria-labelledby="gallery-story-title" className="gallery-article__story quiz-engine__continuous-shell" key={item.id}>
      <div className="gallery-article__archive-card">
        <small>CONTROVERSY FILE</small>
        <b>{String(item.number).padStart(2, "0")}</b>
        <span>ARCHIVE UNSEALED</span>
      </div>

      <div className="gallery-article__copy">
        <h1 id="gallery-story-title">{item.title}</h1>
        {item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>

      <nav aria-label="Gallery navigation" className="gallery-article__navigation">
        <a
          className="gallery-article__primary"
          data-google-interstitial="true"
          href={nextHref}
          onClick={(event) => {
            event.preventDefault();
            moveTo(nextStory, true);
          }}
        >
          {nextStory === "complete" ? gallery.gallery.finishLabel : gallery.gallery.nextLabel} <span aria-hidden="true">→</span>
        </a>
      </nav>
    </article>
  );
}
