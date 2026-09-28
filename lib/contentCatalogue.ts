import { getDefaultLocale, getSupportedLocales } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";

export type TopLevelContentRoute = {
  kind: "locale-home" | "quiz";
  segment: string;
};

export type TwoSegmentContentRoute = {
  first: string;
  kind: "localized-quiz";
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
  return routes;
}
