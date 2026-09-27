import assert from "node:assert/strict";
import test from "node:test";
import { getQuizNavigationHref, quizProgressSignaturesMatch, readQuizProgress, removeQuizProgress, writeQuizProgress } from "./quizNavigation.ts";

test("changing checkpoint navigation preserves an existing attempt but changing questions does not", () => {
  const previous = { engine: { hardRefreshCheckpoints: false, scoring: "correct" }, questions: ["q1"] };
  const next = { ...previous, engine: { ...previous.engine, hardRefreshCheckpoints: true } };
  assert.equal(quizProgressSignaturesMatch(JSON.stringify(previous), JSON.stringify(next)), true);
  assert.equal(quizProgressSignaturesMatch(JSON.stringify(previous), JSON.stringify({ ...next, questions: ["q2"] })), false);
  assert.equal(quizProgressSignaturesMatch("broken", JSON.stringify(next)), false);
});

test("hard quiz links retain attribution and replace only the transition parameter", () => {
  assert.equal(getQuizNavigationHref("/fr/memory", "?fbclid=abc&quizStep=start&utm_source=meta", "stage-2"), "/fr/memory?fbclid=abc&quizStep=stage-2&utm_source=meta");
  assert.equal(getQuizNavigationHref("", "", "start"), "?quizStep=start");
});

test("progress survives a reload with either storage backend, and failure is explicit", () => {
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
    if (original === undefined) delete (globalThis as { window?: Window }).window;
    else globalThis.window = original;
  }
});
