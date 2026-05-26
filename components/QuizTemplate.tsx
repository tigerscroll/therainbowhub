import { QuizRunner } from "@/components/QuizRunner";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";

type QuizTemplateProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
};

export function QuizTemplate({ locale, quiz, translations }: QuizTemplateProps) {
  return <QuizRunner locale={locale} quiz={quiz} translations={translations} />;
}
