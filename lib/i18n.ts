import fs from "node:fs";
import path from "node:path";

import en from "@/data/i18n/en.json";

export type Translations = typeof en;
export const localeOptions = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
] as const;

export type SupportedLocale = (typeof localeOptions)[number]["code"];
export type LocaleOption = (typeof localeOptions)[number];

const defaultLocale: SupportedLocale = "en";
const supportedLocales: SupportedLocale[] = localeOptions.map((locale) => locale.code);
const i18nDirectory = path.join(process.cwd(), "data", "i18n");

export function getDefaultLocale() {
  return defaultLocale;
}

export function getSupportedLocales() {
  return supportedLocales;
}

export function getLocaleOptions() {
  return localeOptions;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}

export function getLocaleDirection(locale: string) {
  return getTranslations(locale).locale.direction;
}

export function getTranslations(locale: string): Translations {
  const safeLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const filePath = path.join(i18nDirectory, `${safeLocale}.json`);

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Translations;
}

export function getLocalePath(locale: string, href: string) {
  const normalizedHref = href.startsWith("/") ? href : `/${href}`;

  if (!isSupportedLocale(locale) || locale === defaultLocale) {
    return normalizedHref;
  }

  return `/${locale}${normalizedHref === "/" ? "" : normalizedHref}`;
}
