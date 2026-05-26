import fs from "node:fs";
import path from "node:path";

import en from "@/data/i18n/en.json";

export type Translations = typeof en;
export type SupportedLocale = "en" | "es";

const defaultLocale: SupportedLocale = "en";
const supportedLocales: SupportedLocale[] = ["en", "es"];
const rtlLocales = new Set<SupportedLocale>([]);
const i18nDirectory = path.join(process.cwd(), "data", "i18n");

export function getDefaultLocale() {
  return defaultLocale;
}

export function getSupportedLocales() {
  return supportedLocales;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}

export function getLocaleDirection(locale: string) {
  return rtlLocales.has(locale as SupportedLocale) ? "rtl" : "ltr";
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
