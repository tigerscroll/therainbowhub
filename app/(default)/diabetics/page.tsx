import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("diabetics");

export const metadata = buildArticleMetadata(article);

export default function DiabeticsArticlePage() {
  return <ArticleTemplate article={article} />;
}
