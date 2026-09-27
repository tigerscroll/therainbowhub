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
      assert.doesNotMatch(fs.readFileSync(`${directory}/${path}`, "utf8"), /mountDisplayAd|QuestionDisplayAd|data-display-ad|defineSlot|displayAdUnitPath/, `${directory}/${path}`);
    }
  }
});
test("Mechanic uses automatic questions with hard checkpoint navigation", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/mechanic/quiz.json", "utf8"));
  assert.equal(manifest.template, "ten-stage-seven-question-v1");
  assert.equal(manifest.engine.hardRefreshCheckpoints, true);
  assert.equal(manifest.structure.stages.length, 10);
  assert.equal(manifest.structure.stages[0].questionIds.length,7);
  assert.equal(manifest.engine.targetRatio, 0.8);
});
test("quiz interstitials use display while article rewarded ads keep their placement", () => {
  const config = fs.readFileSync("lib/siteConfig.ts", "utf8");
  assert.match(config, /rewardedAdUnitPath: "\/22677279144\/rewarded"/);
  assert.match(config, /quizInterstitialAdUnitPath: "\/22677279144\/display"/);
  const articleGate = fs.readFileSync("components/experience/useRewardedGate.ts", "utf8");
  assert.match(articleGate, /adUnitPath: siteConfig.rewardedAdUnitPath/);
});
test("quizzes save state and reload at checkpoint boundaries", () => {
  const source = fs.readFileSync("components/quiz/QuizEngine.tsx", "utf8");
  assert.match(source, /window\.location\.assign\(getQuizNavigationHref/);
  assert.match(source, /if \(reloadAtCheckpoint\(/);
  assert.doesNotMatch(source, /hardRefreshCheckpoints && reloadAtCheckpoint/);
});
test("interstitials are scoped to the quiz engine and use their own placement", () => {
  const engine = fs.readFileSync("components/quiz/QuizEngine.tsx", "utf8");
  const runtime = fs.readFileSync("components/quiz/QuizInterstitial.tsx", "utf8");
  assert.match(engine, /useQuizInterstitial\(\)/);
  assert.doesNotMatch(engine, /useRewardedGate|runRewardedGate|requestRewardedAd/);
  assert.match(runtime, /siteConfig.quizInterstitialAdUnitPath/);
  assert.match(runtime, /OutOfPageFormat\?\.INTERSTITIAL/);
  assert.match(runtime, /data-google-interstitial/);
  assert.match(runtime, /navBar: false, unhideWindow: false, inactivity: false/);
  for (const path of ["components/RootDocument.tsx", "components/article/ArticleExperience.tsx"]) {
    assert.doesNotMatch(fs.readFileSync(path, "utf8"), /useQuizInterstitial|INTERSTITIAL/);
  }
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
  const calibrationId = Object.keys(manifest.structure.questions).find(id => manifest.structure.questions[id].calibration)!;
  assert.deepEqual(manifest.structure.questions[calibrationId].calibration, { a1: -1, a2: -0.25, a3: 0.5, a4: 1 });
  assert.doesNotMatch(questionCopy[calibrationId].question, /how far|clock.*run/i);
});
