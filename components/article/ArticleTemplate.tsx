import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ArticleExperience } from "@/components/article/ArticleExperience";
import { getArticleChapterPath } from "@/components/article/articleRouting";
import type { ArticleIcon, ArticleManifest } from "@/components/article/articleSchema";
import { ExperienceThemeBoundary } from "@/components/experience/ExperienceThemeBoundary";
import { SiteShell } from "@/components/SiteShell";
import { getArticleBySlug, getArticleLocales } from "@/lib/articles";
import { getTranslations, isSupportedLocale, type SupportedLocale } from "@/lib/i18n";
import { getQuizBySlug, type QuizTheme } from "@/lib/quizzes";
import { absoluteUrl, buildMetadata, getArticlePath } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

function renderPresetIcon(name: string): ReactNode {
  if (name === "brands") {
    return (
      <svg className="article-engine__brands-icon" focusable="false" viewBox="0 0 72 72">
        <path className="article-engine__brands-tag" d="M10 18c0-4 3-7 7-7h24l21 21-29 29L10 38V18Z" />
        <circle className="article-engine__brands-hole" cx="24" cy="24" r="5" />
        <path className="article-engine__brands-string" d="M24 24c5-10 14-14 24-13" />
        <text className="article-engine__brands-pound" x="36" y="48">£</text>
      </svg>
    );
  }
  if (name === "colon") {
    return (
      <svg className="article-engine__colon-icon" focusable="false" viewBox="0 0 72 72">
        <path className="article-engine__colon-outline" d="M16 48V25c0-8 5-12 13-12 8 1 15-2 23 0 6 1 9 6 9 13v18c0 7-5 11-12 10-6-1-10-1-14 3-3 3-2 7 2 9" />
        <path className="article-engine__colon-tube" d="M16 48V25c0-8 5-12 13-12 8 1 15-2 23 0 6 1 9 6 9 13v18c0 7-5 11-12 10-6-1-10-1-14 3-3 3-2 7 2 9" />
        <path className="article-engine__colon-detail" d="M11 28h10m-10 10h10M27 8v11m11-10v10m12-10v11m6 8h10m-10 10h10m-15 11 3 10m-15-7 5 8" />
        <path className="article-engine__colon-appendix" d="M13 48c-3 5-2 10 1 13" />
        <circle className="article-engine__colon-cecum" cx="16" cy="48" r="7" />
      </svg>
    );
  }
  if (name === "funeral") {
    return <img alt="" className="article-engine__funeral-icon" height="256" src="/article-icons/funeral-pianist.png" width="256" />;
  }
  if (name === "historical") {
    return <img alt="" className="article-engine__historical-icon" height="1664" src="/article-images/historical/migrant-mother.jpg" width="1280" />;
  }
  if (name === "hiv") {
    return (
      <svg className="article-engine__hiv-icon" focusable="false" viewBox="0 0 72 72">
        <path className="article-engine__hiv-vulva" d="M36 7C24 13 17 25 17 39c0 13 8 24 19 28 11-4 19-15 19-28 0-14-7-26-19-32Z" />
        <path className="article-engine__hiv-inner" d="M36 18c-7 7-10 14-9 23 1 8 5 14 9 18 4-4 8-10 9-18 1-9-2-16-9-23Z" />
        <path className="article-engine__hiv-centre" d="M36 25c-3 5-4 10-3 16 0 5 2 9 3 12 1-3 3-7 3-12 1-6 0-11-3-16Z" />
        <circle className="article-engine__hiv-detail" cx="36" cy="20" r="2.5" />
      </svg>
    );
  }
  if (name === "kidney") {
    return (
      <svg className="article-engine__kidney-icon" focusable="false" viewBox="0 0 72 72">
        <path className="article-engine__kidney-organ" d="M25 8c-9-2-16 6-16 18 0 13 7 22 16 21 7-1 10-7 8-14-2-6-2-10 1-15 4-7 0-9-9-10Z" />
        <path className="article-engine__kidney-organ" d="M47 8c9-2 16 6 16 18 0 13-7 22-16 21-7-1-10-7-8-14 2-6 2-10-1-15-4-7 0-9 9-10Z" />
        <path className="article-engine__kidney-hilum" d="M28 18c-6 4-7 13-2 19M44 18c6 4 7 13 2 19" />
        <path className="article-engine__kidney-ureter" d="M27 38c0 11 3 18 7 26M45 38c0 11-3 18-7 26" />
      </svg>
    );
  }
  if (name === "prostate") {
    return (
      <svg className="article-engine__prostate-icon" focusable="false" viewBox="0 0 72 72">
        <path className="article-engine__prostate-bladder" d="M22 8c-7 5-10 14-7 24 3 9 10 14 21 14s18-5 21-14c3-10 0-19-7-24-4-3-9-2-14 2-5-4-10-5-14-2Z" />
        <path className="article-engine__prostate-bladder-detail" d="M24 16c-4 6-5 13-2 19" />
        <path className="article-engine__prostate-gland" d="M18 43c4-6 11-8 18-4 7-4 14-2 18 4 4 7 0 15-7 20l-11 7-11-7c-7-5-11-13-7-20Z" />
        <path className="article-engine__prostate-zone" d="M36 42c-5 5-5 13 0 20 5-7 5-15 0-20Z" />
        <path className="article-engine__prostate-urethra" d="M36 34v35" />
      </svg>
    );
  }
  return null;
}

