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

  return (
    <header className="hub-header">
      <div className="hub-header__inner">
        <Link className="hub-brand" href={getLocalePath(locale, "/")}>
          <span className="hub-brand__mark">🌈</span>
          <span>{translations.site.name}</span>
        </Link>
        <details className="site-menu">
          <summary aria-label={translations.nav.quickLinks}>
            <span /><span /><span />
          </summary>
          <div className="site-menu__panel">
            <nav aria-label={translations.nav.quickLinks}>
              <Link href={getLocalePath(locale, "/")}>{translations.nav.home}</Link>
              <Link href={getLocalePath(locale, "/info/contact")}>{translations.footer.links.contact}</Link>
            </nav>
            <div className="site-menu__languages">
              <strong>{translations.locale.switcherLabel}</strong>
              {languageOptions.map((option) => (
                <Link
                  aria-current={option.code === locale ? "page" : undefined}
                  href={localizedPath(option.code, currentPath)}
                  key={option.code}
                >
                  <span aria-hidden="true">{option.flag}</span> {option.name}
                </Link>
              ))}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
