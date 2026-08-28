export function getArticleChapterPath(articlePath: string, section?: number) {
  const basePath = articlePath === "/" ? "" : articlePath.replace(/\/+$/, "");
  return section ? `${basePath}/${section}` : (basePath || "/");
}

export function parseArticleChapter(section: string, sectionCount: number) {
  if (!/^\d+$/.test(section)) return null;
  const value = Number(section);
  return Number.isInteger(value) && value >= 1 && value <= sectionCount ? value : null;
}
