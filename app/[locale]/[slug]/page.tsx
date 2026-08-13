import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, getQuizBySlug, getQuizLocales } from "@/lib/quizzes";
import { buildMetadata, getQuizPath, localizedQuizAlternates } from "@/lib/seo";

type LocaleQuizPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const defaultLocale = getDefaultLocale();
  return getAllQuizzes(defaultLocale).flatMap((quiz) =>
    getQuizLocales(quiz.slug)
      .filter((locale) => locale !== defaultLocale)
      .map((locale) => ({ locale, slug: quiz.slug })),
  );
}

export async function generateMetadata({ params }: LocaleQuizPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const quiz = getQuizBySlug(slug, locale);

  if (!isSupportedLocale(locale) || locale === getDefaultLocale() || !quiz) {
    return {};
  }

  return buildMetadata({
    alternates: localizedQuizAlternates(locale, quiz.slug),
    description: quiz.summary,
    image: {
      alt: quiz.title,
      height: 540,
      path: `/quizzes/${quiz.slug}/assets/thumbnail-960.webp`,
      width: 960,
    },
    locale,
    path: getQuizPath(locale, quiz.slug),
    title: quiz.title,
  });
}

export default async function LocaleQuizPage({ params }: LocaleQuizPageProps) {
  const { locale, slug } = await params;
  const quiz = getQuizBySlug(slug, locale);

  if (!isSupportedLocale(locale) || locale === getDefaultLocale() || !quiz) {
    notFound();
  }

  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath={`/${quiz.slug}`} locale={locale} quizTheme={quiz.theme} translations={translations}>
      <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
