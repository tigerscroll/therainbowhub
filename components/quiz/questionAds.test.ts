import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { usesQuestionAds } from "./questionAds.ts";
import { expandQuizLocale } from "../../scripts/quiz-schema-v2.mjs";
import { scoreQuiz } from "./scoring.ts";
import type { Quiz } from "../../lib/quizzes.ts";

test("question display ads are restricted to Memory", () => {
  assert.equal(usesQuestionAds("memory"), true);
  assert.equal(usesQuestionAds("years-left"), false);
  for (const slug of ["iq", "vision", "oxford", "memory-other", ""]) assert.equal(usesQuestionAds(slug), false);
});
test("rewarded and display use their own configured ad units", () => {
  const config = fs.readFileSync("lib/siteConfig.ts", "utf8");
  assert.match(config, /rewardedAdUnitPath: "\/22677279144\/rewarded"/);
  assert.match(config, /displayAdUnitPath: "\/22677279144\/display"/);
});
test("Memory and Years Left reveal results without reloading", () => {
  for (const slug of ["memory", "years-left"]) {
    const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, "utf8"));
    assert.equal(manifest.engine.hardRefreshCheckpoints, false);
  }
});
test("interstitial code is absent throughout the application", () => {
  for (const directory of ["components", "lib", "app"]) {
    for (const path of fs.readdirSync(directory, { recursive: true })) {
      if (typeof path !== "string" || !/\.(tsx?|jsx?)$/.test(path) || path.endsWith(".test.ts")) continue;
      assert.doesNotMatch(fs.readFileSync(`${directory}/${path}`, "utf8"), /interstitial/i, `${directory}/${path}`);
    }
  }
});
test("both quizzes retain 30 unique questions and their intended round structures", () => {
  for (const slug of ["memory", "years-left"]) {
    const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, "utf8"));
    const copy = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/en.json`, "utf8"));
    assert.equal(copy.landing.intro.split("\n").length, 2);
    assert.doesNotMatch(copy.landing.intro, /30|thirty/i);
    const stages = slug === "memory" ? 1 : 5;
    assert.equal(manifest.structure.stages.length, stages);
    const ids = manifest.structure.stages.flatMap((stage: { questionIds: string[] }) => stage.questionIds);
    assert.equal(ids.length, 30);
    assert.equal(new Set(ids).size, 30);
    assert.equal(Object.keys(copy.career.stages).length, stages);
    assert.equal(copy.career.stages[`stage-${stages}`].next, undefined);
    assert.equal(copy.career.stages[`stage-${stages}`].preAdChecks[0], "30 answers checked");
    if (slug === "years-left") {
      assert.equal(manifest.template, "five-stage-six-question-v1");
      assert.ok(manifest.structure.stages.every((stage: { questionIds: string[] }) => stage.questionIds.length === 6));
    }
  }
});

test("Memory retains recall prerequisites and a 24-answer pass target", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/memory/quiz.json", "utf8"));
  const copy = JSON.parse(fs.readFileSync("data/quizzes/memory/en.json", "utf8"));
  const ids = manifest.structure.stages[0].questionIds;
  assert.equal(ids.length, 30);
  assert.equal(ids.length * manifest.engine.targetRatio, 24);
  const questions = copy.stages["stage-1"].questions;
  for (const [board, recalls] of [
    ["memory-r1q1", ["memory-r1q4", "memory-r1q8", "memory-r5q1", "memory-r5q2", "memory-r5q8"]],
    ["memory-r3q1", ["memory-r3q7", "memory-r3q8", "memory-r5q3", "memory-r5q6", "memory-r5q8"]],
    ["memory-r4q1", ["memory-r4q3", "memory-r4q5", "memory-r4q6", "memory-r5q4"]],
  ] as const) {
    assert.ok(questions[board].study);
    for (const recall of recalls) assert.ok(ids.indexOf(board) >= 0 && ids.indexOf(board) < ids.indexOf(recall), recall);
  }
  assert.ok(ids.indexOf("memory-r1q1") < ids.indexOf("memory-r1q4"));
  assert.ok(questions["memory-r1q1"].study.items.includes("PURPLE ELEPHANT"));
  assert.equal(questions["memory-r1q4"].answers[manifest.structure.questions["memory-r1q4"].correctAnswerId], "Elephant");
  assert.ok(ids.indexOf("memory-r4q1") < ids.indexOf("memory-r4q6"));
  const pairs = questions["memory-r4q1"].study.items;
  assert.ok(pairs.some((pair: string) => /SCARF/i.test(pair)));
  assert.equal(questions["memory-r4q6"].answers[manifest.structure.questions["memory-r4q6"].correctAnswerId], "Lena — Compass");
});

test("Memory replacements have exactly one board-supported answer and do not reveal it in the prompt", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/memory/quiz.json", "utf8"));
  const questions = JSON.parse(fs.readFileSync("data/quizzes/memory/en.json", "utf8")).stages["stage-1"].questions;
  const pairs = questions["memory-r4q1"].study.items.map((item: string) => item.toLowerCase().replace(" · ", " — "));
  const pairQuestion = questions["memory-r4q6"];
  const supported = Object.entries(pairQuestion.answers).filter(([, label]) => pairs.includes(String(label).toLowerCase()));
  assert.deepEqual(supported.map(([id]) => id), [manifest.structure.questions["memory-r4q6"].correctAnswerId]);
  assert.doesNotMatch(pairQuestion.question, /Lena|Compass/i);
  assert.match(questions["memory-r4q1"].study.instruction, /order/);
  const names = pairs.map((pair: string) => pair.split(" — ")[0]);
  assert.equal(questions["memory-r4q3"].answers[manifest.structure.questions["memory-r4q3"].correctAnswerId].toLowerCase(), names[names.indexOf("noah") - 1]);
  assert.doesNotMatch(questions["memory-r4q3"].question, /Lena|third/i);
  assert.equal(manifest.structure.stages[0].questionIds.at(-1), "memory-r5q8");
  const final = questions["memory-r5q8"];
  assert.equal(final.answers[manifest.structure.questions["memory-r5q8"].correctAnswerId], "Silver kite · train 6 · window seat");
  assert.ok(questions["memory-r1q1"].study.items.includes("SILVER KITE"));
  assert.ok(questions["memory-r1q1"].study.items.includes("TRAIN · 6"));
  assert.ok(questions["memory-r3q1"].study.items.includes("TICKET · WINDOW SEAT"));
  assert.equal(Object.values(final.answers).filter(label => label === "Silver kite · train 6 · window seat").length, 1);
});

test("Years Left mixes stable answer positions evenly without changing scores or calibration", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/years-left/quiz.json", "utf8"));
  const copy = JSON.parse(fs.readFileSync("data/quizzes/years-left/en.json", "utf8"));
  const originalOrder = structuredClone(manifest);
  for (const question of Object.values(originalOrder.structure.questions) as { answerIds: string[] }[]) question.answerIds.sort();
  const expanded = expandQuizLocale(manifest, copy, "en");
  const baseline = expandQuizLocale(originalOrder, copy, "en");
  const questions = expanded.stages.flatMap((stage: { questions: any[] }) => stage.questions);
  const questionCopy = Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));
  for (const id of ["a1", "a2", "a3", "a4"]) {
    const positions = [0, 0, 0, 0];
    for (const q of questions) positions[q.answerIds.indexOf(id)]++;
    assert.ok(positions.every(count => count === 7 || count === 8), `${id}: ${positions}`);
  }
  for (const q of questions) {
    const logic = manifest.structure.questions[q.id];
    q.answerIds.forEach((id: string, index: number) => {
      const label = questionCopy[q.id].answers[id];
      assert.equal(Object.keys(q.answers)[index], label);
      assert.deepEqual(Object.values(q.answers)[index], logic.choiceMeanings[id]);
      if (logic.calibration) assert.equal(q.calibration[index], logic.calibration[id]);
    });
  }
  const asQuiz = (data: typeof expanded) => ({
    engine: { scoring: { type: "weighted-profile" }, estimate: manifest.engine.estimate },
    stages: data.stages.map((stage: { title: string }) => stage.title),
    questions: data.stages.flatMap((stage: { questions: typeof questions }, stageIndex: number) => stage.questions.map((q: typeof questions[number]) => ({
      id: q.id, stage: stageIndex, choiceIds: q.answerIds, choices: Object.keys(q.answers),
      choiceWeights: Object.values(q.answers), calibrationValues: q.calibration,
    }))),
    result: { profiles: data.results.profiles, scoreDimensions: data.results.dimensions.map((d: { label: string; profiles: string[] }) => ({ label: d.label, categories: d.profiles })) },
  }) as Quiz;
  const shuffledQuiz = asQuiz(expanded);
  const baselineQuiz = asQuiz(baseline);
  let seed = 317;
  for (let run = 0; run < 256; run++) {
    const chosenIds = questions.map(() => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return `a${1 + ((seed >>> 16) % 4)}`;
    });
    const answers = (quiz: Quiz) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.choiceIds!.indexOf(chosenIds[i])]));
    assert.deepEqual(scoreQuiz(shuffledQuiz, answers(shuffledQuiz)), scoreQuiz(baselineQuiz, answers(baselineQuiz)));
  }
  assert.deepEqual(manifest.structure.questions["yl-s5q8"].calibration, { a1: -1, a2: -0.25, a3: 0.5, a4: 1 });
  assert.doesNotMatch(questionCopy["yl-s5q8"].question, /how far|clock.*run/i);
});
