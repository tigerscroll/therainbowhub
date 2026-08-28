"use client";

import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState, type ReactNode } from "react";

import { getArticleChapterPath } from "@/components/article/articleRouting";
import { ExperienceLanding } from "@/components/experience/ExperienceLanding";
import { useRewardedGate } from "@/components/experience/useRewardedGate";
import {
  isArticleSection,
  type ArticlePoint,
  type ArticleSection,
  type ArticleSource,
} from "@/components/article/articleSchema";

export type { ArticlePoint, ArticleSection, ArticleSource } from "@/components/article/articleSchema";

type ArticleExperienceProps = {
  adNote?: string;
  articleLocale?: string;
  articlePath: string;
  articleSlug: string;
  avatars: string[];
  ctaLabel: string;
  ctaIcon?: ReactNode;
  disclaimer?: string;
  gatePlacement?: "default" | "bottom-only";
  icon: ReactNode;
  intro: string;
  initialSection?: number;
  landingBusyLabel?: string;
  landingTitle: string;
  sectionCount: number;
  showCtaIcon?: boolean;
  showSocialProof?: boolean;
  socialProofCount?: string;
  socialProofLabel?: string;
  sources: ArticleSource[];
  ui?: {
    defaultGateAdNote?: string;
    gateBusyNote?: string;
    loadingAdLabel?: string;
    preparingArticleLabel?: string;
    restoringCopy?: string;
    restoringTitle?: string;
    sourcesLabel?: string;
  };
};

const sectionRequests = new Map<string, Promise<ArticleSection>>();

