import assert from "node:assert/strict";
import test from "node:test";

import { ARTICLE_PROGRESS_VERSION, getArticleProgressKey, parseArticleProgress } from "./articleProgress.ts";

test("article progress is isolated by article slug", () => {
  assert.equal(getArticleProgressKey("colon"), "rainbowhub:article:colon:progress");
  assert.notEqual(getArticleProgressKey("colon"), getArticleProgressKey("prostate"));
});

test("valid article progress restores an unlocked section", () => {
  const progress = parseArticleProgress({
    version: ARTICLE_PROGRESS_VERSION,
    section: 2,
    updatedAt: "2026-08-27T10:00:00.000Z",
  }, 3);
  assert.equal(progress?.section, 2);
});

test("invalid, obsolete and out-of-range article progress is rejected", () => {
  assert.equal(parseArticleProgress(null, 3), null);
  assert.equal(parseArticleProgress({ version: 0, section: 2, updatedAt: "2026-08-27T10:00:00.000Z" }, 3), null);
  assert.equal(parseArticleProgress({ version: ARTICLE_PROGRESS_VERSION, section: 4, updatedAt: "2026-08-27T10:00:00.000Z" }, 3), null);
  assert.equal(parseArticleProgress({ version: ARTICLE_PROGRESS_VERSION, section: 2, updatedAt: "invalid" }, 3), null);
});
