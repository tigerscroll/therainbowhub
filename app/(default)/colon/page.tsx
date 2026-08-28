import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("colon");

export const metadata = buildArticleMetadata(article);

export default function ColonArticlePage() {
  return <ArticleTemplate article={article} />;
}
