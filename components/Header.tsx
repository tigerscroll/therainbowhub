import Link from "next/link";
import { QuizSearch } from "@/components/QuizSearch";
import {
  getDefaultLocale,
  getLocaleOptions,
  getLocalePath,
  type SupportedLocale,
  type Translations,
} from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";

type HeaderProps = {
  currentPath: string;
  locale: SupportedLocale;
  translations: Translations;
};

function getSwitcherHref(locale: SupportedLocale, path: string) {
  const defaultLocale = getDefaultLocale();
  return locale === defaultLocale ? path : getLocalePath(locale, path);
}

export function Header({ currentPath, locale, translations }: HeaderProps) {
  const searchItems = getAllQuizzes(locale, { includeFallback: false }).map((quiz) => ({
    category: quiz.eyebrow,
    href: getLocalePath(locale, `/${quiz.slug}`),
    summary: quiz.homepage.summary ?? quiz.summary,
    title: quiz.homepage.title ?? quiz.title,
  }));
  const navLinks = [
    { href: getLocalePath(locale, "/"), label: translations.nav.home },
    { href: getLocalePath(locale, "/info/about"), label: translations.footer.links.about },
    { href: getLocalePath(locale, "/info/contact"), label: translations.footer.links.contact },
  ];
  const languageOptions = getLocaleOptions();
  const currentLanguage = languageOptions.find((option) => option.code === locale) ?? languageOptions[0];
  const languageLinks = languageOptions.map((option) => ({
    flag: option.flag,
    href: getSwitcherHref(option.code, currentPath),
    isCurrent: option.code === locale,
    label: option.name,
  }));

  return (
    <header className="hub-header">
      <div className="hub-header__inner">
        <Link className="hub-brand" href={getLocalePath(locale, "/")}>
          <span className="hub-brand__mark">🌈</span>
          <span className="hub-brand__name">{translations.site.name}</span>
        </Link>
        <QuizSearch
          currentLanguage={{
            flag: currentLanguage.flag,
            label: currentLanguage.name,
          }}
          items={searchItems}
          labels={translations.search}
          languageLabel={translations.locale.switcherLabel}
          languageLinks={languageLinks}
          navLinks={navLinks}
        />
      </div>
    </header>
  );
}
