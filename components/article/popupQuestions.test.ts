import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { answerPopupQuestion, createPopupQuestionProgress, getCurrentPopupQuestion, isArticlePopupQuestions, isPopupQuestionProgress } from "../gallery/popupQuestions.ts";
import { getArticlePopupBootstrapScript } from "../gallery/galleryPopup.ts";

const gallery = JSON.parse(fs.readFileSync("data/galleries/memory-test.json", "utf8"));
const config = gallery.landing.followUpQuestions;

test("only memory-test opts into the five-question popup; questions are generic non-scored choices", () => {
  assert(isArticlePopupQuestions(config));
  assert.equal(config.questionCount, 5);
  assert.equal(config.questions.length, 10);
  for (const filename of fs.readdirSync("data/galleries").filter(file => file.endsWith(".json"))) {
    const value = JSON.parse(fs.readFileSync(`data/galleries/${filename}`, "utf8"));
    if (value.slug !== "memory-test") assert.equal(value.landing.followUpQuestions, undefined, filename);
  }
  assert.match(config.instruction, /no right or wrong answers/);
  assert.doesNotMatch(JSON.stringify(config), /correctAnswer|score|email|diagnos/i);
});

test("popup configuration rejects invalid counts, duplicate IDs and incomplete UI copy", () => {
  for (const count of [0, -1, 1.5, 11]) assert.equal(isArticlePopupQuestions({ ...config, questionCount: count }), false);
  assert.equal(isArticlePopupQuestions({ ...config, questions: [config.questions[0], ...config.questions.slice(1, -1), config.questions[0]] }), false);
  const duplicateAnswers = structuredClone(config);
  duplicateAnswers.questions[0].choices[1].id = duplicateAnswers.questions[0].choices[0].id;
  assert.equal(isArticlePopupQuestions(duplicateAnswers), false);
  assert.equal(isArticlePopupQuestions({ ...config, readyTitle: "" }), false);
  assert.equal(isArticlePopupQuestions({ ...config, progressLabel: "Questions" }), false);
});

test("random selection picks exactly five distinct questions without mutating the bank", () => {
  const original = JSON.stringify(config);
  const first = createPopupQuestionProgress(config, () => 0);
  const second = createPopupQuestionProgress(config, () => .999);
  assert.notDeepEqual(first.questionIds, second.questionIds);
  for (let attempt = 0; attempt < 100; attempt++) {
    const progress = createPopupQuestionProgress(config);
    assert.equal(progress.questionIds.length, 5);
    assert.equal(new Set(progress.questionIds).size, 5);
    assert(isPopupQuestionProgress(config, progress));
    assert.equal(Object.keys(progress.answers).length, 0);
  }
  assert.equal(JSON.stringify(config), original);
});

test("answers use stable IDs, restore exactly and finish only after all five picks", () => {
  let progress = createPopupQuestionProgress(config, () => 0);
  const ids = [...progress.questionIds];
  for (let index = 0; index < 5; index++) {
    const question = getCurrentPopupQuestion(config, progress)!;
    assert.equal(question.id, ids[index]);
    const answerId = question.choices[2].id;
    progress = answerPopupQuestion(config, progress, question.id, answerId);
    assert.equal(progress.answers[question.id], answerId);
    assert(isPopupQuestionProgress(config, progress));
    assert.deepEqual(JSON.parse(JSON.stringify(progress)), progress);
    assert.equal(Object.keys(progress.answers).length, index + 1);
  }
  assert.equal(getCurrentPopupQuestion(config, progress), undefined);
  assert.equal(answerPopupQuestion(config, progress, ids[0], "wrong"), progress);
});

test("stale or duplicate answer events cannot advance a different question", () => {
  const initial = createPopupQuestionProgress(config, () => 0);
  const question = getCurrentPopupQuestion(config, initial)!;
  assert.equal(answerPopupQuestion(config, initial, question.id, "not-an-answer"), initial);
  const answered = answerPopupQuestion(config, initial, question.id, question.choices[0].id);
  assert.equal(answerPopupQuestion(config, answered, question.id, question.choices[1].id), answered);
  assert.equal(Object.keys(answered.answers).length, 1);
});

test("corrupted or reordered saved progress is rejected", () => {
  const initial = createPopupQuestionProgress(config, () => 0);
  const question = getCurrentPopupQuestion(config, initial)!;
  assert.equal(isPopupQuestionProgress(config, { ...initial, questionIds: ["unknown", ...initial.questionIds.slice(1)] }), false);
  assert.equal(isPopupQuestionProgress(config, { ...initial, answers: { [question.id]: "wrong" } }), false);
  const later = config.questions.find((item: { id: string }) => item.id === initial.questionIds[1]);
  assert.equal(isPopupQuestionProgress(config, { ...initial, answers: { [later.id]: later.choices[0].id } }), false);
  assert.equal(isPopupQuestionProgress(config, { ...initial, answers: { extra: "answer" } }), false);
  assert.equal(isPopupQuestionProgress(config, null), false);
});

test("first-paint bootstrap keeps pending questions inside the popup but respects completed unlocks", () => {
  for (const [entry, followUp, article, expected] of [
    [null, null, null, "popup"], ["1", null, null, "popup"],
    ["1", "1", null, "intro"], ["1", null, "1", "intro"],
  ]) {
    let visible = "";
    const saved = { entry, followUp, article };
    runInNewContext(getArticlePopupBootstrapScript("entry", "followUp", "article"), {
      URLSearchParams,
      document: { currentScript: { parentElement: { setAttribute(_name: string, value: string) { visible = value; } } } },
      window: { location: { search: "?fbclid=abc" }, sessionStorage: { getItem(key: keyof typeof saved) { return saved[key]; } } },
    });
    assert.equal(visible, expected);
  }
});
