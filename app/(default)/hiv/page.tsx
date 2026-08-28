import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("hiv");

export const metadata = buildArticleMetadata(article);

export default function HivArticlePage() {
  return <ArticleTemplate article={article} />;
}
