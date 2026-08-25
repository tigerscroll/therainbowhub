"use client";

import { useEffect, useRef, useState } from "react";

import { mountDisplayAd, requestRewardedAd } from "@/components/quiz/rewardedAds";
import { siteConfig } from "@/lib/siteConfig";

export type ArticlePoint = {
  title: string;
  paragraphs: string[];
};

export type ArticleSource = {
  label: string;
  url: string;
};

type ArticleExperienceProps = {
  articleTitle: string;
  avatars: string[];
  ctaLabel: string;
  icon: string;
  intro: string;
  landingTitle: string;
  points: ArticlePoint[];
  sources: ArticleSource[];
};

function ArticleDisplayAd({ position }: { position: number }) {
  const elementId = `prostate-article-ad-${position}`;

  useEffect(() => {
    const controller = mountDisplayAd({
      adUnitPath: "/22677279144/display",
      elementId,
      sizes: [[336, 280], [300, 250]],
    });
    return () => controller.destroy();
  }, [elementId]);

  return (
    <aside aria-label="Advertisement" className="article-engine__ad" data-display-ad>
      <div id={elementId} />
    </aside>
  );
}

export function ArticleExperience({
  articleTitle,
  avatars,
  ctaLabel,
  icon,
  intro,
  landingTitle,
  points,
  sources,
}: ArticleExperienceProps) {
  const adRequestActive = useRef(false);
  const adRequestController = useRef<AbortController | null>(null);
  const [adBusy, setAdBusy] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => () => adRequestController.current?.abort(), []);

  function openArticle() {
    setStarted(true);
    window.requestAnimationFrame(() => window.scrollTo({ behavior: "smooth", top: 0 }));
  }

  async function showArticle() {
    if (adRequestActive.current) return;
    const controller = new AbortController();
    adRequestController.current = controller;
    adRequestActive.current = true;
    setAdBusy(true);

    try {
      const outcome = await requestRewardedAd({
        adUnitPath: siteConfig.rewardedAdUnitPath,
        attempts: 3,
        signal: controller.signal,
      });
      if (outcome !== "closed") openArticle();
    } finally {
      adRequestController.current = null;
      adRequestActive.current = false;
      setAdBusy(false);
    }
  }

  if (!started) {
    return (
      <section className="article-engine__landing quiz-engine__landing">
        <div className="quiz-engine__landing-copy">
          <div aria-hidden="true" className="quiz-engine__landing-badge"><span>{icon}</span></div>
          <h1>{landingTitle}</h1>
          <p className="quiz-engine__quick-start">{intro}</p>
          <div className="quiz-engine__social">
            <div aria-hidden="true" className="quiz-engine__avatars">
              {avatars.map((avatar, index) => (
                <span key={index} style={{ backgroundImage: `url(${avatar})` }} />
              ))}
            </div>
            <div className="quiz-engine__social-text"><strong>125,000+</strong><span> read this today</span></div>
          </div>
          <button className="quiz-engine__primary" disabled={adBusy} onClick={showArticle} type="button">
            <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
            {adBusy ? "Loading ad…" : ctaLabel}
          </button>
          <p className="quiz-engine__ad-note"><span>✓</span>One short ad, then see the warning signs.</p>
        </div>
      </section>
    );
  }

  return (
    <article className="article-engine__article quiz-engine__continuous-shell">
      <header className="article-engine__header">
        <h1>{articleTitle}</h1>
        <p>
          Early prostate cancer often causes no symptoms. When changes do appear, they can overlap with
          common non-cancerous conditions, so symptoms alone cannot tell you the cause.
        </p>
      </header>

      <ArticleDisplayAd position={1} />

      <div className="article-engine__points">
        {points.map((point, index) => (
          <section className="article-engine__point" key={point.title}>
            <span aria-hidden="true" className="article-engine__number">{index + 1}</span>
            <div>
              <h2>{point.title}</h2>
              {point.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {(index + 1) % 2 === 0 ? <ArticleDisplayAd position={(index + 1) / 2 + 1} /> : null}
          </section>
        ))}
      </div>

      <section className="article-engine__guidance">
        <h2>When to seek medical advice</h2>
        <p>
          Arrange a medical assessment if any of these changes are new, persistent, worsening or unusual
          for you. Do not wait for symptoms to become painful. Seek urgent medical advice for sudden severe
          symptoms, new leg weakness or numbness, or loss of bladder or bowel control.
        </p>
      </section>

      <section className="article-engine__guidance">
        <h2>What a clinician may discuss</h2>
        <p>
          A healthcare professional may ask about your symptoms and medical history, examine you, test a
          urine sample or discuss a prostate-specific antigen (PSA) blood test. A PSA result cannot diagnose
          prostate cancer by itself, so further assessment may be needed.
        </p>
      </section>

      <footer className="article-engine__sources">
        <h2>Sources and further reading</h2>
        <p>This article uses symptom guidance from official health and cancer organisations.</p>
        <ul>
          {sources.map((source) => (
            <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.label}</a></li>
          ))}
        </ul>
        <p className="article-engine__disclaimer">
          General information only. This article is not a diagnosis, medical assessment or substitute for
          advice from a qualified healthcare professional.
        </p>
      </footer>
    </article>
  );
}
