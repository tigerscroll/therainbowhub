import fs from "node:fs";
import path from "node:path";

import en from "@/data/i18n/en.json";

export type Translations = typeof en;
export const localeOptions = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
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
