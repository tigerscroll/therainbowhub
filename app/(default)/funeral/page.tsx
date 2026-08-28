import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("funeral");

export const metadata = buildArticleMetadata(article);

export default function FuneralArticlePage() {
  return <ArticleTemplate article={article} />;
}
