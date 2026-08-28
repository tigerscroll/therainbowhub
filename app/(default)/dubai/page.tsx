import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("dubai");

export const metadata = buildArticleMetadata(article);

export default function DubaiArticlePage() {
  return <ArticleTemplate article={article} />;
}
