import type { ArticleSection } from "./articleSchema";

export function splitArticlePreview(sections: ArticleSection[], previewPoints: number) {
  const preview: ArticleSection[] = [];
  const remaining: ArticleSection[] = [];
  let budget = previewPoints;
  for (const section of sections) {
    const count = Math.min(budget, section.points.length);
    if (count > 0) preview.push(count === section.points.length ? section : { ...section, points: section.points.slice(0, count), conclusion: undefined });
    if (count < section.points.length) remaining.push({ ...section, points: section.points.slice(count) });
    budget -= count;
  }
  return { preview, remaining };
}
