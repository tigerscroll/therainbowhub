import { localizeInternalPath } from "@/lib/localePath";

export const localeOptions = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ar", name: "Arabic", flag: "🌐" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "nb", name: "Norwegian", flag: "🇳🇴" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
  { code: "hr", name: "Croatian", flag: "🇭🇷" },
  { code: "sr", name: "Serbian", flag: "🇷🇸" },
  { code: "sk", name: "Slovak", flag: "🇸🇰" },
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
