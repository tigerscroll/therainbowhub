import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("skincancer");

export const metadata = buildArticleMetadata(article);

export default function SkinCancerArticlePage() {
  return <ArticleTemplate article={article} />;
}
