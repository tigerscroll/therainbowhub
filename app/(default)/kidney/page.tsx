import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("kidney");

export const metadata = buildArticleMetadata(article);

export default function KidneyArticlePage() {
  return <ArticleTemplate article={article} />;
}
