import fs from "node:fs";
import path from "node:path";
import { getDefaultLocale, isSupportedLocale, type SupportedLocale } from "@/lib/i18n";

export type InfoPageSlug =
  | "about"
  | "contact"
  | "accessibility"
  | "privacy-policy"
  | "cookie-policy"
  | "terms-of-use"
  | "disclaimer";

export type InfoPageSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  after?: string[];
};

export type InfoPage = {
  kicker: string;
  title: string;
  updated: string;
  sections: InfoPageSection[];
};

export const infoPageSlugs: InfoPageSlug[] = [
  "about",
  "contact",
  "accessibility",
  "privacy-policy",
  "cookie-policy",
  "terms-of-use",
  "disclaimer",
];

export const infoPageMetadata: Record<InfoPageSlug, { title: string; description: string }> = {
  about: {
    title: "About",
    description: "Learn about The Rainbow Hub, its quizzes, scoring philosophy, and site standards.",
  },
  contact: {
    title: "Contact",
    description: "Contact The Rainbow Hub about quizzes, privacy, accessibility, or site issues.",
  },
  accessibility: {
    title: "Accessibility",
    description: "Accessibility statement for The Rainbow Hub.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description: "How The Rainbow Hub collects, uses, shares, and protects visitor information.",
  },
  "cookie-policy": {
    title: "Cookie Policy",
    description: "How The Rainbow Hub uses cookies, pixels, local storage, and similar technologies.",
  },
  "terms-of-use": {
    title: "Terms of Use",
    description: "Terms governing use of The Rainbow Hub quizzes and website.",
  },
  disclaimer: {
    title: "Disclaimer",
    description: "Important limitations for quiz scores, pass rates, and academic-style tests.",
  },
};

const infoPagesDirectory = path.join(process.cwd(), "data", "info-pages");

export function isInfoPageSlug(slug: string): slug is InfoPageSlug {
  return infoPageSlugs.includes(slug as InfoPageSlug);
}

export function getInfoPage(locale: string, slug: InfoPageSlug): InfoPage {
  const safeLocale: SupportedLocale = isSupportedLocale(locale) ? locale : getDefaultLocale();
  const filePath = path.join(infoPagesDirectory, `${safeLocale}.json`);
  const pages = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<InfoPageSlug, InfoPage>;

  return pages[slug];
}

export function getInfoPageMetadata(locale: string, slug: InfoPageSlug) {
  const page = getInfoPage(locale, slug);
  const firstSection = page.sections[0];
  const description = firstSection.paragraphs?.[0] ?? firstSection.list?.[0] ?? infoPageMetadata[slug].description;

  return {
    title: page.title,
    description,
  };
}
