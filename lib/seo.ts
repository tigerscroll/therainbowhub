import type { Metadata } from "next";
import { infoPageSlugs, type InfoPageSlug } from "@/lib/infoPages";
import { getDefaultLocale, getSupportedLocales, type SupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, getQuizLocales } from "@/lib/quizzes";
import { siteConfig } from "@/lib/siteConfig";

const defaultLocale = getDefaultLocale();

export const siteBaseUrl = siteConfig.siteUrl.replace(/\/+$/, "");

export function absoluteUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteBaseUrl}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function getHomePath(locale: SupportedLocale) {
  return locale === defaultLocale ? "/" : `/${locale}`;
}

export function getQuizPath(locale: SupportedLocale, slug: string) {
  return locale === defaultLocale ? `/${slug}` : `/${locale}/${slug}`;
}

export function getInfoPath(locale: SupportedLocale, slug: InfoPageSlug) {
  return locale === defaultLocale ? `/info/${slug}` : `/${locale}/info/${slug}`;
}

function languageAlternates(pathForLocale: (locale: SupportedLocale) => string, locales = getSupportedLocales()) {
  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(pathForLocale(locale))]),
  ) as Record<string, string>;
}

export function homeAlternates() {
  return {
    canonical: absoluteUrl("/"),
    languages: {
      ...languageAlternates(getHomePath),
      "x-default": absoluteUrl("/"),
    },
  };
}

export function quizAlternates(slug: string) {
  const locales = getQuizLocales(slug);

  return {
    canonical: absoluteUrl(getQuizPath(defaultLocale, slug)),
    languages: {
      ...languageAlternates((locale) => getQuizPath(locale, slug), locales),
      "x-default": absoluteUrl(getQuizPath(defaultLocale, slug)),
    },
  };
}

export function localizedQuizAlternates(locale: SupportedLocale, slug: string) {
  const locales = getQuizLocales(slug);

  return {
    canonical: absoluteUrl(getQuizPath(locale, slug)),
    languages: {
      ...languageAlternates((item) => getQuizPath(item, slug), locales),
      "x-default": absoluteUrl(getQuizPath(defaultLocale, slug)),
    },
  };
}

export function localizedHomeAlternates(locale: SupportedLocale) {
  return {
    canonical: absoluteUrl(getHomePath(locale)),
    languages: {
      ...languageAlternates(getHomePath),
      "x-default": absoluteUrl("/"),
    },
  };
}

export function infoAlternates(locale: SupportedLocale, slug: InfoPageSlug) {
  return {
    canonical: absoluteUrl(getInfoPath(locale, slug)),
    languages: {
      ...languageAlternates((item) => getInfoPath(item, slug)),
      "x-default": absoluteUrl(getInfoPath(defaultLocale, slug)),
    },
  };
}

export function buildMetadata({
  description,
  locale = defaultLocale,
  path,
  title,
  alternates,
}: {
  alternates: Metadata["alternates"];
  description: string;
  locale?: SupportedLocale;
  path: string;
  title: string;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title: {
      absolute: title,
    },
    description,
    alternates,
    openGraph: {
      description,
      locale,
      siteName: siteConfig.name,
      title,
      type: "website",
      url,
      images: [
        {
          url: absoluteUrl("/og-default.svg"),
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      description,
      title,
      images: [absoluteUrl("/og-default.svg")],
    },
  };
}

export function getSitemapEntries() {
  const now = new Date();
  const entries: Array<{
    changeFrequency: "daily" | "weekly" | "monthly";
    lastModified: Date;
    priority: number;
    url: string;
  }> = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1,
    },
  ];

  for (const locale of getSupportedLocales().filter((item) => item !== defaultLocale)) {
    entries.push({
      url: absoluteUrl(getHomePath(locale)),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    });
  }

  for (const quiz of getAllQuizzes(defaultLocale)) {
    for (const locale of getQuizLocales(quiz.slug)) {
      const localizedQuiz = getAllQuizzes(locale).find((item) => item.slug === quiz.slug) ?? quiz;
      entries.push({
        url: absoluteUrl(getQuizPath(locale, quiz.slug)),
        lastModified: new Date(localizedQuiz.publishedAt),
        changeFrequency: "weekly" as const,
        priority: locale === defaultLocale ? 0.85 : 0.75,
      });
    }
  }

  for (const slug of infoPageSlugs) {
    for (const locale of getSupportedLocales()) {
      entries.push({
        url: absoluteUrl(getInfoPath(locale, slug)),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: locale === defaultLocale ? 0.45 : 0.35,
      });
    }
  }

  return entries;
}
