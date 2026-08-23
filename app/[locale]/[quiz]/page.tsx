import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import {
  getDefaultLocale,
  getSupportedLocales,
  getTranslations,
  isSupportedLocale,
} from "@/lib/i18n";
import { getAllQuizzes, getQuizBySlug } from "@/lib/quizzes";
import { buildMetadata, getQuizPath, localizedQuizAlternates } from "@/lib/seo";

type LocalizedQuizPageProps = {
  params: Promise<{
    locale: string;
    quiz: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getSupportedLocales()
    .filter((locale) => locale !== getDefaultLocale())
    .flatMap((locale) => getAllQuizzes(locale, { includeFallback: false })
      .map((quiz) => ({ locale, quiz: quiz.slug })));
}

export async function generateMetadata({ params }: LocalizedQuizPageProps): Promise<Metadata> {
  const { locale: segment, quiz: slug } = await params;

  if (!isSupportedLocale(segment) || segment === getDefaultLocale()) {
    return {};
  }

  const quiz = getQuizBySlug(slug, segment);

  if (!quiz) {
    return {};
  }

  return buildMetadata({
    alternates: localizedQuizAlternates(segment, quiz.slug),
    description: quiz.summary,
    image: {
      alt: quiz.title,
      height: 540,
      path: `/quizzes/${quiz.slug}/assets/thumbnail-960.webp`,
      width: 960,
    },
    locale: segment,
    path: getQuizPath(segment, quiz.slug),
    title: quiz.title,
  });
}

export default async function LocalizedQuizPage({ params }: LocalizedQuizPageProps) {
  const { locale: segment, quiz: slug } = await params;

  if (!isSupportedLocale(segment) || segment === getDefaultLocale()) {
    notFound();
  }

  const translations = getTranslations(segment);
  const quiz = getQuizBySlug(slug, segment);

  if (!quiz) {
    notFound();
  }

  const currentPath = getQuizPath(segment, quiz.slug);

  return (
    <SiteShell currentPath={currentPath} locale={segment} quizTheme={quiz.theme} translations={translations}>
      <QuizTemplate locale={segment} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
