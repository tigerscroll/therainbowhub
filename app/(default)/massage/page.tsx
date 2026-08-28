import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("massage");

export const metadata = buildArticleMetadata(article);

export default function MassageArticlePage() {
  return <ArticleTemplate article={article} />;
}
