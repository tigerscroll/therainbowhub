import { localizeInternalPath } from "@/lib/localePath";
export { localeLanguageTag } from "@/lib/localePath";

const siteLocaleOptions = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ar", name: "Arabic", flag: "🌐" },
  { code: "gr", name: "Greek", flag: "🇬🇷" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "bn", name: "Bengali", flag: "🇧🇩" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "ur", name: "Urdu", flag: "🇵🇰" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
] as const;

// These editions localize quiz content and its interface, not the home or legal pages.
const quizLocaleOptions = [
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "zh", name: "Chinese", flag: "🌐" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ru", name: "Russian", flag: "🌐" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "ta", name: "Tamil", flag: "🌐" },
  { code: "te", name: "Telugu", flag: "🌐" },
  { code: "mr", name: "Marathi", flag: "🌐" },
  { code: "pa", name: "Punjabi (Gurmukhi)", flag: "🌐" },
  { code: "jv", name: "Javanese", flag: "🇮🇩" },
  { code: "gu", name: "Gujarati", flag: "🌐" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "sw", name: "Swahili", flag: "🌐" },
  { code: "fa", name: "Persian", flag: "🌐" },
  { code: "ml", name: "Malayalam", flag: "🌐" },
  { code: "kn", name: "Kannada", flag: "🌐" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "he", name: "Hebrew", flag: "🌐" },
  { code: "km", name: "Khmer", flag: "🇰🇭" },
  { code: "si", name: "Sinhala", flag: "🇱🇰" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "nb", name: "Norwegian (Bokmål)", flag: "🇳🇴" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "sk", name: "Slovak", flag: "🇸🇰" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
  { code: "hr", name: "Croatian", flag: "🇭🇷" },
  { code: "sr", name: "Serbian", flag: "🇷🇸" },
  { code: "ne", name: "Nepali", flag: "🇳🇵" },
] as const;

export const localeOptions = [...siteLocaleOptions, ...quizLocaleOptions] as const;
export type SupportedLocale = (typeof localeOptions)[number]["code"];
export type SiteLocale = (typeof siteLocaleOptions)[number]["code"];

export const defaultLocale: SiteLocale = "en";
export const supportedLocales: SupportedLocale[] = localeOptions.map((locale) => locale.code);
const siteLocales: SiteLocale[] = siteLocaleOptions.map((locale) => locale.code);

export function getDefaultLocale() {
  return defaultLocale;
}

export function getSupportedLocales() {
  return supportedLocales;
}

export function getSiteLocales() {
  return siteLocales;
}

export function isSiteLocale(locale: string): locale is SiteLocale {
  return siteLocales.includes(locale as SiteLocale);
}

export function getLocaleOptions() {
  return localeOptions;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}

export function getLocalePath(locale: string, href: string) {
  const safeLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const prefixes = supportedLocales;
  if (!isSiteLocale(safeLocale)) {
    const englishPath = localizeInternalPath(defaultLocale, href, prefixes, defaultLocale);
    const pathname = englishPath.split(/[?#]/, 1)[0];
    if (pathname === "/" || pathname === "/info" || pathname.startsWith("/info/")) return englishPath;
  }
  return localizeInternalPath(safeLocale, href, prefixes, defaultLocale);
}
