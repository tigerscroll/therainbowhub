import Link from "next/link";
import {
  getDefaultLocale,
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

const languageNames: Record<SupportedLocale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ar: "العربية",
  ja: "日本語",
};

export function LanguageSwitcher({ locale, path, translations }: LanguageSwitcherProps) {
  const defaultLocale = getDefaultLocale();
  const currentLanguageName = languageNames[locale];

  return (
    <details className="language-switcher">
      <summary aria-label={translations.locale.switcherLabel}>
        <span>{currentLanguageName}</span>
      </summary>
      <div className="language-switcher__menu">
        {getSupportedLocales().map((supportedLocale) => {
          const href = supportedLocale === defaultLocale ? path : getLocalePath(supportedLocale, path);

          return (
            <Link
              key={supportedLocale}
              href={href}
              aria-current={supportedLocale === locale ? "page" : undefined}
            >
              {languageNames[supportedLocale]}
            </Link>
          );
        })}
      </div>
    </details>
  );
}
