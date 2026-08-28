import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("mobilityscooter");

export const metadata = buildArticleMetadata(article);

export default function MobilityscooterArticlePage() {
  return <ArticleTemplate article={article} />;
}
