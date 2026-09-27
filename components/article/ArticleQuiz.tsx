"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ExperienceThemeBoundary } from "@/components/experience/ExperienceThemeBoundary";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";
import { siteConfig } from "@/lib/siteConfig";
import { selectArticleQuiz } from "./quizEmbedding";

const QuizEngine = dynamic(() => import("@/components/quiz/QuizEngine").then(module => module.QuizEngine));

export function ArticleQuiz({ locale, slugs, translations }: {
  locale: SupportedLocale;
  slugs: string[];
  translations: Translations;
}) {
  const query = useSearchParams();
  const slug = selectArticleQuiz(query.getAll("q"), slugs);
  const [loaded, setLoaded] = useState<{ locale: SupportedLocale; slug: string; quiz: Quiz } | null>(null);
  const [readySlug, setReadySlug] = useState<string | null>(null);
  const onReady = useCallback(() => { setReadySlug(slug ?? null); }, [slug]);

  useLayoutEffect(() => {
    if (slug && readySlug !== slug) document.documentElement.dataset.articleQuiz = slug;
    else delete document.documentElement.dataset.articleQuiz;
    if (slug && readySlug === slug && document.documentElement.dataset.articleQuizStart === slug) {
      delete document.documentElement.dataset.articleQuizStart;
      document.querySelector<HTMLButtonElement>("#article-quiz .quiz-engine__landing .quiz-engine__primary")?.click();
    }
    return () => { delete document.documentElement.dataset.articleQuiz; };
  }, [slug, readySlug]);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    void fetch(`/quiz-data/${locale}/${slug}.json`, { signal: controller.signal, cache: "no-cache" })
      .then(response => {
        if (!response.ok) throw new Error("Quiz unavailable");
        return response.json() as Promise<Quiz>;
      })
      .then(quiz => {
        if (quiz.slug !== slug) throw new Error("Quiz identity mismatch");
        if (!controller.signal.aborted) setLoaded({ locale, slug, quiz });
      })
      .catch(() => {
        if (!controller.signal.aborted) delete document.documentElement.dataset.articleQuiz;
      });
    return () => controller.abort();
  }, [locale, slug]);

  if (!slug || loaded?.slug !== slug || loaded.locale !== locale) return null;
  const quiz = loaded.quiz;
  return (
    <section className="article-quiz" data-embedded-quiz={slug} id="article-quiz" style={readySlug === slug ? undefined : { display: "none" }}>
      <ExperienceThemeBoundary shellCssHref={quiz.shellCssHref} theme={quiz.theme} themeCssHref={quiz.themeCssHref}>
        <div className="quiz-engine__flow-container">
          <QuizEngine key={`${locale}:${slug}`} locale={locale} quiz={quiz} recommendations={[]} onReady={onReady}
            scrollTargetId="article-quiz" showAbout={false} startInstructionEnabled={siteConfig.rewardedStartInstructionEnabled} translations={translations} />
        </div>
      </ExperienceThemeBoundary>
    </section>
  );
}
