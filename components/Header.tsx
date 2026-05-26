import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";

type HeaderProps = {
  currentPath: string;
  locale: SupportedLocale;
  translations: Translations;
};

export function Header({ currentPath, locale, translations }: HeaderProps) {
  return (
    <header className="hub-header">
      <div className="hub-header__inner">
        <Link className="hub-brand" href={getLocalePath(locale, "/")}>
          <span className="hub-brand__mark">🌈</span>
          <span className="hub-brand__name">{translations.site.name}</span>
        </Link>
        <LanguageSwitcher locale={locale} path={currentPath} translations={translations} />
      </div>
    </header>
  );
}
