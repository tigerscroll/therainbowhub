import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { getArticleQuizPath } from "./articleRouting.ts";
import { isArticleManifest } from "./articleSchema.ts";

test("article embeds have deterministic static paths, not query-string selectors", () => {
  assert.equal(getArticleQuizPath("/cloudstorage", "years-left"), "/cloudstorage/years-left");
  assert.equal(getArticleQuizPath("/cloudstorage/", "memory"), "/cloudstorage/memory");
  assert.equal(getArticleQuizPath("/de/cloudstorage", "vision"), "/de/cloudstorage/vision");
});

test("cloud storage is a plain, ungated English article with the requested title", () => {
  const article = JSON.parse(fs.readFileSync("data/articles/cloudstorage/en.json", "utf8"));
  assert.equal(isArticleManifest(article), true);
  assert.equal(article.layout, "plain");
  assert.equal(article.path, "/cloudstorage");
  assert.equal(article.metadata.title, "A Comprehensive Guide To Cloud Storage Including Google Cloud and Google Workspace");
  assert.equal(article.landing.title, article.metadata.title);
  assert.equal(article.sections.length, 1);
  assert.equal(article.sections[0].next, undefined);
  assert.equal(article.landing.socialProofVisible, false);
  assert.ok(article.sections[0].points.length >= 8);
});

test("plain layout and inline sources have validated types", () => {
  const article = JSON.parse(fs.readFileSync("data/articles/cloudstorage/en.json", "utf8"));
  assert.equal(isArticleManifest({ ...article, layout: "invalid" }), false);
  article.sections[0].points[0].sources = [{ label: "Reference", url: 1 }];
  assert.equal(isArticleManifest(article), false);
});
