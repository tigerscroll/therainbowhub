export const ARTICLE_PROGRESS_VERSION = 1;

export type ArticleProgress = {
  version: typeof ARTICLE_PROGRESS_VERSION;
  section: number;
  updatedAt: string;
};

export function getArticleProgressKey(slug: string) {
  return `rainbowhub:article:${slug}:progress`;
}

export function parseArticleProgress(raw: unknown, sectionCount: number): ArticleProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<ArticleProgress>;
  if (value.version !== ARTICLE_PROGRESS_VERSION) return null;
  if (!Number.isInteger(value.section) || value.section! < 1 || value.section! > sectionCount) return null;
  if (typeof value.updatedAt !== "string" || !Number.isFinite(Date.parse(value.updatedAt))) return null;
  return value as ArticleProgress;
}
