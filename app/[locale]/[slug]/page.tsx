import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getTwoSegmentContentRoutes } from "@/lib/contentCatalogue";
import { getDefaultLocale, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { getQuizBySlug } from "@/lib/quizzes";
import { buildMetadata, getQuizPath, localizedQuizAlternates } from "@/lib/seo";

type LocalizedQuizPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getTwoSegmentContentRoutes().map(({ first: locale, second: slug }) => ({ locale, slug }));
}

export async function generateMetadata({ params }: LocalizedQuizPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale) || locale === getDefaultLocale()) return {};
  const quiz = getQuizBySlug(slug, locale);
  if (!quiz) return {};

  return buildMetadata({
    alternates: localizedQuizAlternates(locale, quiz.slug),
    description: quiz.summary,
    image: quiz.thumbnailUrl ? {
      alt: quiz.title,
      height: 540,
      path: quiz.thumbnailUrl,
      width: 960,
    } : undefined,
    locale,
    path: getQuizPath(locale, quiz.slug),
    title: quiz.title,
  });
}

export default async function LocalizedQuizPage({ params }: LocalizedQuizPageProps) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale) || locale === getDefaultLocale()) notFound();
  const quiz = getQuizBySlug(slug, locale);
  if (!quiz) notFound();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath={getQuizPath(locale, quiz.slug)} locale={locale} quizTheme={quiz.theme} translations={translations}>
      <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
