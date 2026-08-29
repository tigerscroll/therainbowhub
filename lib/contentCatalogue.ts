import { getAllArticleManifests, getAllArticles } from "@/lib/articles";
import { getDefaultLocale, getSupportedLocales, isSupportedLocale } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";

export type TopLevelContentRoute = {
  kind: "article" | "locale-home" | "quiz";
  segment: string;
};

export type TwoSegmentContentRoute = {
  first: string;
  kind: "article-chapter" | "localized-article" | "localized-quiz";
  second: string;
};

function assertUniqueRoute(keys: Set<string>, key: string, label: string) {
  if (keys.has(key)) throw new Error(`${label} conflicts with another generated content route.`);
  keys.add(key);
}

export function getTopLevelContentRoutes(): TopLevelContentRoute[] {
  const defaultLocale = getDefaultLocale();
  const routes: TopLevelContentRoute[] = [];
  const keys = new Set<string>();

  for (const locale of getSupportedLocales().filter((item) => item !== defaultLocale)) {
    assertUniqueRoute(keys, locale, `Locale route /${locale}`);
    routes.push({ kind: "locale-home", segment: locale });
  }
  for (const quiz of getAllQuizzes(defaultLocale)) {
    assertUniqueRoute(keys, quiz.slug, `Quiz route /${quiz.slug}`);
    routes.push({ kind: "quiz", segment: quiz.slug });
  }
  for (const article of getAllArticles()) {
    const segment = article.routeSlug ?? article.slug;
    assertUniqueRoute(keys, segment, `Article route /${segment}`);
    routes.push({ kind: "article", segment });
  }

  return routes;
}

export function getTwoSegmentContentRoutes(): TwoSegmentContentRoute[] {
  const defaultLocale = getDefaultLocale();
  const routes: TwoSegmentContentRoute[] = [];
  const keys = new Set<string>();

  for (const locale of getSupportedLocales().filter((item) => item !== defaultLocale)) {
    for (const quiz of getAllQuizzes(locale)) {
      const key = `${locale}/${quiz.slug}`;
      assertUniqueRoute(keys, key, `Localized quiz route /${key}`);
      routes.push({ first: locale, kind: "localized-quiz", second: quiz.slug });
    }
  }
  for (const article of getAllArticleManifests()) {
    if (article.locale === defaultLocale || !isSupportedLocale(article.locale)) continue;
    const routeSlug = article.routeSlug ?? article.slug;
    const key = `${article.locale}/${routeSlug}`;
    assertUniqueRoute(keys, key, `Localized article route /${key}`);
    routes.push({ first: article.locale, kind: "localized-article", second: routeSlug });
  }
  for (const article of getAllArticles()) {
    const routeSlug = article.routeSlug ?? article.slug;
    article.sections.forEach((_, index) => {
      const chapter = String(index + 1);
      const key = `${routeSlug}/${chapter}`;
      assertUniqueRoute(keys, key, `Article chapter route /${key}`);
      routes.push({ first: routeSlug, kind: "article-chapter", second: chapter });
    });
  }

  return routes;
}
