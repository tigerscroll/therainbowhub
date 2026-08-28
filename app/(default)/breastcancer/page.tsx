import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("breastcancer");

export const metadata = buildArticleMetadata(article);

export default function BreastCancerArticlePage() {
  return <ArticleTemplate article={article} />;
}
