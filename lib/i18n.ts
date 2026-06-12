import fs from "node:fs";
import path from "node:path";

import en from "@/data/i18n/en.json";

export type Translations = typeof en;
export type SupportedLocale =
  | "en"
  | "pt"
  | "pt-br"
  | "fr"
  | "es"
  | "ar"
  | "de"
  | "tr"
  | "it"
  | "nl"
  | "hu"
  | "ro"
  | "pl"
  | "ja"
  | "zh"
  | "id"
  | "bg"
  | "sv"
  | "cs"
  | "el"
  | "uk"
  | "da"
  | "no"
  | "ko"
  | "lt"
  | "lv"
  | "fi"
  | "hi"
  | "vi"
  | "th"
  | "ms"
  | "he";

export type LocaleOption = {
  code: SupportedLocale;
  name: string;
  flag: string;
};

export const localeOptions: LocaleOption[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "pt", name: "Português (Portugal)", flag: "🇵🇹" },
  { code: "pt-br", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇦🇪" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "hu", name: "Magyar", flag: "🇭🇺" },
  { code: "ro", name: "Română", flag: "🇷🇴" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "bg", name: "Български", flag: "🇧🇬" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "da", name: "Dansk", flag: "🇩🇰" },
  { code: "no", name: "Norsk", flag: "🇳🇴" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "lt", name: "Lietuvių", flag: "🇱🇹" },
  { code: "lv", name: "Latviešu", flag: "🇱🇻" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "ms", name: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "he", name: "עברית", flag: "🇮🇱" },
];

const defaultLocale: SupportedLocale = "en";
const supportedLocales: SupportedLocale[] = localeOptions.map((locale) => locale.code);
const rtlLocales = new Set<SupportedLocale>(["ar", "he"]);
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
