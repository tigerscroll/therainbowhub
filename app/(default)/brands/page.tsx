import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("brands");

export const metadata = buildArticleMetadata(article);

export default function BrandsArticlePage() {
  return <ArticleTemplate article={article} />;
}
