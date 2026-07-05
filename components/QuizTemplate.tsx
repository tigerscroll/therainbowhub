import { QuizRunner } from "@/components/QuizRunner";
import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";
import type { Quiz } from "@/lib/quizzes";
import { absoluteUrl, getQuizPath } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

type QuizTemplateProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
};

export function QuizTemplate({ locale, quiz, translations }: QuizTemplateProps) {
  const themedRelatedSlugs =
    quiz.slug === "years-left"
      ? ["past-life", "zodiac", "soulmate", "memory", "narcissist", "connection"]
      : [];
  const relatedQuizzes = getAllQuizzes(locale, { includeFallback: false })
    .filter((item) => item.slug !== quiz.slug)
    .sort((a, b) => {
      const aThemeRank = themedRelatedSlugs.indexOf(a.slug);
      const bThemeRank = themedRelatedSlugs.indexOf(b.slug);

      if (aThemeRank !== -1 || bThemeRank !== -1) {
        return (aThemeRank === -1 ? themedRelatedSlugs.length : aThemeRank) - (bThemeRank === -1 ? themedRelatedSlugs.length : bThemeRank);
      }

      return Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.title.localeCompare(b.title);
    })
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: quiz.homepage.title ?? quiz.title,
    description: quiz.seoDescription ?? quiz.summary,
    inLanguage: locale,
    numberOfQuestions: quiz.questions.length,
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
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <QuizRunner locale={locale} quiz={quiz} relatedQuizzes={relatedQuizzes} translations={translations} />
    </>
  );
}
