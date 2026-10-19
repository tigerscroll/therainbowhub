"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { ExperienceLanding } from "@/components/experience/ExperienceLanding";
import { signalSpaNavigation } from "@/components/experience/spaNavigation";
import { useRewardedGate } from "@/components/experience/useRewardedGate";
import { getArticlePopupBootstrapScript, shouldShowArticlePopup } from "@/components/gallery/galleryPopup";
import { mountQuizInterstitial } from "@/components/quiz/interstitialAds";
import type { GalleryManifest } from "@/lib/galleries";
import { siteConfig } from "@/lib/siteConfig";

type GalleryPhase = "complete" | "gallery" | "introduction" | "landing";
type GalleryDestination = number | "complete" | "intro";

function getDestination(path: string, story: GalleryDestination) {
  const destination = new URL(path, window.location.href);
  const current = new URL(window.location.href);
  current.searchParams.forEach((value, key) => {
    if (key !== "story" && !destination.searchParams.has(key)) destination.searchParams.append(key, value);
  });
  destination.searchParams.set("story", String(story));
  return destination;
}

function getStateFromUrl(itemCount: number, articleFlow: boolean): { index: number; phase: GalleryPhase } {
  const story = new URL(window.location.href).searchParams.get("story");
  if (story === "complete") return { index: itemCount - 1, phase: "complete" };
  if (articleFlow && (story === null || story === "intro")) return { index: 0, phase: "introduction" };
  const value = Number(story);
  return Number.isInteger(value) && value >= 1 && value <= itemCount
    ? { index: articleFlow ? 0 : value - 1, phase: "gallery" }
    : { index: 0, phase: articleFlow ? "introduction" : "gallery" };
}

