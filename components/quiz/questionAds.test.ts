import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { expandQuizLocale } from "../../scripts/quiz-schema-v2.mjs";
import { scoreQuiz } from "./scoring.ts";
import type { Quiz } from "../../lib/quizzes.ts";

test("display-ad components and request code are absent site-wide", () => {
  assert.equal(fs.existsSync("components/quiz/QuestionDisplayAd.tsx"), false);
  for (const directory of ["components", "lib", "app"]) {
    for (const path of fs.readdirSync(directory, { recursive: true })) {
      if (typeof path !== "string" || !/\.(tsx?|jsx?)$/.test(path) || path.endsWith(".test.ts")) continue;
      assert.doesNotMatch(fs.readFileSync(`${directory}/${path}`, "utf8"), /mountDisplayAd|QuestionDisplayAd|data-display-ad|defineSlot|displayAdUnitPath|22677279144\/display/, `${directory}/${path}`);
    }
  }
});
test("Mechanic uses the automatic rewarded-only flow", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/mechanic/quiz.json", "utf8"));
  assert.equal(manifest.template, "single-stage-rewarded-v1");
  assert.equal(manifest.engine.hardRefreshCheckpoints, false);
  assert.equal(manifest.structure.stages.length, 1);
  assert.equal(manifest.structure.stages[0].questionIds.length,10);
  assert.equal(manifest.engine.targetRatio, 0.8);
});
test("only the rewarded ad unit is configured", () => {
  const config = fs.readFileSync("lib/siteConfig.ts", "utf8");
  assert.match(config, /rewardedAdUnitPath: "\/22677279144\/rewarded"/);
  assert.doesNotMatch(config, /displayAdUnitPath|22677279144\/display/);
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
test("both quizzes use ten unique questions and one result checkpoint", () => {
  for (const slug of ["memory", "years-left"]) {
    const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, "utf8"));
    const copy = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/en.json`, "utf8"));
    assert.equal(copy.landing.intro.split("\n").length, 2);
    assert.doesNotMatch(copy.landing.intro, /30|thirty/i);
    const stages = 1;
    assert.equal(manifest.structure.stages.length, stages);
    const ids = manifest.structure.stages.flatMap((stage: { questionIds: string[] }) => stage.questionIds);
    assert.equal(ids.length, 10);
    assert.equal(new Set(ids).size, 10);
    assert.equal(Object.keys(copy.career.stages).length, stages);
    assert.equal(copy.career.stages[`stage-${stages}`].next, undefined);
    assert.ok(expandQuizLocale(manifest,copy,'en').career.stages[0].preAdButton.trim());
    assert.equal(manifest.template, "single-stage-rewarded-v1");
    assert.equal(manifest.structure.stages[0].questionIds.length,10);
  }
});

test("Memory retains recall prerequisites and an eight-answer pass target", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/memory/quiz.json", "utf8"));
  const copy = JSON.parse(fs.readFileSync("data/quizzes/memory/en.json", "utf8"));
  const ids = manifest.structure.stages.flatMap((stage: { questionIds: string[] }) => stage.questionIds);
  assert.equal(ids.length, 10);
  assert.equal(ids.length * manifest.engine.targetRatio, 8);
  const questions = Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));
  for (const [board, recalls] of [
    ["memory-r1q1", ["memory-r1q4", "memory-r5q2"]],
    ["memory-r3q1", ["memory-r3q7"]],
    ["memory-r4q1", ["memory-r5q4"]],
  ] as const) {
    assert.ok(questions[board].study);
    for (const recall of recalls) assert.ok(ids.indexOf(board) >= 0 && ids.indexOf(board) < ids.indexOf(recall), recall);
  }
  assert.ok(ids.indexOf("memory-r1q1") < ids.indexOf("memory-r1q4"));
  assert.ok(questions["memory-r1q1"].study.items.includes("PURPLE ELEPHANT"));
  assert.equal(questions["memory-r1q4"].answers[manifest.structure.questions["memory-r1q4"].correctAnswerId], "Elephant");
  assert.ok(ids.indexOf("memory-r4q1") < ids.indexOf("memory-r5q4"));
  const pairs = questions["memory-r4q1"].study.items;
  assert.ok(pairs.some((pair: string) => /SCARF/i.test(pair)));
  assert.equal(questions["memory-r5q4"].answers[manifest.structure.questions["memory-r5q4"].correctAnswerId], "Violin");
});

test("Memory retained recall answers are supported by the boards and not revealed in prompts", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/memory/quiz.json", "utf8"));
  const copy = JSON.parse(fs.readFileSync("data/quizzes/memory/en.json", "utf8"));
  const questions = Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));
  const board=questions["memory-r4q1"].study.items;
  assert.ok(board.includes("MIA · VIOLIN"));
  assert.equal(questions["memory-r5q4"].answers[manifest.structure.questions["memory-r5q4"].correctAnswerId],"Violin");
  assert.doesNotMatch(questions["memory-r5q4"].question,/Violin/i);
  assert.ok(questions["memory-r1q1"].study.items.includes("TRAIN · 6"));
  assert.equal(questions["memory-r5q2"].answers[manifest.structure.questions["memory-r5q2"].correctAnswerId],"6");
  assert.doesNotMatch(questions["memory-r5q2"].question,/\b6\b/);
});

test("Years Left keeps each choice's score and calibration regardless of answer order", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/years-left/quiz.json", "utf8"));
  const copy = JSON.parse(fs.readFileSync("data/quizzes/years-left/en.json", "utf8"));
  const originalOrder = structuredClone(manifest);
  for (const question of Object.values(originalOrder.structure.questions) as { answerIds: string[] }[]) question.answerIds.sort();
  const expanded = expandQuizLocale(manifest, copy, "en");
  const baseline = expandQuizLocale(originalOrder, copy, "en");
  const questions = expanded.stages.flatMap((stage: { questions: any[] }) => stage.questions);
  const questionCopy = Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));
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
