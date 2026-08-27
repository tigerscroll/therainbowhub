"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";

import { ExperienceLanding } from "@/components/experience/ExperienceLanding";
import { useRewardedGate } from "@/components/experience/useRewardedGate";
import {
  ARTICLE_PROGRESS_VERSION,
  getArticleProgressKey,
  parseArticleProgress,
} from "@/components/article/articleProgress";

export type ArticlePoint = {
  numberLabel?: string;
  image?: {
    alt: string;
    caption: string;
    src: string;
  };
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
  articleSlug: string;
  avatars: string[];
  ctaLabel: string;
  disclaimer?: string;
  icon: ReactNode;
  intro: string;
  landingTitle: string;
  sectionCount: number;
  showCtaIcon?: boolean;
  socialProofCount?: string;
  socialProofLabel?: string;
  sources: ArticleSource[];
};

const sectionRequests = new Map<string, Promise<ArticleSection>>();

function isArticleSection(value: unknown): value is ArticleSection {
  if (!value || typeof value !== "object") return false;
  const section = value as Partial<ArticleSection>;
  return typeof section.title === "string"
    && typeof section.intro === "string"
    && Array.isArray(section.points)
    && section.points.every((point) => point
      && typeof point.title === "string"
      && (typeof point.numberLabel === "undefined" || typeof point.numberLabel === "string")
      && Array.isArray(point.paragraphs)
      && point.paragraphs.every((paragraph) => typeof paragraph === "string")
      && (typeof point.image === "undefined" || (point.image
        && typeof point.image === "object"
        && typeof point.image.alt === "string"
        && typeof point.image.caption === "string"
        && typeof point.image.src === "string")));
}

