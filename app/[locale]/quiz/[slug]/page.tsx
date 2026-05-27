import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getSupportedLocales, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, getQuizBySlug } from "@/lib/quizzes";

type LocaleQuizPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getSupportedLocales()
    .filter((locale) => locale !== "en")
    .flatMap((locale) =>
      getAllQuizzes(locale, { includeFallback: false }).map((quiz) => ({
        locale,
        slug: quiz.slug,
      })),
    );
}

export async function generateMetadata({ params }: LocaleQuizPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const quiz = getQuizBySlug(slug, locale);

  if (!isSupportedLocale(locale) || locale === "en" || !quiz) {
    return {};
  }

  return {
    title: {
      absolute: `${quiz.homepage.title ?? quiz.title} - The Rainbow Hub`,
    },
    description: quiz.seoDescription ?? quiz.summary,
  };
}

export default async function LocaleQuizPage({ params }: LocaleQuizPageProps) {
  const { locale, slug } = await params;
  const quiz = getQuizBySlug(slug, locale);

  if (!isSupportedLocale(locale) || locale === "en" || !quiz) {
    notFound();
  }

  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath={`/quiz/${quiz.slug}`} locale={locale} translations={translations}>
      <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
