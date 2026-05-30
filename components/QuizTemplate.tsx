import { QuizRunner } from "@/components/QuizRunner";
import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";
import type { Quiz } from "@/lib/quizzes";

type QuizTemplateProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
};

export function QuizTemplate({ locale, quiz, translations }: QuizTemplateProps) {
  const relatedQuizzes = getAllQuizzes(locale, { includeFallback: false })
    .filter((item) => item.slug !== quiz.slug)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.title.localeCompare(b.title))
    .slice(0, 4)
    .map((item) => ({
      accent: item.accent,
      duration: item.duration,
      href: getLocalePath(locale, `/${item.slug}`),
      icon: item.homepage.icon ?? item.cardIcon,
      passRate: item.passRate,
      summary: item.homepage.summary ?? item.summary,
      thumbnailAlt: item.homepage.thumbnailAlt ?? item.title,
      thumbnailUrl: item.homepage.thumbnailUrl,
      title: item.homepage.title ?? item.title,
    }));

  return <QuizRunner locale={locale} quiz={quiz} relatedQuizzes={relatedQuizzes} translations={translations} />;
}
