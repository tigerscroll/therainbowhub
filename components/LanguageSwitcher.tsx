import {
  getDefaultLocale,
  getLocaleOptions,
  getLocalePath,
  getSupportedLocales,
  type SupportedLocale,
  type Translations,
} from "@/lib/i18n";
import { getQuizLocales } from "@/lib/quizzes";

type LanguageSwitcherProps = {
  locale: SupportedLocale;
  path: string;
  translations: Translations;
};

const languageNames: Record<SupportedLocale, string> = {
  en: "English",
  pt: "Portuguese",
  fr: "French",
  es: "Spanish",
  ar: "Arabic",
  de: "German",
  tr: "Turkish",
  it: "Italian",
  nl: "Dutch",
  hu: "Hungarian",
  ro: "Romanian",
  pl: "Polish",
  ja: "Japanese",
  zh: "Chinese",
  id: "Indonesian",
  bg: "Bulgarian",
  sv: "Swedish",
  cs: "Czech",
  el: "Greek",
  uk: "Ukrainian",
  da: "Danish",
  no: "Norwegian",
  ko: "Korean",
  lt: "Lithuanian",
  lv: "Latvian",
  fi: "Finnish",
};

const languageFlags = Object.fromEntries(getLocaleOptions().map((option) => [option.code, option.flag])) as Record<SupportedLocale, string>;

function getSwitcherHref(locale: SupportedLocale, path: string) {
  const defaultLocale = getDefaultLocale();
  const quizMatch = path.match(/^\/quiz\/([^/]+)/);

  if (quizMatch) {
    const quizSlug = quizMatch[1];
    const quizLocales = getQuizLocales(quizSlug);

    if (!quizLocales.includes(locale)) {
      return getLocalePath(locale, "/");
    }
  }

  return locale === defaultLocale ? path : getLocalePath(locale, path);
}

export function LanguageSwitcher({ locale, path, translations }: LanguageSwitcherProps) {
  const currentLanguageName = languageNames[locale];

  return (
    <details className="language-switcher">
      <summary aria-label={translations.locale.switcherLabel}>
        <span><span aria-hidden="true">{languageFlags[locale]}</span>{currentLanguageName}</span>
      </summary>
      <div className="language-switcher__menu">
        {getSupportedLocales().map((supportedLocale) => {
          const href = getSwitcherHref(supportedLocale, path);

          return (
            <a
              key={supportedLocale}
              href={href}
              aria-current={supportedLocale === locale ? "page" : undefined}
            >
              <span aria-hidden="true">{languageFlags[supportedLocale]}</span>
              <span>{languageNames[supportedLocale]}</span>
            </a>
          );
        })}
      </div>
    </details>
  );
}
