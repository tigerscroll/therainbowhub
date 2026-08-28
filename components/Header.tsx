import Link from "next/link";

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
  const currentLanguage = languageOptions.find((option) => option.code === locale) ?? languageOptions[0];

  return (
    <header className="hub-header">
      <div className="hub-header__inner">
        <Link className="hub-brand" href={getLocalePath(locale, "/")} prefetch={false}>
          <span aria-hidden="true" className="hub-brand__mark">
            <BrandMark />
          </span>
          <span>{translations.site.name}</span>
        </Link>
        <details className="site-menu">
          <summary aria-label={translations.nav.quickLinks}>
            <span /><span /><span />
          </summary>
          <div className="site-menu__panel">
            <div className="site-menu__section">
              <strong>{translations.nav.quickLinks}</strong>
              <nav aria-label={translations.nav.quickLinks}>
                <Link href={getLocalePath(locale, "/")} prefetch={false}>{translations.nav.home}</Link>
                <Link href={getLocalePath(locale, "/info/about")} prefetch={false}>{translations.footer.links.about}</Link>
                <Link href={getLocalePath(locale, "/info/contact")} prefetch={false}>{translations.footer.links.contact}</Link>
                <Link href={getLocalePath(locale, "/info/accessibility")} prefetch={false}>{translations.footer.links.accessibility}</Link>
              </nav>
            </div>
            {languageOptions.length > 1 ? <div className="site-menu__language-section">
              <details className="site-language-switcher">
                <summary aria-label={`${translations.locale.switcherLabel}: ${currentLanguage.name}`}>
                  <span aria-hidden="true" className="site-language-switcher__flag">{currentLanguage.flag}</span>
                  <span className="site-language-switcher__copy">
                    <small>{translations.locale.switcherLabel}</small>
                    <strong>{currentLanguage.name}</strong>
                  </span>
                  <span className="site-language-switcher__code">{currentLanguage.code.toUpperCase()}</span>
                  <span aria-hidden="true" className="site-language-switcher__chevron" />
                </summary>
                <div className="site-menu__language-options">
                  {languageOptions.map((option) => (
                    <Link
                      aria-current={option.code === locale ? "page" : undefined}
                      href={localePaths?.[option.code] ?? localizedPath(option.code, currentPath)}
                      hrefLang={option.code}
                      key={option.code}
                      lang={option.code}
                      prefetch={false}
                    >
                      <span aria-hidden="true">{option.flag}</span>
                      <span>{option.name}</span>
                      <span aria-hidden="true" className="site-menu__language-check">✓</span>
                    </Link>
                  ))}
                </div>
              </details>
            </div> : null}
          </div>
        </details>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M3.5 16.5a8.5 8.5 0 0 1 17 0" fill="none" stroke="#c83f55" strokeLinecap="round" strokeWidth="2" />
      <path d="M6 16.5a6 6 0 0 1 12 0" fill="none" stroke="#ed8d37" strokeLinecap="round" strokeWidth="2" />
      <path d="M8.5 16.5a3.5 3.5 0 0 1 7 0" fill="none" stroke="#46905f" strokeLinecap="round" strokeWidth="2" />
      <path d="M11 16.5a1 1 0 0 1 2 0" fill="none" stroke="#3979aa" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
