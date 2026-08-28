import { getArticleChapterMetadata, getArticleChapterStaticParams, renderArticleChapter, type ArticleChapterPageProps } from "@/components/article/ArticleChapterPage";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("breastcancer");
export const dynamicParams = false;
export function generateStaticParams() { return getArticleChapterStaticParams(article); }
export function generateMetadata(props: ArticleChapterPageProps) { return getArticleChapterMetadata(article, props); }
export default function BreastCancerChapterPage(props: ArticleChapterPageProps) { return renderArticleChapter(article, props); }
