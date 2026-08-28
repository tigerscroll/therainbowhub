import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { parseArticleChapter } from "@/components/article/articleRouting";
import { getAllArticleManifests, getArticleByRouteSlug } from "@/lib/articles";
import { getDefaultLocale, isSupportedLocale } from "@/lib/i18n";

type LocalizedArticleChapterPageProps = {
  params: Promise<{ locale: string; section: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const manifests = getAllArticleManifests();
  const localized = manifests
    .filter((article) => article.locale !== getDefaultLocale() && isSupportedLocale(article.locale))
    .flatMap((article) => article.sections.map((_, index) => ({
      locale: article.locale,
      section: String(index + 1),
      slug: article.routeSlug ?? article.slug,
    })));
  if (localized.length) return localized;

  const fallback = manifests.find((article) => article.locale === getDefaultLocale());
  return fallback ? [{
    locale: fallback.locale,
    section: "1",
    slug: fallback.routeSlug ?? fallback.slug,
  }] : [];
}

export async function generateMetadata({ params }: LocalizedArticleChapterPageProps): Promise<Metadata> {
  const { locale, section, slug } = await params;
  if (!isSupportedLocale(locale)) return {};
  const article = getArticleByRouteSlug(slug, locale);
  if (!article) return {};
  const chapter = parseArticleChapter(section, article.sections.length);
  return chapter ? buildArticleMetadata(article, chapter) : {};
}

export default async function LocalizedArticleChapterPage({ params }: LocalizedArticleChapterPageProps) {
  const { locale, section, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const article = getArticleByRouteSlug(slug, locale);
  if (!article) notFound();
  const chapter = parseArticleChapter(section, article.sections.length);
  if (!chapter) notFound();
  return <ArticleTemplate article={article} initialSection={chapter} />;
}
