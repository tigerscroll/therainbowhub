import { localizeInternalPath } from "@/lib/localePath";

export const localeOptions = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
] as const;

export type SupportedLocale = (typeof localeOptions)[number]["code"];

export const defaultLocale: SupportedLocale = "en";
export const supportedLocales: SupportedLocale[] = localeOptions.map((locale) => locale.code);

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

export function getLocalePath(locale: string, href: string) {
  const safeLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  return localizeInternalPath(safeLocale, href, supportedLocales, defaultLocale);
}
