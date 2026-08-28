import assert from "node:assert/strict";
import test from "node:test";

import { getArticleChapterPath, parseArticleChapter } from "./articleRouting.ts";

test("article chapter paths keep the lander and chapters distinct", () => {
  assert.equal(getArticleChapterPath("/prostate"), "/prostate");
  assert.equal(getArticleChapterPath("/prostate", 1), "/prostate/1");
  assert.equal(getArticleChapterPath("/prostate/", 5), "/prostate/5");
  assert.equal(getArticleChapterPath("/fr/prostate", 2), "/fr/prostate/2");
});

test("article chapter parameters accept only available positive integers", () => {
  assert.equal(parseArticleChapter("1", 5), 1);
  assert.equal(parseArticleChapter("5", 5), 5);
  for (const invalid of ["0", "6", "-1", "1.5", "two", "02x"]) {
    assert.equal(parseArticleChapter(invalid, 5), null);
  }
});
