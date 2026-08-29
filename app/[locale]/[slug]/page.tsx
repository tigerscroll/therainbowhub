import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { parseArticleChapter } from "@/components/article/articleRouting";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getArticleByRouteSlug } from "@/lib/articles";
import { getTwoSegmentContentRoutes } from "@/lib/contentCatalogue";
import { getDefaultLocale, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { getQuizBySlug } from "@/lib/quizzes";
import { buildMetadata, getQuizPath, localizedQuizAlternates } from "@/lib/seo";

type LocalizedArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getTwoSegmentContentRoutes().map(({ first: locale, second: slug }) => ({ locale, slug }));
}

export async function generateMetadata({ params }: LocalizedArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (isSupportedLocale(locale)) {
    const quiz = getQuizBySlug(slug, locale);
    if (quiz) {
      return buildMetadata({
        alternates: localizedQuizAlternates(locale, quiz.slug),
        description: quiz.summary,
        image: {
          alt: quiz.title,
          height: 540,
          path: `/quizzes/${quiz.slug}/assets/thumbnail-960.webp`,
          width: 960,
        },
        locale,
        path: getQuizPath(locale, quiz.slug),
        title: quiz.title,
      });
    }
    const article = getArticleByRouteSlug(slug, locale);
    return article ? buildArticleMetadata(article) : {};
  }

  const article = getArticleByRouteSlug(locale, getDefaultLocale());
  if (!article) return {};
  const chapter = parseArticleChapter(slug, article.sections.length);
  return chapter ? buildArticleMetadata(article, chapter) : {};
}

export default async function LocalizedArticlePage({ params }: LocalizedArticlePageProps) {
  const { locale, slug } = await params;
  if (isSupportedLocale(locale)) {
    const quiz = getQuizBySlug(slug, locale);
    if (quiz) {
      const translations = getTranslations(locale);
      return (
        <SiteShell currentPath={getQuizPath(locale, quiz.slug)} locale={locale} quizTheme={quiz.theme} translations={translations}>
          <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
        </SiteShell>
      );
    }
    const article = getArticleByRouteSlug(slug, locale);
    if (!article) notFound();
    return <ArticleTemplate article={article} />;
  }

  const article = getArticleByRouteSlug(locale, getDefaultLocale());
  if (!article) notFound();
  const chapter = parseArticleChapter(slug, article.sections.length);
  if (!chapter) notFound();
  return <ArticleTemplate article={article} initialSection={chapter} />;
}
