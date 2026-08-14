import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { DocumentLocale } from "@/components/DocumentLocale";
import { TrackingPageView } from "@/components/TrackingPageView";
import { getLocaleDirection, type SupportedLocale, type Translations } from "@/lib/i18n";
import type { QuizTheme } from "@/lib/quizzes";
import type { CSSProperties } from "react";

type SiteShellProps = {
  children: React.ReactNode;
  currentPath: string;
  locale: SupportedLocale;
  translations: Translations;
  quizTheme?: QuizTheme;
};

export function SiteShell({ children, currentPath, locale, quizTheme, translations }: SiteShellProps) {
  const direction = getLocaleDirection(locale);
  const shellStyle = quizTheme?.header ? {
    "--site-header-background": quizTheme.header.background,
    "--site-header-text": quizTheme.header.text,
    "--site-header-border": quizTheme.header.border,
    "--site-header-shadow": quizTheme.header.shadow,
    "--site-footer-background": quizTheme.header.background,
    "--site-footer-text": quizTheme.header.text,
    "--site-footer-border": quizTheme.header.border,
    "--site-footer-accent": quizTheme.header.border,
  } as CSSProperties : undefined;

  return (
    <div className="site-shell" dir={direction} style={shellStyle}>
      <DocumentLocale direction={direction} locale={locale} />
      <TrackingPageView />
      <Header currentPath={currentPath} locale={locale} translations={translations} />
      <main className="site-content" style={quizTheme ? { background: quizTheme.colors.page } : undefined}>{children}</main>
      <Footer locale={locale} translations={translations} />
    </div>
  );
}
