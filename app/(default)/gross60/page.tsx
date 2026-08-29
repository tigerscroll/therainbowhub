import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("gross60");

export const metadata = buildArticleMetadata(article);

export default function GrossAtSixtyArticlePage() {
  return <ArticleTemplate article={article} />;
}
