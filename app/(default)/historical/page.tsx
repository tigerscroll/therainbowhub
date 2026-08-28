import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("historical");

export const metadata = buildArticleMetadata(article);

export default function HistoricalArticlePage() {
  return <ArticleTemplate article={article} />;
}
