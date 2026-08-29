import { HeaderChrome, type HeaderLanguageOption } from "@/components/HeaderChrome";
import {
  getDefaultLocale,
  getLocaleOptions,
  getLocalePath,
  type SupportedLocale,
  type Translations,
} from "@/lib/i18n";
import { getQuizBySlug } from "@/lib/quizzes";

type HeaderProps = {
  availableLocales?: SupportedLocale[];
  currentPath: string;
  locale: SupportedLocale;
  localePaths?: Partial<Record<SupportedLocale, string>>;
  translations: Translations;
};

function localizedPath(locale: SupportedLocale, path: string) {
  return locale === getDefaultLocale() ? path : getLocalePath(locale, path);
}

export function Header({ availableLocales, currentPath, locale, localePaths, translations }: HeaderProps) {
  const quizSlug = currentPath.match(/^\/([a-z0-9-]+)$/)?.[1];
  const availableLocaleSet = availableLocales ? new Set(availableLocales) : undefined;
  const languageOptions = getLocaleOptions().filter(
    (option) => (!availableLocaleSet || availableLocaleSet.has(option.code))
      && (localePaths ? Boolean(localePaths[option.code]) : (!quizSlug || Boolean(getQuizBySlug(quizSlug, option.code)))),
  );
  const homePath = getLocalePath(locale, "/");
  const chromeLanguageOptions: HeaderLanguageOption[] = languageOptions.map((option) => ({
    ...option,
    href: localePaths?.[option.code] ?? localizedPath(option.code, currentPath),
  }));

  return (
    <HeaderChrome
      homePath={homePath}
      languageOptions={chromeLanguageOptions}
      locale={locale}
      translations={translations}
    />
  );
}
