import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { answerPopupQuestion, createPopupQuestionProgress, getCurrentPopupQuestion, getPopupAudienceStatus, isArticlePopupQuestions, isPopupQuestionProgress, restorePopupQuestionProgress } from "../gallery/popupQuestions.ts";
import { getArticlePopupBootstrapScript } from "../gallery/galleryPopup.ts";

const gallery = JSON.parse(fs.readFileSync("data/galleries/memory-test.json", "utf8"));
const config = gallery.landing.followUpQuestions;

test("memory-test keeps five personal questions; only mobilityscooter adds the adult-confirmed guide flow", () => {
  assert(isArticlePopupQuestions(config));
  assert.equal(config.questionCount, 5);
  assert.equal(config.questions.length, 10);
  for (const question of config.questions) {
    assert.equal(question.choices.length, 3, `${question.id} must have exactly three answers`);
  }
  for (const filename of fs.readdirSync("data/galleries").filter(file => file.endsWith(".json"))) {
    const value = JSON.parse(fs.readFileSync(`data/galleries/${filename}`, "utf8"));
    if (!["memory-test", "mobilityscooter"].includes(value.slug)) assert.equal(value.landing.followUpQuestions, undefined, filename);
  }
  assert.match(config.instruction, /Personal questions are optional/);
  assert.deepEqual(config.requiredQuestionIds, ["gender", "self-rated-smarts"]);
  assert.equal(config.readyTitle, "Your Quiz Is Ready");
  assert.equal(config.cta, gallery.landing.cta);
  assert.doesNotMatch(JSON.stringify(config), /article|introduction/i);
  for (const id of config.requiredQuestionIds) {
    assert(config.questions.find(question => question.id === id).choices.some(choice => choice.id === "skip"));
  }
  assert.doesNotMatch(JSON.stringify(config), /correctAnswer|score|email|diagnos/i);
});

const mobility = JSON.parse(fs.readFileSync("data/galleries/mobilityscooter.json", "utf8"));
const mobilityQuestions = mobility.landing.followUpQuestions;

test("mobility popup asks age, gender, adult confirmation and content preference without guide-specific copy", () => {
  assert(isArticlePopupQuestions(mobilityQuestions));
  assert.equal(mobilityQuestions.questionCount, 4);
  assert.deepEqual(createPopupQuestionProgress(mobilityQuestions).questionIds, ["age-range", "gender", "adult-confirmation", "content-interest"]);
  assert(mobilityQuestions.questions.find((q: any) => q.id === "gender").choices.some((c: any) => c.id === "skip"));
  assert.doesNotMatch(JSON.stringify(mobilityQuestions), /guide|funding|application|eligibility|No further questions or ads/i);
  assert.equal(mobilityQuestions.questions.find((q: any) => q.id === "content-interest").prompt, "What type of content are you interested in?");
  assert.equal(mobilityQuestions.readyTitle, "Your Content Is Ready");
  assert.equal(mobilityQuestions.cta, "View Content");
  assert.match(mobilityQuestions.adNote, /Watch one short ad/);
});

test("extra mobility reward requires both an adult age range and explicit confirmation", () => {
  let progress = createPopupQuestionProgress(mobilityQuestions);
  assert.equal(getPopupAudienceStatus(mobilityQuestions, progress), "unconfirmed");
  progress = answerPopupQuestion(mobilityQuestions, progress, "age-range", "65-plus");
  progress = answerPopupQuestion(mobilityQuestions, progress, "gender", "skip");
  assert.equal(getPopupAudienceStatus(mobilityQuestions, progress), "unconfirmed");
  progress = answerPopupQuestion(mobilityQuestions, progress, "adult-confirmation", "confirmed-adult");
  assert.equal(getPopupAudienceStatus(mobilityQuestions, progress), "adult");
  assert.equal(getCurrentPopupQuestion(mobilityQuestions, progress)?.id, "content-interest");
  progress = answerPopupQuestion(mobilityQuestions, progress, "content-interest", "everything");
  assert.equal(getCurrentPopupQuestion(mobilityQuestions, progress), undefined);
});

