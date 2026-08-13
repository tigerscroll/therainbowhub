import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePageContent } from "@/components/HomePageContent";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getSupportedLocales, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, getQuizBySlug } from "@/lib/quizzes";
import { buildMetadata, getHomePath, getQuizPath, localizedHomeAlternates, quizAlternates } from "@/lib/seo";

type SegmentPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...getSupportedLocales()
      .filter((locale) => locale !== getDefaultLocale())
      .map((locale) => ({ locale })),
    ...getAllQuizzes(getDefaultLocale()).map((quiz) => ({ locale: quiz.slug })),
  ];
}

export async function generateMetadata({ params }: SegmentPageProps): Promise<Metadata> {
  const { locale: segment } = await params;

  if (isSupportedLocale(segment) && segment !== getDefaultLocale()) {
    const translations = getTranslations(segment);

    return {
      ...buildMetadata({
        alternates: localizedHomeAlternates(segment),
        description: translations.site.description,
        locale: segment,
        path: getHomePath(segment),
        title: `${translations.site.name} - ${translations.home.headlinePrefix} ${translations.home.headlineHighlight}`,
      }),
    };
  }

  const quiz = getQuizBySlug(segment, getDefaultLocale());

  if (!quiz) {
    return {};
  }

  return buildMetadata({
    alternates: quizAlternates(quiz.slug),
    description: quiz.summary,
    image: {
      alt: quiz.title,
      height: 540,
      path: `/quizzes/${quiz.slug}/assets/thumbnail-960.webp`,
      width: 960,
    },
    path: getQuizPath(getDefaultLocale(), quiz.slug),
    title: quiz.title,
  });
}

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { locale: segment } = await params;

  if (isSupportedLocale(segment) && segment !== getDefaultLocale()) {
    const translations = getTranslations(segment);

    return (
      <SiteShell currentPath="/" locale={segment} translations={translations}>
        <HomePageContent locale={segment} translations={translations} />
      </SiteShell>
    );
  }

  const locale = getDefaultLocale();
  const translations = getTranslations(locale);
  const quiz = getQuizBySlug(segment, locale);

  if (!quiz) {
    notFound();
  }

  return (
    <SiteShell currentPath={`/${quiz.slug}`} locale={locale} quizTheme={quiz.theme} translations={translations}>
      <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
