import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getSupportedLocales, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, getQuizBySlug, getQuizLocales } from "@/lib/quizzes";

type LocaleQuizPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const dynamicParams = false;
const emptyLocaleQuizSlug = "__no-localized-quizzes__";

export function generateStaticParams() {
  const params = getSupportedLocales()
    .filter((locale) => locale !== "en")
    .flatMap((locale) =>
      getAllQuizzes(locale, { includeFallback: false }).map((quiz) => ({
        locale,
        slug: quiz.slug,
      })),
    );

  return params.length
    ? params
    : [
        {
          locale: "es",
          slug: emptyLocaleQuizSlug,
        },
      ];
}

export async function generateMetadata({ params }: LocaleQuizPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const quiz = getQuizBySlug(slug, locale);

  if (!isSupportedLocale(locale) || locale === "en" || !quiz || !getQuizLocales(slug).includes(locale)) {
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

  if (!isSupportedLocale(locale) || locale === "en" || !quiz || !getQuizLocales(slug).includes(locale)) {
    notFound();
  }

  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath={`/quiz/${quiz.slug}`} locale={locale} translations={translations}>
      <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
