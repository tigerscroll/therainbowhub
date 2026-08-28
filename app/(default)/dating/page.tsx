import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("dating");

export const metadata = buildArticleMetadata(article);

export default function DatingArticlePage() {
  return <ArticleTemplate article={article} />;
}
