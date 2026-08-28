import { getArticleChapterMetadata, getArticleChapterStaticParams, renderArticleChapter, type ArticleChapterPageProps } from "@/components/article/ArticleChapterPage";
import { requireArticleBySlug } from "@/lib/articles";

const article = requireArticleBySlug("colon");
export const dynamicParams = false;
export function generateStaticParams() { return getArticleChapterStaticParams(article); }
export function generateMetadata(props: ArticleChapterPageProps) { return getArticleChapterMetadata(article, props); }
export default function ColonChapterPage(props: ArticleChapterPageProps) { return renderArticleChapter(article, props); }
