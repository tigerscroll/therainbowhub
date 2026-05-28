import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getSupportedLocales, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, getQuizBySlug } from "@/lib/quizzes";

type LocaleQuizPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const defaultQuizSlugs = getAllQuizzes(getDefaultLocale()).map((quiz) => quiz.slug);

  return getSupportedLocales()
    .filter((locale) => locale !== getDefaultLocale())
    .flatMap((locale) => defaultQuizSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: LocaleQuizPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const quiz = getQuizBySlug(slug, locale);

  if (!isSupportedLocale(locale) || locale === getDefaultLocale() || !quiz) {
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

  if (!isSupportedLocale(locale) || locale === getDefaultLocale() || !quiz) {
    notFound();
  }

  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath={`/${quiz.slug}`} locale={locale} translations={translations}>
      <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
