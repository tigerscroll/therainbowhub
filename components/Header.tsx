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
  currentPath: string;
  locale: SupportedLocale;
  translations: Translations;
};

function localizedPath(locale: SupportedLocale, path: string) {
  return locale === getDefaultLocale() ? path : getLocalePath(locale, path);
}

export function Header({ currentPath, locale, translations }: HeaderProps) {
  const quizSlug = currentPath.match(/^\/([a-z0-9-]+)$/)?.[1];
  const languageOptions = getLocaleOptions().filter(
    (option) => !quizSlug || Boolean(getQuizBySlug(quizSlug, option.code)),
  );
  const currentLanguage = languageOptions.find((option) => option.code === locale) ?? languageOptions[0];

  return (
    <header className="hub-header">
      <div className="hub-header__inner">
        <Link className="hub-brand" href={getLocalePath(locale, "/")}>
          <span aria-hidden="true" className="hub-brand__mark">🌈</span>
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
                <Link href={getLocalePath(locale, "/")}>{translations.nav.home}</Link>
                <Link href={getLocalePath(locale, "/info/about")}>{translations.footer.links.about}</Link>
                <Link href={getLocalePath(locale, "/info/contact")}>{translations.footer.links.contact}</Link>
                <Link href={getLocalePath(locale, "/info/accessibility")}>{translations.footer.links.accessibility}</Link>
              </nav>
            </div>
            <div className="site-menu__language-section">
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
                      href={localizedPath(option.code, currentPath)}
                      hrefLang={option.code}
                      key={option.code}
                      lang={option.code}
                    >
                      <span aria-hidden="true">{option.flag}</span>
                      <span>{option.name}</span>
                      <span aria-hidden="true" className="site-menu__language-check">✓</span>
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
