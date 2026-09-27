import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { splitArticlePreview } from "./articlePreview.ts";
import { isArticleManifest, type ArticleSection } from "./articleSchema.ts";

const sections: ArticleSection[] = [
  { title: "A", intro: "", points: [{ title: "1", paragraphs: ["one"] }, { title: "2", paragraphs: ["two"] }], conclusion: { copy: "End A", eyebrow: "" } },
  { title: "B", intro: "", points: [{ title: "3", paragraphs: ["three"] }] },
];

test("preview partitions sections without losing or repeating content", () => {
  const { preview, remaining } = splitArticlePreview(sections, 1);
  assert.equal(preview[0].conclusion, undefined);
  assert.equal(remaining[0].conclusion?.copy, "End A");
  assert.deepEqual([...preview, ...remaining].flatMap(section => section.points.map(point => point.title)), ["1", "2", "3"]);
  assert.deepEqual(sections[0].points.map(point => point.title), ["1", "2"]);
  assert.deepEqual(splitArticlePreview(sections, Infinity), { preview: sections, remaining: [] });
});

test("monetize has a genuine introduction, gated main guide and no images", () => {
  const article = JSON.parse(fs.readFileSync("data/articles/monetize/en.json", "utf8"));
  assert.equal(isArticleManifest(article), true);
  assert.equal(article.path, "/monetize");
  assert.equal(article.monetization.cta, "Continue article");
  assert.match(article.monetization.adNote, /ad.*unlock/i);
  assert.equal(article.monetization.previewPoints, 1);
  assert.equal(article.monetization.copy, "");
  const { preview, remaining } = splitArticlePreview(article.sections, article.monetization.previewPoints);
  assert.match(preview[0].points[0].title, /Start with a plan/);
  assert.match(remaining[0].points[0].title, /check what your account/);
  assert.equal(article.sections.flatMap((section: ArticleSection) => section.points).some((point: { image?: unknown }) => point.image), false);
  assert.equal(isArticleManifest({ ...article, layout: "gated" }), false);
  for (const previewPoints of [-1, 0, 1.5, 100]) {
    assert.equal(isArticleManifest({ ...article, monetization: { ...article.monetization, previewPoints } }), false);
  }
});
