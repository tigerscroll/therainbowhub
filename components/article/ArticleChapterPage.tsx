import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { parseArticleChapter } from "@/components/article/articleRouting";
import type { ArticleManifest } from "@/components/article/articleSchema";

export type ArticleChapterPageProps = {
  params: Promise<{ section: string }>;
};

export function getArticleChapterStaticParams(article: ArticleManifest) {
  return article.sections.map((_, index) => ({ section: String(index + 1) }));
}

export async function getArticleChapterMetadata(
  article: ArticleManifest,
  { params }: ArticleChapterPageProps,
): Promise<Metadata> {
  const { section } = await params;
  const chapter = parseArticleChapter(section, article.sections.length);
  return chapter ? buildArticleMetadata(article, chapter) : {};
}

export async function renderArticleChapter(
  article: ArticleManifest,
  { params }: ArticleChapterPageProps,
) {
  const { section } = await params;
  const chapter = parseArticleChapter(section, article.sections.length);
  if (!chapter) notFound();
  return <ArticleTemplate article={article} initialSection={chapter} />;
}
