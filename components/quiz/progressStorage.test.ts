import assert from "node:assert/strict";
import test from "node:test";

import { getQuizStorageKey, isProgressTimestampFresh, PROGRESS_TTL_MS } from "./progressStorage.ts";

const now = Date.parse("2026-08-12T12:00:00.000Z");

test("quiz progress remains valid for less than 30 minutes", () => {
  assert.equal(isProgressTimestampFresh(new Date(now - PROGRESS_TTL_MS + 1).toISOString(), now), true);
});

test("quiz progress expires at 30 minutes", () => {
  assert.equal(isProgressTimestampFresh(new Date(now - PROGRESS_TTL_MS).toISOString(), now), false);
  assert.equal(isProgressTimestampFresh(new Date(now - PROGRESS_TTL_MS - 1).toISOString(), now), false);
});

test("invalid, missing and future timestamps cannot restore progress", () => {
  assert.equal(isProgressTimestampFresh(undefined, now), false);
  assert.equal(isProgressTimestampFresh("not-a-date", now), false);
  assert.equal(isProgressTimestampFresh(new Date(now + 1).toISOString(), now), false);
});

test("storage remains isolated by quiz and locale", () => {
  assert.equal(getQuizStorageKey("iq", "en"), "rainbowhub:quiz-progress:v3:iq:en");
  assert.notEqual(getQuizStorageKey("iq", "en"), getQuizStorageKey("memory", "en"));
  assert.notEqual(getQuizStorageKey("iq", "en"), getQuizStorageKey("iq", "fr"));
});
