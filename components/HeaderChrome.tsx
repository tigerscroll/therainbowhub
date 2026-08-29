import Link from "next/link";

import type { SupportedLocale, Translations } from "@/lib/i18n";

export type HeaderLanguageOption = {
  code: SupportedLocale;
  flag: string;
  href: string;
  name: string;
};

type HeaderChromeProps = {
  homePath: string;
  languageOptions: HeaderLanguageOption[];
  locale: SupportedLocale;
  translations: Translations;
};

export function HeaderChrome({ homePath, languageOptions, locale, translations }: HeaderChromeProps) {
  const currentLanguage = languageOptions.find((option) => option.code === locale) ?? languageOptions[0];

  return (
    <header className="hub-header">
      <div className="hub-header__inner">
        <Link className="hub-brand" href={homePath} prefetch={false}>
          <span aria-hidden="true" className="hub-brand__mark">
            <HeaderBrandMark />
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
                <Link href={homePath} prefetch={false}>{translations.nav.home}</Link>
                <Link href={`${homePath === "/" ? "" : homePath}/info/about`} prefetch={false}>{translations.footer.links.about}</Link>
                <Link href={`${homePath === "/" ? "" : homePath}/info/contact`} prefetch={false}>{translations.footer.links.contact}</Link>
                <Link href={`${homePath === "/" ? "" : homePath}/info/accessibility`} prefetch={false}>{translations.footer.links.accessibility}</Link>
              </nav>
            </div>
            {languageOptions.length > 1 && currentLanguage ? (
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
                        href={option.href}
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
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </header>
  );
}

function HeaderBrandMark() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M3.5 16.5a8.5 8.5 0 0 1 17 0" fill="none" stroke="#c83f55" strokeLinecap="round" strokeWidth="2" />
      <path d="M6 16.5a6 6 0 0 1 12 0" fill="none" stroke="#ed8d37" strokeLinecap="round" strokeWidth="2" />
      <path d="M8.5 16.5a3.5 3.5 0 0 1 7 0" fill="none" stroke="#46905f" strokeLinecap="round" strokeWidth="2" />
      <path d="M11 16.5a1 1 0 0 1 2 0" fill="none" stroke="#3979aa" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
