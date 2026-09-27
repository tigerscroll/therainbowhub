"use client";

import { ExperienceLanding } from "@/components/experience/ExperienceLanding";
import { ExperienceThemeBoundary } from "@/components/experience/ExperienceThemeBoundary";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";

export type ArticleQuizPreviewData = Pick<Quiz, "slug" | "title" | "cardIcon" | "landing" | "theme" | "shellCssHref" | "themeCssHref"> & { adNote?: string };

export function ArticleQuizPreview({ quizzes, locale, translations }: {
  quizzes: ArticleQuizPreviewData[];
  locale: SupportedLocale;
  translations: Translations;
}) {
  return <div className="article-quiz-previews">
    {quizzes.map(quiz => <section className="article-quiz" data-article-quiz-preview={quiz.slug} key={quiz.slug}>
      <ExperienceThemeBoundary theme={quiz.theme} shellCssHref={quiz.shellCssHref}>
        <div className="quiz-engine__flow-container">
          <ExperienceLanding title={quiz.title} icon={quiz.cardIcon} intro={quiz.landing.quickStartText}
            avatars={quiz.landing.socialAvatars} busy={false} busyLabel={translations.ad.loading}
            ctaLabel={translations.quiz.start} adNote={quiz.adNote}
            className={quiz.landing.compact ? "quiz-engine__landing--compact" : undefined}
            ctaIcon={quiz.landing.compact ? "→" : undefined} ctaIconPosition={quiz.landing.compact ? "end" : undefined}
            showSocialProof={quiz.landing.showSocialProof}
            socialProofText={translations.quiz.socialProofTaken.replace("{count}", new Intl.NumberFormat(locale).format(quiz.landing.socialProofCount))}
            onStart={() => { document.documentElement.dataset.articleQuizStart = quiz.slug; }} />
        </div>
      </ExperienceThemeBoundary>
    </section>)}
  </div>;
}