test("appending a content question preserves prior answers and underage decisions", () => {
  const oldIds = ["age-range", "gender", "adult-confirmation"];
  for (const answers of [
    {"age-range": "under-18"},
    {"age-range": "18-64", gender: "skip", "adult-confirmation": "under-18"},
    {"age-range": "65-plus", gender: "skip", "adult-confirmation": "confirmed-adult"},
  ]) {
    const restored = restorePopupQuestionProgress(mobilityQuestions, {questionIds: oldIds, answers});
    assert(restored);
    assert.deepEqual(restored.answers, answers);
    assert.equal(restored.questionIds.length, 4);
    assert.equal(getPopupAudienceStatus(mobilityQuestions, restored), answers["adult-confirmation"] === "confirmed-adult" ? "adult" : "restricted");
  }
  assert.equal(restorePopupQuestionProgress(mobilityQuestions, {questionIds: ["gender", "age-range", "adult-confirmation"], answers: {}}), null);
  assert.equal(restorePopupQuestionProgress(mobilityQuestions, {questionIds: oldIds, answers: {"content-interest": "everything"}}), null);
});

test("an underage or unconfirmed answer ends the extra flow, including after restoring progress", () => {
  for (const answer of ["under-18", "skip"]) {
    let progress = createPopupQuestionProgress(mobilityQuestions);
    progress = answerPopupQuestion(mobilityQuestions, progress, "age-range", "18-64");
    progress = answerPopupQuestion(mobilityQuestions, progress, "gender", "skip");
    progress = answerPopupQuestion(mobilityQuestions, progress, "adult-confirmation", answer);
    assert.equal(getPopupAudienceStatus(mobilityQuestions, progress), "restricted");
    assert.equal(getCurrentPopupQuestion(mobilityQuestions, progress), undefined);
  }
  const initial = createPopupQuestionProgress(mobilityQuestions);
  const minor = answerPopupQuestion(mobilityQuestions, initial, "age-range", "under-18");
  assert(isPopupQuestionProgress(mobilityQuestions, minor));
  assert.equal(getPopupAudienceStatus(mobilityQuestions, JSON.parse(JSON.stringify(minor))), "restricted");
  assert.equal(getCurrentPopupQuestion(mobilityQuestions, minor), undefined);
  assert.equal(answerPopupQuestion(mobilityQuestions, minor, "gender", "woman"), minor);
});

test("adult-gate config rejects missing questions, invalid allowed answers and incomplete exit copy", () => {
  for (const mutate of [
    (c: any) => { c.adultOnly.requirements[0].questionId = "unknown"; },
    (c: any) => { c.adultOnly.requirements[0].allowedAnswerIds = ["unknown"]; },
    (c: any) => { c.requiredQuestionIds = ["gender", "adult-confirmation"]; },
    (c: any) => { c.adultOnly.exitCopy = ""; },
  ]) {
    const invalid = structuredClone(mobilityQuestions);
    mutate(invalid);
    assert.equal(isArticlePopupQuestions(invalid), false);
  }
});

test("popup configuration rejects invalid counts, duplicate IDs and incomplete UI copy", () => {
  for (const count of [0, -1, 1.5, 11]) assert.equal(isArticlePopupQuestions({ ...config, questionCount: count }), false);
  assert.equal(isArticlePopupQuestions({ ...config, questions: [config.questions[0], ...config.questions.slice(1, -1), config.questions[0]] }), false);
  const duplicateAnswers = structuredClone(config);
  duplicateAnswers.questions[0].choices[1].id = duplicateAnswers.questions[0].choices[0].id;
  assert.equal(isArticlePopupQuestions(duplicateAnswers), false);
  assert.equal(isArticlePopupQuestions({ ...config, readyTitle: "" }), false);
  assert.equal(isArticlePopupQuestions({ ...config, progressLabel: "Questions" }), false);
  assert.equal(isArticlePopupQuestions({ ...config, requiredQuestionIds: ["unknown"] }), false);
  assert.equal(isArticlePopupQuestions({ ...config, requiredQuestionIds: ["gender", "gender"] }), false);
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
    assert.deepEqual(progress.questionIds.slice(0, 2), config.requiredQuestionIds);
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
