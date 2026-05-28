import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePageContent } from "@/components/HomePageContent";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getSupportedLocales, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, getQuizBySlug } from "@/lib/quizzes";

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
      title: {
        absolute: `${translations.site.name} - ${translations.home.headlinePrefix} ${translations.home.headlineHighlight}`,
      },
      description: translations.site.description,
    };
  }

  const quiz = getQuizBySlug(segment, getDefaultLocale());

  if (!quiz) {
    return {};
  }

  return {
    title: {
      absolute: `${quiz.homepage.title ?? quiz.title} - The Rainbow Hub`,
    },
    description: quiz.seoDescription ?? quiz.summary,
  };
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
    <SiteShell currentPath={`/${quiz.slug}`} locale={locale} translations={translations}>
      <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
