import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { DocumentLocale } from "@/components/DocumentLocale";
import { TrackingPageView } from "@/components/TrackingPageView";
import { getLocaleDirection, type SupportedLocale, type Translations } from "@/lib/i18n";
import type { QuizTheme } from "@/lib/quizzes";
import type { CSSProperties } from "react";

type SiteShellProps = {
  availableLocales?: SupportedLocale[];
  children: React.ReactNode;
  currentPath: string;
  locale: SupportedLocale;
  localePaths?: Partial<Record<SupportedLocale, string>>;
  translations: Translations;
  quizTheme?: QuizTheme;
};

export function SiteShell({ availableLocales, children, currentPath, locale, localePaths, quizTheme, translations }: SiteShellProps) {
  const direction = getLocaleDirection(locale);
  const shellStyle = quizTheme ? {
    "--site-chrome-primary": quizTheme.colors.primary,
    "--site-chrome-primary-text": quizTheme.colors.primaryText,
    "--site-chrome-surface": quizTheme.colors.surface,
    "--site-chrome-surface-raised": quizTheme.colors.surfaceRaised,
    "--site-chrome-text": quizTheme.colors.text,
    "--site-chrome-muted": quizTheme.colors.muted,
    "--site-chrome-correct": quizTheme.colors.correct,
    "--site-header-background": `color-mix(in srgb, ${quizTheme.colors.primary} 8%, ${quizTheme.colors.surfaceRaised})`,
    "--site-header-text": quizTheme.colors.text,
    "--site-header-border": `color-mix(in srgb, ${quizTheme.colors.primary} 42%, transparent)`,
    "--site-header-shadow": "none",
    "--site-footer-background": `color-mix(in srgb, ${quizTheme.colors.primary} 5%, ${quizTheme.colors.surface})`,
    "--site-footer-text": quizTheme.colors.text,
    "--site-footer-border": quizTheme.colors.primary,
    "--site-footer-accent": quizTheme.colors.primary,
  } as CSSProperties : undefined;

  return (
    <div className="site-shell" dir={direction} style={shellStyle}>
      <DocumentLocale direction={direction} locale={locale} />
      <TrackingPageView />
      <Header availableLocales={availableLocales} currentPath={currentPath} locale={locale} localePaths={localePaths} translations={translations} />
      <main className="site-content" style={quizTheme ? { background: quizTheme.colors.page } : undefined}>{children}</main>
      <Footer locale={locale} translations={translations} />
    </div>
  );
}
