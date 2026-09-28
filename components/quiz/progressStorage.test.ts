import assert from "node:assert/strict";
import test from "node:test";

import { getQuizStorageKey, isProgressTimestampFresh, PROGRESS_TTL_MS, quizProgressSignaturesMatch, readQuizProgress, removeQuizProgress, writeQuizProgress } from "./progressStorage.ts";

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
  assert.equal(getQuizStorageKey("iq", "en"), "rainbowhub:quiz-progress:v4:iq:en");
  assert.notEqual(getQuizStorageKey("iq", "en"), getQuizStorageKey("memory", "en"));
  assert.notEqual(getQuizStorageKey("iq", "en"), getQuizStorageKey("iq", "fr"));
});

test("navigation-only changes preserve attempts but changed questions do not", () => {
  const previous = { engine: { hardRefreshCheckpoints: true, startOnLoad: false, flow: { advance: "automatic" } }, questions: ["q1"] };
  const next = { ...previous, engine: { hardRefreshCheckpoints: false, startOnLoad: true, flow: { advance: "manual" } } };
  assert.equal(quizProgressSignaturesMatch(JSON.stringify(previous), JSON.stringify(next)), true);
  assert.equal(quizProgressSignaturesMatch(JSON.stringify(previous), JSON.stringify({ ...next, questions: ["q2"] })), false);
  assert.equal(quizProgressSignaturesMatch("broken", JSON.stringify(next)), false);
});

test("progress works with either storage backend, or safely stays in memory", () => {
  const original = globalThis.window;
  const memory = () => {
    const map = new Map<string, string>();
    return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); }, removeItem: (key: string) => { map.delete(key); } };
  };
  const blocked = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); }, removeItem() { throw Error("blocked"); } };
  try {
    for (const [sessionStorage, localStorage] of [[memory(), memory()], [memory(), blocked], [blocked, memory()]]) {
      globalThis.window = { sessionStorage, localStorage } as unknown as Window & typeof globalThis;
      assert.equal(writeQuizProgress("quiz", "next-state"), true);
      assert.equal(readQuizProgress("quiz"), "next-state");
      removeQuizProgress("quiz");
      assert.equal(readQuizProgress("quiz"), null);
    }
    globalThis.window = { sessionStorage: blocked, localStorage: blocked } as unknown as Window & typeof globalThis;
    assert.equal(writeQuizProgress("quiz", "next-state"), false);
    assert.equal(readQuizProgress("quiz"), null);
  } finally {
    if (original === undefined) delete (globalThis as {window?: Window}).window;
    else globalThis.window = original;
  }
});