function loadArticleSection(slug: string, section: number) {
  const key = `${slug}:${section}`;
  const existing = sectionRequests.get(key);
  if (existing) return existing;
  const request = fetch(`/article-data/${encodeURIComponent(slug)}/${section}`, { cache: "force-cache" })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Article section ${section} could not be loaded.`);
      const value: unknown = await response.json();
      if (!isArticleSection(value)) throw new Error(`Article section ${section} is invalid.`);
      return value;
    })
    .catch((error) => {
      sectionRequests.delete(key);
      throw error;
    });
  sectionRequests.set(key, request);
  return request;
}

function ArticleInlineUnlock({
  busy,
  next,
  onUnlock,
}: {
  busy: boolean;
  next: NonNullable<ArticleSection["next"]>;
  onUnlock: () => void;
}) {
  return (
    <button
      aria-label={`${next.title}. ${next.cta}. One short ad, then continue.`}
      className="article-engine__inline-unlock"
      disabled={busy}
      onClick={onUnlock}
      type="button"
    >
      <span className="article-engine__inline-unlock-copy">
        <small>{next.eyebrow}</small>
        <strong>{next.title}</strong>
        <span>{next.copy}</span>
        <b>{next.cta} →</b>
        <em><i aria-hidden="true">✓</i>{busy ? "Loading ad…" : "One short ad, then open."}</em>
      </span>
      <span aria-hidden="true" className="article-engine__inline-unlock-icon">→</span>
    </button>
  );
}

function ArticlePointList({
  busy,
  insertAfter,
  next,
  onUnlock,
  points,
}: {
  busy: boolean;
  insertAfter: number;
  next?: ArticleSection["next"];
  onUnlock: () => void;
  points: ArticlePoint[];
}) {
  return (
    <div className="article-engine__points">
      {points.map((point, index) => (
        <Fragment key={point.title}>
          <section className="article-engine__point">
            <span aria-hidden="true" className="article-engine__number">{point.numberLabel ?? index + 1}</span>
            <div>
              <h2>{point.title}</h2>
              {point.image ? (
                <figure className="article-engine__point-media">
                  <img
                    alt={point.image.alt}
                    decoding="async"
                    loading="lazy"
                    src={point.image.src}
                  />
                  <figcaption>{point.image.caption}</figcaption>
                </figure>
              ) : null}
              {point.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
          {next && index + 1 === insertAfter ? (
            <ArticleInlineUnlock busy={busy} next={next} onUnlock={onUnlock} />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

export function ArticleExperience({
  adNote = "One short ad, then see the warning signs.",
  articleSlug,
  avatars,
  ctaLabel,
  disclaimer = "General information only. This article is not a diagnosis, medical assessment or substitute for advice from a qualified healthcare professional.",
  icon,
  intro,
  landingTitle,
  sectionCount,
  showCtaIcon = true,
  socialProofCount = "125,000+",
  socialProofLabel = "read this today",
  sources,
}: ArticleExperienceProps) {
  const [started, setStarted] = useState(false);
  const [unlockedSection, setUnlockedSection] = useState(1);
  const [currentSection, setCurrentSection] = useState<ArticleSection | null>(null);
  const [contentBusy, setContentBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { busy: adBusy, runGate } = useRewardedGate({ attempts: 3 });
  const progressKey = getArticleProgressKey(articleSlug);

  useEffect(() => {
    let active = true;
    let restoredSection: number | undefined;
    try {
      const raw = window.localStorage.getItem(progressKey);
      const saved = raw ? parseArticleProgress(JSON.parse(raw), sectionCount) : null;
      restoredSection = saved?.section;
      if (!saved && raw) window.localStorage.removeItem(progressKey);
    } catch {
      try { window.localStorage.removeItem(progressKey); } catch { /* Storage can be unavailable. */ }
    }

    if (!restoredSection) {
      document.documentElement.classList.remove("article-resuming");
      return () => { active = false; };
    }

    setRestoring(true);
    void loadArticleSection(articleSlug, restoredSection).then((section) => {
      if (!active) return;
      setCurrentSection(section);
      setUnlockedSection(restoredSection);
      setStarted(true);
    }).catch(() => {
      try { window.localStorage.removeItem(progressKey); } catch { /* Storage can be unavailable. */ }
    }).finally(() => {
      if (!active) return;
      setRestoring(false);
      document.documentElement.classList.remove("article-resuming");
    });

    return () => { active = false; };
  }, [articleSlug, progressKey, sectionCount]);

  function saveProgress(section: number) {
    try {
      window.localStorage.setItem(progressKey, JSON.stringify({
        version: ARTICLE_PROGRESS_VERSION,
        section,
        updatedAt: new Date().toISOString(),
      }));
    } catch { /* Storage can be unavailable. */ }
  }

  function revealLoadedSection(section: number, request: Promise<ArticleSection>) {
    setContentBusy(true);
    void request.then((content) => {
      setCurrentSection(content);
      setUnlockedSection(section);
      setStarted(true);
      saveProgress(section);
      window.scrollTo({ behavior: "smooth", top: 0 });
    }).catch(() => {
      setStarted(false);
      try { window.localStorage.removeItem(progressKey); } catch { /* Storage can be unavailable. */ }
    }).finally(() => setContentBusy(false));
  }

  function showArticle() {
    const request = loadArticleSection(articleSlug, 1);
    void runGate(() => revealLoadedSection(1, request), { scrollAfter: false });
  }

  function unlockSection(section: number) {
    const request = loadArticleSection(articleSlug, section);
    void runGate(() => revealLoadedSection(section, request), { scrollAfter: false });
  }

  if (restoring || (started && !currentSection)) {
    return (
      <section aria-busy="true" aria-live="polite" className="quiz-engine__preparing quiz-engine__card quiz-engine__continuous-shell" role="status">
        <div aria-hidden="true" className="quiz-engine__result-icon quiz-engine__preparing-icon">{icon}</div>
        <h2>Returning to your article…</h2>
        <p>Loading your unlocked section.</p>
        <div aria-hidden="true" className="quiz-engine__preparing-mark"><span /><span /><span /></div>
      </section>
    );
  }

  if (!started) {
    return (
      <>
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var r=window.localStorage.getItem(${JSON.stringify(progressKey)});if(r){var p=JSON.parse(r);if(p&&p.version===${ARTICLE_PROGRESS_VERSION}&&Number.isInteger(p.section)&&p.section>=1&&p.section<=${sectionCount})document.documentElement.classList.add("article-resuming")}}catch(e){}})();` }} />
      <ExperienceLanding
        adNote={adNote}
        avatars={avatars}
        busy={adBusy || contentBusy}
        busyLabel={contentBusy ? "Preparing article…" : "Loading ad…"}
        ctaLabel={ctaLabel}
        className="article-engine__landing"
        icon={icon}
        intro={intro}
        onStart={showArticle}
        showCtaIcon={showCtaIcon}
        socialProofText={`${socialProofCount} ${socialProofLabel}`}
        title={landingTitle}
      />
      </>
    );
  }

  if (!currentSection) return null;
  const isFinalSection = unlockedSection >= sectionCount;

  return (
    <article className="article-engine__article quiz-engine__continuous-shell" key={unlockedSection}>
      <header className="article-engine__header">
        <h1>{currentSection.title}</h1>
        <p>{currentSection.intro}</p>
      </header>

      <ArticlePointList
        busy={adBusy || contentBusy}
        insertAfter={5}
        next={currentSection.next}
        onUnlock={() => unlockSection(unlockedSection + 1)}
        points={currentSection.points}
      />

      {currentSection.next ? (
        <ArticleInlineUnlock
          busy={adBusy || contentBusy}
          next={currentSection.next}
          onUnlock={() => unlockSection(unlockedSection + 1)}
        />
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
