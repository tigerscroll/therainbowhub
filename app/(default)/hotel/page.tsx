import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("hotel");

export const metadata = buildArticleMetadata(article);

export default function HotelArticlePage() {
  return <ArticleTemplate article={article} />;
}
