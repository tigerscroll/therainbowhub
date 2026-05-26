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
  return (
    <div className="flex min-h-screen flex-col" dir={getLocaleDirection(locale)} lang={locale}>
      <TrackingPageView />
      <Header currentPath={currentPath} locale={locale} translations={translations} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} translations={translations} />
    </div>
  );
}
