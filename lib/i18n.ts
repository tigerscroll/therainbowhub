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
  { code: "pt", name: "Portuguese (Portugal)", flag: "🇵🇹" },
  { code: "pt-br", name: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "ar", name: "Arabic", flag: "🇦🇪" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "lt", name: "Lithuanian", flag: "🇱🇹" },
  { code: "lv", name: "Latvian", flag: "🇱🇻" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "he", name: "Hebrew", flag: "🇮🇱" },
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
