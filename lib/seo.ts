import type { Metadata } from "next";
import { getInfoPage, infoPageSlugs, type InfoPageSlug } from "@/lib/infoPages";
import { getDefaultLocale, getSupportedLocales, type SupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, getQuizLocales } from "@/lib/quizzes";
import { siteConfig } from "@/lib/siteConfig";

const defaultLocale = getDefaultLocale();

const siteBaseUrl = siteConfig.siteUrl.replace(/\/+$/, "");

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

function withSiteName(title: string) {
  const normalizedTitle = title.trim();
  return normalizedTitle.toLocaleLowerCase().includes(siteConfig.name.toLocaleLowerCase())
    ? normalizedTitle
    : `${normalizedTitle} - ${siteConfig.name}`;
}

function clampMetaDescription(description: string, maxLength = 160) {
  const normalizedDescription = description.replace(/\s+/g, " ").trim();
  if (normalizedDescription.length <= maxLength) return normalizedDescription;

  const candidate = normalizedDescription.slice(0, maxLength - 1);
  const wordBoundary = candidate.lastIndexOf(" ");
  const cutoff = wordBoundary > maxLength * 0.7 ? wordBoundary : candidate.length;
  return `${candidate.slice(0, cutoff).trimEnd()}…`;
}

export function buildMetadata({
  description,
  locale = defaultLocale,
  path,
  title,
  alternates,
  image,
}: {
  alternates: Metadata["alternates"];
  description: string;
  image?: {
    alt: string;
    height: number;
    path: string;
    width: number;
  };
  locale?: SupportedLocale;
  path: string;
  title: string;
}): Metadata {
  const url = absoluteUrl(path);
  const metadataDescription = clampMetaDescription(description);
  const metadataTitle = withSiteName(title);
  const metadataImage = image ?? {
    alt: siteConfig.name,
    height: 630,
    path: "/og-default.svg",
    width: 1200,
  };
  const imageUrl = absoluteUrl(metadataImage.path);

  return {
    title: {
      absolute: metadataTitle,
    },
    description: metadataDescription,
    alternates,
    openGraph: {
      description: metadataDescription,
      locale,
      siteName: siteConfig.name,
      title: metadataTitle,
      type: "website",
      url,
      images: [
        {
          url: imageUrl,
          width: metadataImage.width,
          height: metadataImage.height,
          alt: metadataImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      description: metadataDescription,
      title: metadataTitle,
      images: [imageUrl],
    },
  };
}

export function getSitemapEntries() {
  const localeContentDate = (locale: SupportedLocale) => new Date(Math.max(
    ...getAllQuizzes(locale).map((quiz) => Date.parse(quiz.publishedAt)),
    ...infoPageSlugs.map((slug) => Date.parse(`${getInfoPage(locale, slug).lastModified}T00:00:00Z`)),
  ));
  const entries: Array<{
    changeFrequency: "daily" | "weekly" | "monthly";
    lastModified: Date;
    priority: number;
    url: string;
  }> = [
    {
      url: absoluteUrl("/"),
      lastModified: localeContentDate(defaultLocale),
      changeFrequency: "daily" as const,
      priority: 1,
    },
  ];

  for (const locale of getSupportedLocales().filter((item) => item !== defaultLocale)) {
    entries.push({
      url: absoluteUrl(getHomePath(locale)),
      lastModified: localeContentDate(locale),
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
        lastModified: new Date(`${getInfoPage(locale, slug).lastModified}T00:00:00Z`),
        changeFrequency: "monthly" as const,
        priority: locale === defaultLocale ? 0.45 : 0.35,
      });
    }
  }

  entries.push({
    url: absoluteUrl("/prostate"),
    lastModified: new Date("2026-08-25T00:00:00Z"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  });

  entries.push({
    url: absoluteUrl("/cellulite"),
    lastModified: new Date("2026-08-25T00:00:00Z"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  });

  entries.push({
    url: absoluteUrl("/colon"),
    lastModified: new Date("2026-08-27T00:00:00Z"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  });

  entries.push({
    url: absoluteUrl("/kidney"),
    lastModified: new Date("2026-08-27T00:00:00Z"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  });

  entries.push({
    url: absoluteUrl("/funeral"),
    lastModified: new Date("2026-08-27T00:00:00Z"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  });

  entries.push({
    url: absoluteUrl("/brands"),
    lastModified: new Date("2026-08-27T00:00:00Z"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  });

  entries.push({
    url: absoluteUrl("/signs"),
    lastModified: new Date("2026-08-27T00:00:00Z"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  });

  return entries;
}
