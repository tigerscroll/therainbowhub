import { QuizEngine } from "@/components/quiz/QuizEngine";
import { ExperienceThemeBoundary } from "@/components/experience/ExperienceThemeBoundary";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";
import { siteConfig } from "@/lib/siteConfig";

export function ArticleQuiz({ locale, quiz, translations }: {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
}) {
  return (
    <section className="article-quiz" data-embedded-quiz={quiz.slug} id="article-quiz">
      <ExperienceThemeBoundary shellCssHref={quiz.shellCssHref} theme={quiz.theme} themeCssHref={quiz.themeCssHref}>
        <div className="quiz-engine__flow-container">
          <QuizEngine key={`${locale}:${quiz.slug}`} locale={locale} quiz={quiz} recommendations={[]}
            scrollTargetId="article-quiz" showAbout={false} startInstructionEnabled={siteConfig.rewardedStartInstructionEnabled} translations={translations} />
        </div>
      </ExperienceThemeBoundary>
    </section>
  );
}
