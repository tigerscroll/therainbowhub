import { QuizEngine } from "@/components/quiz/QuizEngine";
import { getQuizStorageKey, PROGRESS_TTL_MS } from "@/components/quiz/progressStorage";
import { QuizThemeBoundary } from "@/components/quiz/QuizThemeBoundary";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";
import { absoluteUrl, getQuizPath } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

type QuizTemplateProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
};

export function QuizTemplate({ locale, quiz, translations }: QuizTemplateProps) {
  const storageKey = getQuizStorageKey(quiz.slug, locale);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: quiz.title,
    description: quiz.summary,
    inLanguage: locale,
    url: absoluteUrl(getQuizPath(locale, quiz.slug)),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
      <style
        data-quiz-boot-background={quiz.slug}
        dangerouslySetInnerHTML={{
          __html: `html,body{background:${quiz.theme.colors.page}}`,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{document.documentElement.style.background=${JSON.stringify(quiz.theme.colors.page)};document.body.style.background=${JSON.stringify(quiz.theme.colors.page)};var k=${JSON.stringify(storageKey)},r=window.localStorage.getItem(k);if(r){var p=JSON.parse(r),t=Date.parse(p.updatedAt),a=Date.now()-t;if(Number.isFinite(t)&&a>=0&&a<${PROGRESS_TTL_MS}){document.documentElement.classList.add("quiz-resuming")}else{window.localStorage.removeItem(k)}}}catch(e){try{window.localStorage.removeItem(${JSON.stringify(storageKey)})}catch(x){}}})();`,
        }}
      />
      <QuizThemeBoundary customCss={quiz.customCss} theme={quiz.theme}>
        <QuizEngine locale={locale} quiz={quiz} translations={translations} />
      </QuizThemeBoundary>
    </>
  );
}