export function GalleryExperience({ gallery, loadingLabel, path }: { gallery: GalleryManifest; loadingLabel: string; path: string }) {
  const articleFlow = gallery.gallery.flow === "article";
  const overlayEntry = gallery.landing.presentation === "overlay";
  // The parser-time bootstrap selects the visible entry before React hydrates.
  const [phase, setPhase] = useState<GalleryPhase>(articleFlow && overlayEntry ? "introduction" : "landing");
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const { busy, runGate } = useRewardedGate({ attempts: 3 });
  const unlockKey = `rainbowhub:gallery-unlock:v1:${gallery.slug}`;
  const articleUnlockKey = `rainbowhub:article-unlock:v1:${gallery.slug}`;

  const restoreFromUrl = useCallback(() => {
    let unlocked = overlayEntry && !shouldShowArticlePopup(window.location.search);
    if (!unlocked) {
      try { unlocked = window.sessionStorage.getItem(unlockKey) === "1"; } catch { /* Keep the rewarded entry gate. */ }
    }
    if (!unlocked) {
      setPhase("landing");
      return;
    }
    const nextState = getStateFromUrl(gallery.items.length, articleFlow);
    if (articleFlow && nextState.phase === "gallery") {
      let articleUnlocked = false;
      try { articleUnlocked = window.sessionStorage.getItem(articleUnlockKey) === "1"; } catch { /* Keep the article reward gate. */ }
      if (!articleUnlocked) {
        setIndex(0);
        setPhase("introduction");
        return;
      }
    }
    setIndex(nextState.index);
    setPhase(nextState.phase);
  }, [articleFlow, articleUnlockKey, gallery.items.length, overlayEntry, unlockKey]);

  useLayoutEffect(() => {
    setHydrated(true);
    restoreFromUrl();
    window.addEventListener("popstate", restoreFromUrl);
    return () => window.removeEventListener("popstate", restoreFromUrl);
  }, [restoreFromUrl]);

  useLayoutEffect(() => {
    if (phase !== "landing" || gallery.landing.presentation !== "overlay") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [gallery.landing.presentation, phase]);

  const interstitialActive = hydrated && phase !== "landing" && !articleFlow;
  useEffect(() => {
    if (!interstitialActive) return;
    return mountQuizInterstitial(siteConfig.displayAdUnitPath);
  }, [interstitialActive]);

  function moveTo(story: GalleryDestination, signalInterstitial: boolean) {
    const destination = getDestination(path, story);
    window.history.pushState(null, "", destination);
    if (story === "complete") {
      setPhase("complete");
    } else if (story === "intro") {
      setIndex(0);
      setPhase("introduction");
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
      moveTo(articleFlow ? "intro" : 1, false);
    }, { scrollAfter: false });
  }

  function continueArticle() {
    void runGate(() => {
      try { window.sessionStorage.setItem(articleUnlockKey, "1"); } catch { /* The current session still opens. */ }
      moveTo(1, false);
    }, { scrollAfter: false });
  }

  function renderLanding() {
    const landingTitle = gallery.landing.presentation === "overlay"
      ? gallery.landing.popupTitle ?? gallery.landing.title
      : gallery.landing.title;
    const landingClassName = [
      "gallery-article__landing",
      landingTitle.length > 58 ? "gallery-article__landing--long-title" : "",
      gallery.landing.ctaTone === "positive" || gallery.slug === "perfectly-timed" ? "gallery-article__landing--positive-cta" : "",
    ].filter(Boolean).join(" ");
    const landing = (
      <ExperienceLanding
        adNote={gallery.landing.adNote}
        avatars={[]}
        busy={busy}
        busyLabel={loadingLabel}
        className={landingClassName}
        ctaIcon="→"
        ctaIconPosition="end"
        ctaLabel={gallery.landing.cta}
        icon={null}
        intro={gallery.landing.intro}
        onStart={start}
        showSocialProof={false}
        socialProofText=""
        title={landingTitle}
      />
    );

    if (gallery.landing.presentation === "overlay") {
      const preview = gallery.items[0];
      return (
        <div className="gallery-article__overlay-scene">
          <article aria-hidden="true" className="gallery-article__story gallery-article__story--preview quiz-engine__continuous-shell">
            <div className="gallery-article__copy">
              <h1>{articleFlow ? gallery.landing.title : preview.title}</h1>
              {articleFlow
                ? gallery.gallery.introduction.map(paragraph => <p key={paragraph}>{paragraph}</p>)
                : null}
              {!articleFlow && preview.image ? (
                <figure className="gallery-article__image">
                  <img alt="" decoding="async" src={preview.image.src} />
                </figure>
              ) : null}
              {!articleFlow ? preview.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>) : null}
            </div>
          </article>
          <div
            aria-label={landingTitle}
            aria-modal="true"
            className="gallery-article__overlay-scrim"
            role="dialog"
          >
            {landing}
          </div>
        </div>
      );
    }

    return (
      landing
    );
  }

  function renderIntroduction() {
    return (
      <article className="gallery-article__introduction quiz-engine__continuous-shell">
        <header className="gallery-article__article-header">
          {gallery.landing.eyebrow ? <span>{gallery.landing.eyebrow}</span> : null}
          <h1>{gallery.landing.title}</h1>
        </header>
        <div className="gallery-article__prose">
          {gallery.gallery.introduction.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <button
          className="gallery-article__continue"
          data-google-interstitial="false"
          disabled={busy || !hydrated}
          onClick={continueArticle}
          type="button"
        >
          {busy ? loadingLabel : (gallery.gallery.continueLabel ?? "Continue Reading")} <span aria-hidden="true">→</span>
        </button>
      </article>
    );
  }

  if (!hydrated && overlayEntry) {
    return (
      <div className="gallery-article__entry-preview" data-gallery-entry="intro" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{ __html: getArticlePopupBootstrapScript(unlockKey) }}
          suppressHydrationWarning
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        />
        <div className="gallery-article__entry-popup">{renderLanding()}</div>
        <div className="gallery-article__entry-introduction">{articleFlow ? renderIntroduction() : renderGalleryStory()}</div>
      </div>
    );
  }

  if (phase === "landing") return renderLanding();
  if (phase === "introduction") return renderIntroduction();

  if (phase === "complete") {
    return (
      <section className="gallery-article__complete quiz-engine__continuous-shell">
        <span>{gallery.gallery.completeEyebrow}</span>
        <div aria-hidden="true" className="gallery-article__seal">{gallery.items.length}</div>
        <h1>{gallery.gallery.completeTitle}</h1>
        <p>{gallery.gallery.completeCopy}</p>
        <button className="gallery-article__primary" data-google-interstitial="false" onClick={() => moveTo(1, false)} type="button">
          {gallery.gallery.restartLabel}
        </button>
      </section>
    );
  }

  if (articleFlow) {
    return (
      <article className="gallery-article__article quiz-engine__continuous-shell">
        <div className="gallery-article__article-sections">
          {gallery.items.map(item => (
            <section className="gallery-article__section" id={item.id} key={item.id}>
              <h2>{item.title}</h2>
              {item.image ? (
                <figure className="gallery-article__image">
                  <img alt={item.image.alt} decoding="async" loading="lazy" src={item.image.src} />
                </figure>
              ) : null}
              {item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
          {gallery.gallery.sources ? (
            <section className="gallery-article__section gallery-article__sources" aria-labelledby="gallery-sources-title">
              <h2 id="gallery-sources-title">{gallery.gallery.sources.title}</h2>
              <ul>
                {gallery.gallery.sources.links.map(link => (
                  <li key={link.url}>
                    <a data-google-interstitial="false" href={link.url} rel="noopener noreferrer" target="_blank">{link.title}</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
    );
  }

  return renderGalleryStory();

  function renderGalleryStory() {
    const item = gallery.items[index];
    const nextStory = index + 1 < gallery.items.length ? index + 2 : "complete";
    const nextHref = hydrated ? getDestination(path, nextStory).toString() : `${path}?story=${nextStory}`;
    return (
      <article aria-labelledby="gallery-story-title" className="gallery-article__story quiz-engine__continuous-shell" key={item.id}>
        <div className="gallery-article__archive-card">
          <small>{gallery.gallery.cardEyebrow}</small>
          <b>{String(item.number).padStart(2, "0")}</b>
          <span>{gallery.gallery.cardFooter}</span>
        </div>

        <div className="gallery-article__copy">
          <h1 id="gallery-story-title">{item.title}</h1>
          {item.image ? (
            <figure className="gallery-article__image">
              <img
                alt={item.image.alt}
                decoding="async"
                loading={index === 0 ? "eager" : "lazy"}
                src={item.image.src}
              />
            </figure>
          ) : null}
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
}
