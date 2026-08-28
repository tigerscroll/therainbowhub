import { ArticleTemplate, buildArticleMetadata } from "@/components/article/ArticleTemplate";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("signs");

export const metadata = buildArticleMetadata(article);

export default function SignsArticlePage() {
  return <ArticleTemplate article={article} />;
}
