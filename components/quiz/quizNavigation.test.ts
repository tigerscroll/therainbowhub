import assert from "node:assert/strict";
import test from "node:test";
import { getQuizAnswerDestination, getQuizNavigationHref, quizProgressSignaturesMatch, readQuizHistoryProgress, readQuizProgress, removeQuizProgress, writeQuizHistoryProgress, writeQuizProgress } from "./quizNavigation.ts";

test("answer links advance exactly once and preserve checkpoint/final destinations", () => {
  const questions = Array.from({ length: 70 }, (_, index) => ({ stage: Math.floor(index / 7) }));
  for (let index = 0; index < questions.length; index++) {
    const destination = getQuizAnswerDestination(questions, index, true);
    assert.equal(destination.questionIndex, Math.min(index + 1, 69));
    assert.equal(destination.screen, index === 69 ? "preparing" : index % 7 === 6 ? "checkpoint" : "question");
    assert.equal(destination.transition, index % 7 === 6 ? `checkpoint-${Math.floor(index / 7) + 1}` : `question-${index + 2}`);
  }
  assert.equal(getQuizAnswerDestination(questions, 6, false).screen, "question");
  assert.throws(() => getQuizAnswerDestination(questions, 70, true));
});

test("changing checkpoint navigation preserves an existing attempt but changing questions does not", () => {
  const previous = { engine: { hardRefreshCheckpoints: false, scoring: "correct" }, questions: ["q1"] };
  const next = { ...previous, engine: { ...previous.engine, hardRefreshCheckpoints: true } };
  assert.equal(quizProgressSignaturesMatch(JSON.stringify(previous), JSON.stringify(next)), true);
  assert.equal(quizProgressSignaturesMatch(JSON.stringify(previous), JSON.stringify({ ...next, questions: ["q2"] })), false);
  assert.equal(quizProgressSignaturesMatch("broken", JSON.stringify(next)), false);
});

test("quiz links retain attribution and replace only the transition parameter", () => {
  assert.equal(getQuizNavigationHref("/fr/memory", "?fbclid=abc&quizStep=start&utm_source=meta", "stage-2"), "/fr/memory?fbclid=abc&quizStep=stage-2&utm_source=meta");
  assert.equal(getQuizNavigationHref("", "", "start"), "?quizStep=start");
});

test("SPA history preserves snapshots, isolates quizzes and tolerates denied history", () => {
  const original = globalThis.window;
  const history = {
    state: {} as unknown,
    pushState(state: unknown, _title: string, _url: string) { this.state = structuredClone(state); },
    replaceState(state: unknown, _title: string, _url: string) { this.state = structuredClone(state); },
  };
  try {
    globalThis.window = {history, location: {href: 'https://example.test/years-left'}} as unknown as Window & typeof globalThis;
    assert.equal(readQuizHistoryProgress('years-left:en'), undefined);
    const snapshot = {questionIndex: 1, answers: {q1: 'a2'}};
    assert.equal(writeQuizHistoryProgress('years-left:en', snapshot, '?quizStep=question-2'), true);
    snapshot.answers.q1 = 'a3';
    assert.deepEqual(readQuizHistoryProgress('years-left:en'), {questionIndex: 1, answers: {q1: 'a2'}});
    assert.equal(readQuizHistoryProgress('memory:en'), undefined);
    assert.equal(writeQuizHistoryProgress('years-left:en', null, '?quizStep=start', true), true);
    assert.equal(readQuizHistoryProgress('years-left:en'), null);
    history.pushState = () => { throw Error('history denied'); };
    assert.equal(writeQuizHistoryProgress('years-left:en', snapshot), false);
  } finally {
    if (original === undefined) delete (globalThis as {window?: Window}).window;
    else globalThis.window = original;
  }
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