function loadArticleSection(slug: string, locale: string, section: number) {
  const key = `${locale}:${slug}:${section}`;
  const existing = sectionRequests.get(key);
  if (existing) return existing;
  const payloadPath = locale === "en"
    ? `/article-data/${encodeURIComponent(slug)}/${section}`
    : `/article-data/${encodeURIComponent(`${locale}--${slug}`)}/${section}`;
  const request = fetch(payloadPath, { cache: "force-cache" })
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

function ArticleArrow({ compact = false, value }: { compact?: boolean; value?: string }) {
  if (value && value !== "→" && value !== "›") {
    return <span aria-hidden="true" className={compact ? "article-engine__cta-icon-custom" : "article-engine__unlock-icon-custom"}>{value}</span>;
  }

  return (
    <svg
      aria-hidden="true"
      className={compact ? "article-engine__cta-arrow" : "article-engine__inline-unlock-arrow"}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h13M13.5 7.5 18 12l-4.5 4.5" />
    </svg>
  );
}

function ArticleInlineUnlock({
  busy,
  defaultAdNote,
  gateBusyNote,
  next,
  onUnlock,
}: {
  busy: boolean;
  defaultAdNote: string;
  gateBusyNote: string;
  next: NonNullable<ArticleSection["next"]>;
  onUnlock: () => void;
}) {
  const adNote = next.adNote ?? defaultAdNote;
  const showCtaIcon = next.showCtaIcon ?? true;

  return (
    <button
      aria-label={next.ariaLabel ?? `${next.title}. ${next.cta}. ${adNote}`}
      aria-busy={busy}
      className="article-engine__inline-unlock"
      disabled={busy}
      onClick={onUnlock}
      type="button"
    >
      <span className="article-engine__inline-unlock-copy">
        <small>{next.eyebrow}</small>
        <strong>{next.title}</strong>
        <span>{next.copy}</span>
        <b>{next.cta}{showCtaIcon ? <ArticleArrow compact value={next.ctaIcon} /> : null}</b>
        <em><i aria-hidden="true">✓</i>{busy ? (next.busyNote ?? gateBusyNote) : adNote}</em>
      </span>
      {showCtaIcon ? <span aria-hidden="true" className="article-engine__inline-unlock-icon"><ArticleArrow value={next.ctaIcon} /></span> : null}
    </button>
  );
}

function ArticlePointList({
  busy,
  defaultAdNote,
  gateBusyNote,
  insertAfter,
  next,
  onUnlock,
  points,
}: {
  busy: boolean;
  defaultAdNote: string;
  gateBusyNote: string;
  insertAfter?: number;
  next?: ArticleSection["next"];
  onUnlock: () => void;
  points: ArticlePoint[];
}) {
  return (
    <div className="article-engine__points">
      {points.map((point, index) => (
        <Fragment key={point.title}>
          <section className={`article-engine__point${point.numberLabel === "1" ? " article-engine__point--number-one" : ""}`}>
            <span aria-hidden="true" className="article-engine__number">{point.numberLabel ? `#${point.numberLabel}` : index + 1}</span>
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
              {point.callouts?.length ? (
                <aside aria-label="PSA questions" className="article-engine__callouts">
                  {point.callouts.map((callout) => (
                    <div className="article-engine__callout" key={callout.question}>
                      <h3>{callout.question}</h3>
                      <p>{callout.answer}</p>
                    </div>
                  ))}
                </aside>
              ) : null}
            </div>
          </section>
          {next && insertAfter && index + 1 === insertAfter ? (
            <ArticleInlineUnlock busy={busy} defaultAdNote={defaultAdNote} gateBusyNote={gateBusyNote} next={next} onUnlock={onUnlock} />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

export function ArticleExperience({
  adNote = "One short ad, then continue.",
  articleLocale = "en",
  articlePath,
  articleSlug,
  avatars,
  ctaLabel,
  ctaIcon = "→",
  disclaimer = "General information only. This article is not a diagnosis, medical assessment or substitute for advice from a qualified healthcare professional.",
  gatePlacement = "default",
  icon,
  intro,
  initialSection,
  landingBusyLabel,
  landingTitle,
  sectionCount,
  showCtaIcon = true,
  showSocialProof = true,
  socialProofCount = "125,000+",
  socialProofLabel = "read this today",
  sources,
  ui,
}: ArticleExperienceProps) {
  const router = useRouter();
  const [started, setStarted] = useState(Boolean(initialSection));
  const [currentSection, setCurrentSection] = useState<ArticleSection | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [restoring, setRestoring] = useState(Boolean(initialSection));
  const { busy: adBusy, runGate } = useRewardedGate({ attempts: 3 });
  const defaultGateAdNote = ui?.defaultGateAdNote ?? "One short ad, then continue.";
  const gateBusyNote = ui?.gateBusyNote ?? "Loading ad…";

  useEffect(() => {
    let active = true;
    if (!initialSection) {
      setCurrentSection(null);
      setNavigating(false);
      setRestoring(false);
      setStarted(false);
      return () => { active = false; };
    }

    setStarted(true);
    setRestoring(true);
    void loadArticleSection(articleSlug, articleLocale, initialSection).then((section) => {
      if (!active) return;
      setCurrentSection(section);
    }).catch(() => {
      if (!active) return;
      setCurrentSection(null);
      setStarted(false);
      router.replace(articlePath, { scroll: true });
    }).finally(() => {
      if (!active) return;
      setRestoring(false);
      setNavigating(false);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => window.scrollTo({ behavior: "smooth", top: 0 }));
      });
    });

    return () => { active = false; };
  }, [articleLocale, articlePath, articleSlug, initialSection, router]);

  function openSection(section: number) {
    const chapterPath = getArticleChapterPath(articlePath, section);
    const chapterHref = `${chapterPath}${window.location.search}`;
    void loadArticleSection(articleSlug, articleLocale, section);
    router.prefetch(chapterPath);
    void runGate(() => {
      setNavigating(true);
      router.push(chapterHref, { scroll: false });
    }, { scrollAfter: false });
  }

  function showArticle() { openSection(1); }
  function unlockSection(section: number) { openSection(section); }

  if (restoring || (started && !currentSection)) {
    return (
      <section aria-busy="true" aria-live="polite" className="quiz-engine__preparing quiz-engine__card quiz-engine__continuous-shell" role="status">
        <div aria-hidden="true" className="quiz-engine__result-icon quiz-engine__preparing-icon">{icon}</div>
        <h2>{ui?.restoringTitle ?? "Returning to your article…"}</h2>
        <p>{ui?.restoringCopy ?? "Loading your unlocked section."}</p>
        <div aria-hidden="true" className="quiz-engine__preparing-mark"><span /><span /><span /></div>
      </section>
    );
  }

  if (!started) {
    return (
      <ExperienceLanding
        adNote={adNote}
        avatars={avatars}
        busy={adBusy || navigating}
        busyLabel={navigating
          ? (ui?.preparingArticleLabel ?? "Preparing article…")
          : (landingBusyLabel ?? ui?.loadingAdLabel ?? "Loading ad…")}
        ctaIcon={ctaIcon}
        ctaIconPosition="end"
        ctaLabel={ctaLabel}
        className="article-engine__landing"
        icon={icon}
        intro={intro}
        onStart={showArticle}
        showCtaIcon={showCtaIcon}
        showSocialProof={showSocialProof}
        socialProofText={`${socialProofCount} ${socialProofLabel}`}
        title={landingTitle}
      />
    );
  }

  if (!currentSection) return null;
  const currentSectionNumber = initialSection ?? 1;
  const isFinalSection = currentSectionNumber >= sectionCount;
  const isRankedSection = currentSection.points.some((point) => typeof point.numberLabel === "string");

  return (
    <article
      className={`article-engine__article quiz-engine__continuous-shell${isRankedSection ? " article-engine__article--ranked" : ""}`}
      key={currentSectionNumber}
    >
      <header className="article-engine__header">
        {currentSection.eyebrow ? <span className="article-engine__section-eyebrow">{currentSection.eyebrow}</span> : null}
        <h1>{currentSection.title}</h1>
        <p>{currentSection.intro}</p>
      </header>

      <ArticlePointList
        busy={adBusy || navigating}
        defaultAdNote={defaultGateAdNote}
        gateBusyNote={gateBusyNote}
        insertAfter={gatePlacement === "default" ? 5 : undefined}
        next={currentSection.next}
        onUnlock={() => unlockSection(currentSectionNumber + 1)}
        points={currentSection.points}
      />

      {currentSection.next ? (
        <ArticleInlineUnlock
          busy={adBusy || navigating}
          defaultAdNote={defaultGateAdNote}
          gateBusyNote={gateBusyNote}
          next={currentSection.next}
          onUnlock={() => unlockSection(currentSectionNumber + 1)}
        />
      ) : null}

      {currentSection.conclusion ? (
        <section className="article-engine__conclusion">
          <span>{currentSection.conclusion.eyebrow}</span>
          <p>{currentSection.conclusion.copy}</p>
        </section>
      ) : null}

      {isFinalSection ? (
        <footer className="article-engine__sources">
          <p>{ui?.sourcesLabel ?? "Sources"}: {sources.map((source, index) => (
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
