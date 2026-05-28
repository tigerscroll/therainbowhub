import { DocumentLocale } from "@/components/DocumentLocale";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TrackingPageView } from "@/components/TrackingPageView";
import { getLocaleDirection, type SupportedLocale, type Translations } from "@/lib/i18n";

type SiteShellProps = {
  children: React.ReactNode;
  currentPath: string;
  locale: SupportedLocale;
  translations: Translations;
};

export function SiteShell({ children, currentPath, locale, translations }: SiteShellProps) {
  const direction = getLocaleDirection(locale);

  return (
    <div className="flex min-h-screen flex-col" dir={direction}>
      <DocumentLocale direction={direction} locale={locale} />
      <TrackingPageView />
      <Header currentPath={currentPath} locale={locale} translations={translations} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} translations={translations} />
    </div>
  );
}
