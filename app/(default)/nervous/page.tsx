import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("nervous");

export const metadata = buildArticleMetadata(article);

export default function NervousArticlePage() {
  return <ArticleTemplate article={article} />;
}
