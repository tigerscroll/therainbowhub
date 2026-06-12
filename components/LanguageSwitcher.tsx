import {
  getDefaultLocale,
  getLocaleOptions,
  getLocalePath,
  getSupportedLocales,
  type SupportedLocale,
  type Translations,
} from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: SupportedLocale;
  path: string;
  translations: Translations;
};

const localeOptions = getLocaleOptions();
const languageNames = Object.fromEntries(localeOptions.map((option) => [option.code, option.name])) as Record<SupportedLocale, string>;
const languageFlags = Object.fromEntries(localeOptions.map((option) => [option.code, option.flag])) as Record<SupportedLocale, string>;

function getSwitcherHref(locale: SupportedLocale, path: string) {
  const defaultLocale = getDefaultLocale();
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
