import { QuizEngine } from "@/components/quiz/QuizEngine";
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
  const storageKey = `rainbowhub:quiz-progress:v2:${quiz.slug}:${locale}`;
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
          __html: `(function(){try{document.documentElement.style.background=${JSON.stringify(quiz.theme.colors.page)};document.body.style.background=${JSON.stringify(quiz.theme.colors.page)};if(window.localStorage.getItem(${JSON.stringify(storageKey)})){document.documentElement.classList.add("quiz-resuming")}}catch(e){}})();`,
        }}
      />
      <QuizThemeBoundary customCss={quiz.customCss} theme={quiz.theme}>
        <QuizEngine locale={locale} quiz={quiz} translations={translations} />
      </QuizThemeBoundary>
    </>
  );
}
