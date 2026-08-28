import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("beach");

export const metadata = buildArticleMetadata(article);

export default function BeachArticlePage() {
  return <ArticleTemplate article={article} />;
}
