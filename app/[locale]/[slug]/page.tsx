import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { getAllArticleManifests, getArticleByRouteSlug } from "@/lib/articles";
import { getDefaultLocale, isSupportedLocale } from "@/lib/i18n";

type LocalizedArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const manifests = getAllArticleManifests();
  const localized = manifests
    .filter((article) => article.locale !== getDefaultLocale() && isSupportedLocale(article.locale))
    .map((article) => ({ locale: article.locale, slug: article.routeSlug ?? article.slug }));
  if (localized.length) return localized;

  // Next static export rejects an empty dynamic route. Keep one canonicalized
  // default-locale build target until the first translated manifest is added.
  const fallback = manifests.find((article) => article.locale === getDefaultLocale());
  return fallback ? [{ locale: fallback.locale, slug: fallback.routeSlug ?? fallback.slug }] : [];
}

export async function generateMetadata({ params }: LocalizedArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) return {};
  const article = getArticleByRouteSlug(slug, locale);
  return article ? buildArticleMetadata(article) : {};
}

export default async function LocalizedArticlePage({ params }: LocalizedArticlePageProps) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const article = getArticleByRouteSlug(slug, locale);
  if (!article) notFound();
  return <ArticleTemplate article={article} />;
}
