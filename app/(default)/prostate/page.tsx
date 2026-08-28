import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("prostate");

export const metadata = buildArticleMetadata(article);

export default function ProstateArticlePage() {
  return <ArticleTemplate article={article} />;
}
