import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { getAllQuizzes, getQuizBySlug } from "@/lib/quizzes";

type QuizPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllQuizzes().map((quiz) => ({
    slug: quiz.slug,
  }));
}

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);

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

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  if (!quiz) {
    notFound();
  }

  return (
    <SiteShell currentPath={`/quiz/${quiz.slug}`} locale={locale} translations={translations}>
      <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
