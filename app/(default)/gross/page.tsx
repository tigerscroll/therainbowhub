import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("gross");

export const metadata = buildArticleMetadata(article);

export default function GrossArticlePage() {
  return <ArticleTemplate article={article} />;
}
