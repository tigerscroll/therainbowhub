"use client";

import { useState, type ReactNode } from "react";

import { ExperienceLanding } from "@/components/experience/ExperienceLanding";
import { useRewardedGate } from "@/components/experience/useRewardedGate";

export type ArticlePoint = {
  title: string;
  paragraphs: string[];
};

export type ArticleSource = {
  label: string;
  url: string;
};

export type ArticleSection = {
  intro: string;
  next?: {
    copy: string;
    cta: string;
    eyebrow: string;
    title: string;
  };
  points: ArticlePoint[];
  title: string;
};

type ArticleExperienceProps = {
  adNote?: string;
  avatars: string[];
  ctaLabel: string;
  disclaimer?: string;
  icon: ReactNode;
  intro: string;
  landingTitle: string;
  sections: ArticleSection[];
  socialProofCount?: string;
  socialProofLabel?: string;
  sources: ArticleSource[];
};

function ArticlePointList({ points }: { points: ArticlePoint[] }) {
  return (
    <div className="article-engine__points">
      {points.map((point, index) => (
        <section className="article-engine__point" key={point.title}>
          <span aria-hidden="true" className="article-engine__number">{index + 1}</span>
          <div>
            <h2>{point.title}</h2>
            {point.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ArticleExperience({
  adNote = "One short ad, then see the warning signs.",
  avatars,
  ctaLabel,
  disclaimer = "General information only. This article is not a diagnosis, medical assessment or substitute for advice from a qualified healthcare professional.",
  icon,
  intro,
  landingTitle,
  sections,
  socialProofCount = "125,000+",
  socialProofLabel = "read this today",
  sources,
}: ArticleExperienceProps) {
  const [started, setStarted] = useState(false);
  const [unlockedSection, setUnlockedSection] = useState(1);
  const { busy: adBusy, runGate } = useRewardedGate({ attempts: 3 });

  const resolvedSections = sections;

  function openArticle() {
    setStarted(true);
  }

  function showArticle() {
    void runGate(openArticle, { scrollBehavior: "smooth" });
  }

  function unlockSection(section: number) {
    void runGate(() => setUnlockedSection(section), { scrollBehavior: "smooth" });
  }

  if (!started) {
    return (
      <ExperienceLanding
        adNote={adNote}
        avatars={avatars}
        busy={adBusy}
        busyLabel="Loading ad…"
        ctaLabel={ctaLabel}
        className="article-engine__landing"
        icon={icon}
        intro={intro}
        onStart={showArticle}
        socialProofText={`${socialProofCount} ${socialProofLabel}`}
        title={landingTitle}
      />
    );
  }

  const currentSection = resolvedSections[unlockedSection - 1] ?? resolvedSections[0];
  const isFinalSection = unlockedSection >= resolvedSections.length;

  return (
    <article className="article-engine__article quiz-engine__continuous-shell" key={unlockedSection}>
      <header className="article-engine__header">
        <h1>{currentSection.title}</h1>
        <p>{currentSection.intro}</p>
      </header>

      <ArticlePointList points={currentSection.points} />

      {currentSection.next ? (
        <section className="article-engine__unlock">
          <span>{currentSection.next.eyebrow}</span>
          <h2>{currentSection.next.title}</h2>
          <p>{currentSection.next.copy}</p>
          <button className="quiz-engine__primary" disabled={adBusy} onClick={() => unlockSection(unlockedSection + 1)} type="button">
            <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
            {adBusy ? "Loading ad…" : currentSection.next.cta}
          </button>
          <small>One short ad, then continue.</small>
        </section>
      ) : null}

      {isFinalSection ? (
        <footer className="article-engine__sources">
          <p>Sources: {sources.map((source, index) => (
            <span key={source.url}>{index ? " · " : ""}<a href={source.url} rel="noreferrer" target="_blank">{source.label}</a></span>
          ))}</p>
          <p className="article-engine__disclaimer">
            {disclaimer}
          </p>
        </footer>
      ) : null}
    </article>
  );
}