function renderIcon(icon: ArticleIcon) {
  if (icon.kind === "emoji") return icon.value;
  if (icon.kind === "preset") return renderPresetIcon(icon.name);
  return <img alt={icon.alt} className={icon.className} src={icon.src} />;
}

export function buildArticleMetadata(article: ArticleManifest, initialSection?: number): Metadata {
  if (!isSupportedLocale(article.locale)) return {};
  const locales = getArticleLocales(article.slug).filter(isSupportedLocale);
  const languages = Object.fromEntries(locales.map((locale) => {
    const localizedArticle = getArticleBySlug(article.slug, locale);
    const localizedBasePath = getArticlePath(locale, localizedArticle?.routeSlug ?? article.slug);
    const localizedSection = initialSection && localizedArticle && initialSection <= localizedArticle.sections.length
      ? initialSection
      : undefined;
    return [locale, absoluteUrl(getArticleChapterPath(localizedBasePath, localizedSection))];
  }));
  const defaultArticle = getArticleBySlug(article.slug, "en");
  const defaultBasePath = getArticlePath("en", defaultArticle?.routeSlug ?? article.slug);
  const defaultSection = initialSection && defaultArticle && initialSection <= defaultArticle.sections.length
    ? initialSection
    : undefined;
  languages["x-default"] = absoluteUrl(getArticleChapterPath(defaultBasePath, defaultSection));
  const articlePath = getArticleChapterPath(
    getArticlePath(article.locale, article.routeSlug ?? article.slug),
    initialSection,
  );
  return buildMetadata({
    alternates: { canonical: absoluteUrl(articlePath), languages },
    description: article.metadata.description,
    locale: article.locale,
    path: articlePath,
    title: article.metadata.title,
  });
}

export function ArticleTemplate({ article, initialSection }: { article: ArticleManifest; initialSection?: number }) {
  if (!isSupportedLocale(article.locale)) notFound();
  const locale: SupportedLocale = article.locale;
  const referenceQuiz = getQuizBySlug(article.referenceQuizSlug, locale)
    ?? getQuizBySlug(article.referenceQuizSlug, "en");
  if (!referenceQuiz) notFound();
  const translations = getTranslations(locale);
  const articleBasePath = getArticlePath(locale, article.routeSlug ?? article.slug);
  const currentArticlePath = getArticleChapterPath(articleBasePath, initialSection);
  const availableLocales = getArticleLocales(article.slug).filter(isSupportedLocale);
  const localePaths = Object.fromEntries(availableLocales.map((availableLocale) => {
    const localizedArticle = getArticleBySlug(article.slug, availableLocale);
    const localizedBasePath = getArticlePath(availableLocale, localizedArticle?.routeSlug ?? article.slug);
    const localizedSection = initialSection && localizedArticle && initialSection <= localizedArticle.sections.length
      ? initialSection
      : undefined;
    return [availableLocale, getArticleChapterPath(localizedBasePath, localizedSection)];
  })) as Partial<Record<SupportedLocale, string>>;
  const colors: QuizTheme["colors"] = {
    ...referenceQuiz.theme.colors,
    ...article.theme.colors,
  };
  const articleTheme: QuizTheme = {
    ...referenceQuiz.theme,
    id: article.theme.id,
    colors,
    header: article.theme.header,
  };
  const structuredData = {
    "@context": "https://schema.org",
    "@type": article.metadata.schemaType,
    name: article.metadata.title,
    description: article.metadata.description,
    inLanguage: article.locale,
    url: absoluteUrl(currentArticlePath),
    ...(article.metadata.dateModified ? { dateModified: article.metadata.dateModified } : {}),
    ...(article.metadata.lastReviewed ? { lastReviewed: article.metadata.lastReviewed } : {}),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  };

  return (
    <SiteShell
      availableLocales={availableLocales}
      currentPath={currentArticlePath}
      locale={locale}
      localePaths={localePaths}
      quizTheme={articleTheme}
      translations={translations}
    >
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
      <style dangerouslySetInnerHTML={{ __html: `html,body{background:${articleTheme.colors.page}}` }} />
      <ExperienceThemeBoundary
        shellCssHref={referenceQuiz.shellCssHref}
        theme={articleTheme}
        themeCssHref={referenceQuiz.themeCssHref}
      >
        <ArticleExperience
          articlePath={articleBasePath}
          adNote={article.landing.cta.adNote}
          articleLocale={locale}
          articleSlug={article.slug}
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel={article.landing.cta.label}
          ctaIcon={article.landing.cta.icon}
          disclaimer={article.disclaimer}
          gatePlacement={article.gatePlacement}
          icon={renderIcon(article.landing.icon)}
          intro={article.landing.intro}
          initialSection={initialSection}
          landingBusyLabel={article.landing.cta.busyLabel}
          landingTitle={article.landing.title}
          sectionCount={article.sections.length}
          showCtaIcon={article.landing.cta.showIcon}
          showSocialProof={article.landing.socialProofVisible ?? true}
          socialProofCount={article.landing.socialProofCount}
          socialProofLabel={article.landing.socialProofLabel}
          sources={article.sources}
          ui={article.ui}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
