export function selectArticleQuiz(values: string[], availableSlugs: string[]): string | undefined {
  if (values.length !== 1) return undefined;
  const slug = values[0];
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && availableSlugs.includes(slug) ? slug : undefined;
}
